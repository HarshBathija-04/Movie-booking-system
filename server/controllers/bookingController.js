import QRCode from "qrcode";
import { query, withTransaction } from "../configs/db.js";
import { HttpError } from "../middleware/http.js";
import { MOVIE_COLS, SHOW_COLS } from "../utils/columns.js";
import generateBookingId from "../utils/generateBookingId.js";
import { totalFor } from "../utils/pricing.js";
import sendBookingEmail from "../utils/sendBookingEmail.js";

const BOOKING_SELECT = `
  SELECT b.id, b.booking_code AS "bookingCode", b.seats, b.seat_count AS "seatCount", b.amount,
         b.payment_status AS "paymentStatus", b.payment_method AS "paymentMethod",
         b.email_status AS "emailStatus", b.created_at AS "createdAt",
         (SELECT row_to_json(x) FROM (SELECT ${MOVIE_COLS}) x) AS movie,
         (SELECT row_to_json(x) FROM (SELECT ${SHOW_COLS}, s.starts_at <= now() AS "hasStarted") x) AS show
  FROM bookings b JOIN shows s ON s.id = b.show_id JOIN movies m ON m.id = s.movie_id`;

/**
 * Books seats atomically. The seat rows are locked with FOR UPDATE inside one transaction,
 * so a second buyer racing for the same seat blocks until the first commits and then sees it taken.
 */
export const reserveSeats = (userId, showId, seatNumbers) =>
  withTransaction(async (client) => {
    const {
      rows: [show],
    } = await client.query("SELECT id, ticket_price, starts_at <= now() AS started FROM shows WHERE id = $1", [showId]);
    if (!show) throw new HttpError(404, "Show not found", "not_found");
    if (show.started) throw new HttpError(409, "This show has already started", "show_started");

    const { rows: seats } = await client.query(
      `SELECT id, seat_number AS "seatNumber", category, booking_id FROM seats
       WHERE show_id = $1 AND seat_number = ANY ($2) ORDER BY id FOR UPDATE`,
      [showId, seatNumbers],
    );
    if (seats.length !== seatNumbers.length)
      throw new HttpError(400, "One or more seats do not exist", "invalid_seats");
    const taken = seats.filter((s) => s.booking_id !== null).map((s) => s.seatNumber);
    if (taken.length) {
      throw new HttpError(
        409,
        `Sorry, ${taken.join(", ")} ${taken.length > 1 ? "were" : "was"} just booked by someone else`,
        "seats_taken",
        { taken },
      );
    }

    const amount = totalFor(show.ticket_price, seats);
    const {
      rows: [booking],
    } = await client.query(
      `INSERT INTO bookings (booking_code, user_id, show_id, seats, seat_count, amount)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, booking_code`,
      [generateBookingId(), userId, showId, seatNumbers, seatNumbers.length, amount],
    );
    // booking_id IS NULL is a second guard on top of the row lock.
    const { rowCount } = await client.query(
      "UPDATE seats SET booking_id = $1 WHERE id = ANY ($2) AND booking_id IS NULL",
      [booking.id, seats.map((s) => s.id)],
    );
    if (rowCount !== seats.length) throw new HttpError(409, "Seats were just booked by someone else", "seats_taken");
    return { ...booking, amount };
  });

const fetchBooking = async (id, userId) => {
  const { rows } = await query(`${BOOKING_SELECT} WHERE b.id = $1 AND b.user_id = $2`, [id, userId]);
  return rows[0];
};

export const createBooking = async (req, res) => {
  const { showId, seats } = req.body;
  const created = await reserveSeats(req.user.id, showId, seats);
  const booking = await fetchBooking(created.id, req.user.id);

  // Email is best-effort and never blocks the booking.
  const { status } = await sendBookingEmail({ user: req.user, booking });
  if (status !== "not_configured") {
    await query("UPDATE bookings SET email_status = $1 WHERE id = $2", [status, created.id]);
    booking.emailStatus = status;
  }

  res.status(201).json({ success: true, booking });
};

export const getMyBookings = async (req, res) => {
  const { rows } = await query(`${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY s.starts_at DESC`, [req.user.id]);
  res.json({ success: true, bookings: rows });
};

export const getBookingById = async (req, res) => {
  const booking = await fetchBooking(req.valid.params.id, req.user.id);
  if (!booking) throw new HttpError(404, "Booking not found", "not_found");
  booking.qrCode = await QRCode.toDataURL(
    JSON.stringify({ code: booking.bookingCode, show: booking.show.id, seats: booking.seats }),
    { margin: 1, width: 240 },
  );
  res.json({ success: true, booking });
};
