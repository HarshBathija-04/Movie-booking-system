// Shared SELECT lists that map snake_case columns to the camelCase JSON the client uses.
export const USER_COLS = `id, name, email, phone, role, created_at AS "createdAt"`;

export const MOVIE_COLS = `
  m.id, m.title, m.slug, m.description, m.poster_url AS "posterUrl", m.banner_url AS "bannerUrl",
  m.genres, m.language, m.duration_minutes AS "durationMinutes", m.rating,
  to_char(m.release_date, 'YYYY-MM-DD') AS "releaseDate", m.cast_members AS "cast",
  m.trailer_url AS "trailerUrl", m.is_active AS "isActive"`;

// The cinema runs on India time; format there so every browser shows the same showtime.
export const SHOW_COLS = `
  s.id, s.movie_id AS "movieId", s.theater_name AS "theaterName", s.screen_name AS "screenName",
  s.starts_at AS "startsAt",
  to_char(s.starts_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS "showDate",
  to_char(s.starts_at AT TIME ZONE 'Asia/Kolkata', 'HH24:MI') AS "showTime",
  s.ticket_price AS "ticketPrice", s.format`;

export const SEAT_COUNT_COLS = `
  (SELECT count(*) FROM seats x WHERE x.show_id = s.id) AS "totalSeats",
  (SELECT count(*) FROM seats x WHERE x.show_id = s.id AND x.booking_id IS NOT NULL) AS "bookedSeatsCount"`;
