import { query, withTransaction } from "../configs/db.js";
import { HttpError } from "../middleware/http.js";
import { movieCols, seatCountCols, showCols } from "../utils/columns.js";
import createSeatLayout from "../utils/createSeatLayout.js";
import { categoryPrices } from "../utils/pricing.js";

const IST = "($1::date + $2::time) AT TIME ZONE 'Asia/Kolkata'";

export const getShows = async (req, res) => {
  const { movieId } = req.valid.query;
  const { rows } = await query(
    `SELECT ${showCols()}, ${seatCountCols()}, m.title AS "movieTitle", m.poster_url AS "moviePosterUrl"
     FROM shows s JOIN movies m ON m.id = s.movie_id
     WHERE s.starts_at > now() - interval '1 day' AND ($1::int IS NULL OR s.movie_id = $1)
     ORDER BY s.starts_at`,
    [movieId ?? null],
  );
  res.json({ success: true, shows: rows });
};

export const getShowById = async (req, res) => {
  const { id } = req.valid.params;
  const { rows } = await query(
    `SELECT ${showCols()}, s.starts_at <= now() AS "hasStarted",
            (SELECT row_to_json(x) FROM (SELECT ${movieCols()}) x) AS movie
     FROM shows s JOIN movies m ON m.id = s.movie_id WHERE s.id = $1`,
    [id],
  );
  if (!rows[0]) throw new HttpError(404, "Show not found", "not_found");

  const { rows: seats } = await query(
    `SELECT id, row_label AS "row", number, seat_number AS "seatNumber", category,
            booking_id IS NOT NULL AS "isBooked"
     FROM seats WHERE show_id = $1 ORDER BY row_label, number`,
    [id],
  );
  res.json({ success: true, show: { ...rows[0], prices: categoryPrices(rows[0].ticketPrice) }, seats });
};

export const createShow = async (req, res) => {
  const { movieId, theaterName, screenName, showDate, showTime, ticketPrice, totalSeats, format } = req.body;
  const show = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO shows (movie_id, theater_name, screen_name, starts_at, ticket_price, format)
       VALUES ($3, $4, $5, ${IST}, $6, $7) RETURNING id`,
      [showDate, showTime, movieId, theaterName, screenName, ticketPrice, format],
    );
    const layout = createSeatLayout().slice(0, totalSeats);
    await client.query(
      `INSERT INTO seats (show_id, row_label, number, seat_number, category)
       SELECT $1::int, * FROM unnest($2::text[], $3::int[], $4::text[], $5::text[])`,
      [
        rows[0].id,
        layout.map((s) => s.row),
        layout.map((s) => s.number),
        layout.map((s) => s.seatNumber),
        layout.map((s) => s.category),
      ],
    );
    return rows[0];
  });
  res.status(201).json({ success: true, show });
};

export const updateShow = async (req, res) => {
  const { theaterName, screenName, showDate, showTime, ticketPrice, format } = req.body;
  const { rows } = await query(
    `UPDATE shows SET theater_name=$3, screen_name=$4, starts_at=${IST}, ticket_price=$5, format=$6
     WHERE id = $7 RETURNING id`,
    [showDate, showTime, theaterName, screenName, ticketPrice, format, req.valid.params.id],
  );
  if (!rows[0]) throw new HttpError(404, "Show not found", "not_found");
  res.json({ success: true, show: rows[0] });
};

export const deleteShow = async (req, res) => {
  const { id } = req.valid.params;
  const { rows } = await query("SELECT 1 FROM bookings WHERE show_id = $1 LIMIT 1", [id]);
  if (rows[0]) throw new HttpError(409, "This show already has bookings and cannot be deleted", "conflict");
  const { rowCount } = await query("DELETE FROM shows WHERE id = $1", [id]);
  if (!rowCount) throw new HttpError(404, "Show not found", "not_found");
  res.json({ success: true });
};
