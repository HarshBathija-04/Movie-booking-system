import { query } from "../configs/db.js";
import { HttpError } from "../middleware/http.js";
import { MOVIE_COLS, SEAT_COUNT_COLS, SHOW_COLS } from "../utils/columns.js";

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getMovies = async (req, res) => {
  const { search, genre } = req.valid.query;
  const { rows } = await query(
    `SELECT ${MOVIE_COLS},
            min(s.starts_at) AS "nextShowAt",
            count(s.id) AS "upcomingShows",
            min(s.ticket_price) AS "priceFrom"
     FROM movies m
     LEFT JOIN shows s ON s.movie_id = m.id AND s.starts_at > now()
     WHERE m.is_active
       AND ($1::text IS NULL OR m.title ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR $2 = ANY (m.genres))
     GROUP BY m.id
     ORDER BY count(s.id) > 0 DESC, m.rating DESC, m.title`,
    [search || null, genre || null],
  );
  res.json({ success: true, movies: rows });
};

export const getMovieById = async (req, res) => {
  const { id } = req.valid.params;
  const { rows } = await query(`SELECT ${MOVIE_COLS} FROM movies m WHERE m.id = $1 AND m.is_active`, [id]);
  if (!rows[0]) throw new HttpError(404, "Movie not found", "not_found");

  const { rows: shows } = await query(
    `SELECT ${SHOW_COLS}, ${SEAT_COUNT_COLS} FROM shows s
     WHERE s.movie_id = $1 AND s.starts_at > now() ORDER BY s.starts_at`,
    [id],
  );
  res.json({ success: true, movie: rows[0], shows });
};

const movieValues = (b) => [
  b.title,
  b.description,
  b.posterUrl || null,
  b.bannerUrl || null,
  b.genres,
  b.language,
  b.durationMinutes,
  b.rating,
  b.releaseDate || null,
  b.cast,
  b.trailerUrl || null,
];

export const createMovie = async (req, res) => {
  const b = req.body;
  const { rows } = await query(
    `INSERT INTO movies (title, description, poster_url, banner_url, genres, language,
                         duration_minutes, rating, release_date, cast_members, trailer_url, slug)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [...movieValues(b), b.slug || slugify(b.title)],
  );
  res.status(201).json({ success: true, movie: rows[0] });
};

export const updateMovie = async (req, res) => {
  const { rows } = await query(
    `UPDATE movies SET title=$1, description=$2, poster_url=$3, banner_url=$4, genres=$5, language=$6,
            duration_minutes=$7, rating=$8, release_date=$9, cast_members=$10, trailer_url=$11
     WHERE id = $12 RETURNING id`,
    [...movieValues(req.body), req.valid.params.id],
  );
  if (!rows[0]) throw new HttpError(404, "Movie not found", "not_found");
  res.json({ success: true, movie: rows[0] });
};

// Soft delete: past bookings keep pointing at the movie.
export const deleteMovie = async (req, res) => {
  const { rowCount } = await query("UPDATE movies SET is_active = false WHERE id = $1", [req.valid.params.id]);
  if (!rowCount) throw new HttpError(404, "Movie not found", "not_found");
  res.json({ success: true });
};
