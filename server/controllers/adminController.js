import { query } from "../configs/db.js";

const ADMIN_BOOKING_SELECT = `
  SELECT b.id, b.booking_code AS "bookingCode", b.seats, b.seat_count AS "seatCount", b.amount,
         b.payment_status AS "paymentStatus", b.created_at AS "createdAt",
         json_build_object('name', u.name, 'email', u.email, 'phone', u.phone) AS "user",
         json_build_object('title', m.title, 'posterUrl', m.poster_url) AS movie,
         json_build_object('theaterName', s.theater_name, 'screenName', s.screen_name,
           'showDate', to_char(s.starts_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD'),
           'showTime', to_char(s.starts_at AT TIME ZONE 'Asia/Kolkata', 'HH24:MI')) AS show
  FROM bookings b
  JOIN users u ON u.id = b.user_id
  JOIN shows s ON s.id = b.show_id
  JOIN movies m ON m.id = s.movie_id
  ORDER BY b.created_at DESC`;

export const getDashboardData = async (req, res) => {
  const [
    {
      rows: [stats],
    },
    { rows: recentBookings },
  ] = await Promise.all([
    query(`SELECT
      (SELECT count(*) FROM users) AS "totalUsers",
      (SELECT count(*) FROM movies WHERE is_active) AS "totalMovies",
      (SELECT count(*) FROM shows WHERE starts_at > now()) AS "totalShows",
      (SELECT count(*) FROM bookings) AS "totalBookings",
      (SELECT coalesce(sum(amount), 0) FROM bookings WHERE payment_status = 'paid') AS "totalRevenue",
      (SELECT coalesce(sum(seat_count), 0) FROM bookings) AS "totalTicketsSold"`),
    query(`${ADMIN_BOOKING_SELECT} LIMIT 5`),
  ]);
  res.json({ success: true, stats, recentBookings });
};

// shortcut: capped at 500 rows, add pagination if the admin table ever needs more.
export const getAllBookings = async (req, res) => {
  const { rows } = await query(`${ADMIN_BOOKING_SELECT} LIMIT 500`);
  res.json({ success: true, bookings: rows });
};
