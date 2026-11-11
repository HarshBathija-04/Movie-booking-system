import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool, withTransaction } from "../configs/db.js";
import createSeatLayout, { insertSeats } from "../utils/createSeatLayout.js";
import generateBookingId from "../utils/generateBookingId.js";
import { totalFor } from "../utils/pricing.js";

export const DEMO_USER = { email: "demo@cineverse.app", password: "demo1234" };
const BOX_OFFICE_EMAIL = "boxoffice@cineverse.app";
const THEATER = "CineVerse Aditya";
const SCREENS = ["Screen 1", "Screen 2", "Screen 3", "Screen 4", "Screen 5", "Screen 6", "Dolby Atmos", "IMAX"];
const SLOTS = ["10:00", "13:15", "16:30", "19:45", "22:30"];
const DAYS_AHEAD = 4;
const LAYOUT = createSeatLayout();

// Deterministic PRNG so re-seeding the same show always produces the same "sold" seats.
const rand = (seed) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const upsertUser = async (client, { name, email, phone, password, role }) => {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await client.query(
    `INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role RETURNING id`,
    [name, email, phone, hash, role],
  );
  return rows[0].id;
};

const insertBooking = async (client, { userId, showId, basePrice, seats }) => {
  const { rows } = await client.query(
    `INSERT INTO bookings (booking_code, user_id, show_id, seats, seat_count, amount)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [generateBookingId(), userId, showId, seats.map((s) => s.seatNumber), seats.length, totalFor(basePrice, seats)],
  );
  await client.query(
    "UPDATE seats SET booking_id = $1 WHERE show_id = $2 AND seat_number = ANY($3) AND booking_id IS NULL",
    [rows[0].id, showId, seats.map((s) => s.seatNumber)],
  );
};

export const seed = async () => {
  const movies = JSON.parse(await readFile(new URL("./movies.json", import.meta.url), "utf8"));

  await withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('seed:movie_booking'))");

    const demoUserId = await upsertUser(client, {
      name: "Demo Guest",
      email: DEMO_USER.email,
      phone: "9000000001",
      password: DEMO_USER.password,
      role: "user",
    });
    const boxOfficeId = await upsertUser(client, {
      // Random password: this account only owns walk-in sales and is never logged into.
      name: "Box Office",
      email: BOX_OFFICE_EMAIL,
      phone: "9000000000",
      password: crypto.randomUUID(),
      role: "user",
    });
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      await upsertUser(client, {
        name: "Admin",
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        phone: "9000000009",
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
      });
    }

    const movieIds = [];
    for (const m of movies) {
      const { rows } = await client.query(
        `INSERT INTO movies (title, slug, description, poster_url, banner_url, genres, language,
                             duration_minutes, rating, release_date, cast_members, trailer_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (slug) DO UPDATE SET poster_url = EXCLUDED.poster_url, banner_url = EXCLUDED.banner_url
         RETURNING id`,
        [
          m.title,
          m.slug,
          m.description,
          m.posterUrl,
          m.bannerUrl,
          m.genre,
          m.language,
          m.durationMinutes,
          m.rating,
          m.releaseDate,
          m.cast,
          m.trailerUrl,
        ],
      );
      movieIds.push(rows[0].id);
    }

    // Keep the shared database small: drop past shows nobody but the box office booked.
    await client.query(
      `DELETE FROM bookings b USING shows s
       WHERE b.show_id = s.id AND b.user_id = $1 AND s.starts_at < now() - interval '2 days'`,
      [boxOfficeId],
    );
    await client.query(
      `DELETE FROM shows s WHERE s.starts_at < now() - interval '2 days'
       AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.show_id = s.id)`,
    );

    const {
      rows: [{ today }],
    } = await client.query("SELECT to_char((now() AT TIME ZONE 'Asia/Kolkata')::date, 'YYYY-MM-DD') AS today");
    const slotsPerDay = SCREENS.length * SLOTS.length;

    for (let day = 0; day < DAYS_AHEAD; day++) {
      for (let i = 0; i < movieIds.length; i++) {
        for (let k = 0; k < 2; k++) {
          const slot = (i * 2 + k + day * 3) % slotsPerDay;
          const screen = SCREENS[Math.floor(slot / SLOTS.length)]; // consecutive slots = same screen, different time
          const time = SLOTS[slot % SLOTS.length];
          const premiumScreen = screen === "IMAX" || screen === "Dolby Atmos";
          const basePrice = (premiumScreen ? 320 : 180) + (time >= "19:00" ? 60 : 0);
          const { rows } = await client.query(
            `INSERT INTO shows (movie_id, theater_name, screen_name, starts_at, ticket_price, format)
             VALUES ($1, $2, $3, (($4::date + $5::int) + $6::time) AT TIME ZONE 'Asia/Kolkata', $7, $8)
             ON CONFLICT (theater_name, screen_name, starts_at) DO NOTHING RETURNING id`,
            [
              movieIds[i],
              THEATER,
              screen,
              today,
              day,
              time,
              basePrice,
              screen === "IMAX" ? "IMAX" : screen === "Screen 2" ? "3D" : "2D",
            ],
          );
          if (!rows.length) continue; // already seeded
          const showId = rows[0].id;
          await insertSeats(client, showId, LAYOUT);
          const r = rand(showId);
          const fill = 0.1 + r() * 0.45;
          const sold = LAYOUT.filter(() => r() < fill);
          if (sold.length) await insertBooking(client, { userId: boxOfficeId, showId, basePrice, seats: sold });
        }
      }
    }

    // Give the demo account a ticket so "My bookings" is not empty on first login.
    const {
      rows: [{ count }],
    } = await client.query("SELECT count(*) FROM bookings WHERE user_id = $1", [demoUserId]);
    if (count === 0) {
      const {
        rows: [show],
      } = await client.query(
        "SELECT id, ticket_price FROM shows WHERE starts_at > now() + interval '1 day' ORDER BY starts_at LIMIT 1",
      );
      const { rows: free } = await client.query(
        `SELECT seat_number AS "seatNumber", category FROM seats
         WHERE show_id = $1 AND booking_id IS NULL AND category = 'Premium' ORDER BY row_label, number LIMIT 2`,
        [show.id],
      );
      if (free.length)
        await insertBooking(client, { userId: demoUserId, showId: show.id, basePrice: show.ticket_price, seats: free });
    }
  });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then(() => console.log("seed complete"))
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
