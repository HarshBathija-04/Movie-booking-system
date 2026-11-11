import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { pool } from "../configs/db.js";
import { reserveSeats } from "../controllers/bookingController.js";
import { DEMO_USER } from "../db/seed.js";

const app = createApp();
let token;
let showId;
let freeSeats;

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ emailOrPhone: DEMO_USER.email, password: DEMO_USER.password });
  token = res.body.token;
  const { rows } = await pool.query(
    "SELECT id FROM shows WHERE starts_at > now() + interval '1 hour' ORDER BY starts_at LIMIT 1",
  );
  showId = rows[0].id;
  const show = await request(app).get(`/api/shows/${showId}`);
  freeSeats = show.body.seats.filter((s) => !s.isBooked).map((s) => s.seatNumber);
});

afterAll(() => pool.end());

describe("health", () => {
  it("reports db ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", db: "ok" });
  });
});

describe("catalog", () => {
  it("lists seeded movies with upcoming show info", async () => {
    const res = await request(app).get("/api/movies");
    expect(res.status).toBe(200);
    expect(res.body.movies.length).toBeGreaterThan(10);
    expect(res.body.movies[0]).toHaveProperty("upcomingShows");
  });

  it("returns 400 for a non-numeric id and 404 for unknown", async () => {
    expect((await request(app).get("/api/movies/abc")).status).toBe(400);
    expect((await request(app).get("/api/movies/999999")).body.error.code).toBe("not_found");
  });

  it("returns show seats with tier prices", async () => {
    const res = await request(app).get(`/api/shows/${showId}`);
    expect(res.body.show.prices.Recliner).toBeGreaterThan(res.body.show.prices.Regular);
    expect(res.body.seats.length).toBe(58);
  });
});

describe("auth", () => {
  it("registers a customer and never grants admin from the request", async () => {
    const email = `t${Date.now()}@example.com`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email, phone: String(Date.now()).slice(-10), password: "password123", role: "admin" });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("user");
    const dupe = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email, phone: "1234567890", password: "password123" });
    expect(dupe.status).toBe(409);
  });

  it("validates input and rejects bad credentials", async () => {
    const bad = await request(app).post("/api/auth/register").send({ email: "nope" });
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe("validation_error");
    const wrong = await request(app).post("/api/auth/login").send({ emailOrPhone: DEMO_USER.email, password: "wrong" });
    expect(wrong.status).toBe(401);
  });

  it("protects bookings and admin routes", async () => {
    expect((await request(app).get("/api/bookings/mine")).status).toBe(401);
    const admin = await request(app).get("/api/admin/dashboard").set("Authorization", `Bearer ${token}`);
    expect(admin.status).toBe(403);
  });
});

describe("booking", () => {
  it("books seats, charges tier prices and lists the ticket", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ showId, seats: [freeSeats[0]] });
    expect(res.status).toBe(201);
    expect(res.body.booking.seats).toEqual([freeSeats[0]]);

    const again = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ showId, seats: [freeSeats[0]] });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe("seats_taken");

    const detail = await request(app)
      .get(`/api/bookings/mine/${res.body.booking.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(detail.body.booking.qrCode).toMatch(/^data:image\/png;base64,/);
  });

  it("lets exactly one of many concurrent buyers win the same seat", async () => {
    const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [DEMO_USER.email]);
    const seat = freeSeats[1];
    const results = await Promise.allSettled(Array.from({ length: 8 }, () => reserveSeats(rows[0].id, showId, [seat])));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected").every((r) => r.reason.status === 409)).toBe(true);
    const { rows: owners } = await pool.query("SELECT count(*) FROM bookings WHERE show_id = $1 AND $2 = ANY (seats)", [
      showId,
      seat,
    ]);
    expect(owners[0].count).toBe(1);
  });

  it("rejects invalid seat payloads", async () => {
    const dup = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ showId, seats: ["A1", "A1"] });
    expect(dup.status).toBe(400);
    const ghost = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ showId, seats: ["Z9"] });
    expect(ghost.status).toBe(400);
  });
});

describe("ai concierge", () => {
  it("validates the prompt before calling the model", async () => {
    const res = await request(app).post("/api/ai/recommend").send({ prompt: "" });
    expect(res.status).toBe(400);
  });
});
