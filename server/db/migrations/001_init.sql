-- Runs inside the app schema (search_path is set by the migration runner).

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movies (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT NOT NULL,
  poster_url       TEXT,
  banner_url       TEXT,
  genres           TEXT[] NOT NULL DEFAULT '{}',
  language         TEXT NOT NULL DEFAULT 'English',
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  rating           NUMERIC(3, 1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 10),
  release_date     DATE,
  cast_members     TEXT[] NOT NULL DEFAULT '{}',
  trailer_url      TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shows (
  id           SERIAL PRIMARY KEY,
  movie_id     INTEGER NOT NULL REFERENCES movies (id) ON DELETE CASCADE,
  theater_name TEXT NOT NULL,
  screen_name  TEXT NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  ticket_price INTEGER NOT NULL CHECK (ticket_price >= 0),
  format       TEXT NOT NULL DEFAULT '2D',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- one screen cannot run two shows at the same moment
  UNIQUE (theater_name, screen_name, starts_at)
);
CREATE INDEX IF NOT EXISTS shows_movie_starts_idx ON shows (movie_id, starts_at);

CREATE TABLE IF NOT EXISTS bookings (
  id             SERIAL PRIMARY KEY,
  booking_code   TEXT NOT NULL UNIQUE,
  user_id        INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  show_id        INTEGER NOT NULL REFERENCES shows (id) ON DELETE RESTRICT,
  seats          TEXT[] NOT NULL,
  seat_count     INTEGER NOT NULL CHECK (seat_count > 0),
  amount         INTEGER NOT NULL CHECK (amount >= 0),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_method TEXT NOT NULL DEFAULT 'simulation',
  email_status   TEXT NOT NULL DEFAULT 'not_configured' CHECK (email_status IN ('not_configured', 'sent', 'failed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings (user_id, created_at DESC);

-- One row per physical seat per show. booking_id is set exactly once, under a row lock,
-- so the (show_id, seat_number) uniqueness plus FOR UPDATE makes double booking impossible.
CREATE TABLE IF NOT EXISTS seats (
  id          SERIAL PRIMARY KEY,
  show_id     INTEGER NOT NULL REFERENCES shows (id) ON DELETE CASCADE,
  row_label   TEXT NOT NULL,
  number      INTEGER NOT NULL,
  seat_number TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Regular' CHECK (category IN ('Regular', 'Premium', 'Recliner')),
  booking_id  INTEGER REFERENCES bookings (id) ON DELETE SET NULL,
  UNIQUE (show_id, seat_number)
);
