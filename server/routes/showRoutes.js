import express from "express";
import { z } from "zod";
import { createShow, deleteShow, getShowById, getShows, updateShow } from "../controllers/showController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { idParams, validate } from "../middleware/http.js";
import createSeatLayout from "../utils/createSeatLayout.js";

const SEAT_COUNT = createSeatLayout().length;

const showBody = z.object({
  movieId: z.coerce.number().int().positive("Pick a movie"),
  theaterName: z.string().trim().min(1, "Theater is required").max(120),
  screenName: z.string().trim().min(1, "Screen is required").max(60),
  showDate: z.iso.date("Use a YYYY-MM-DD date"),
  showTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a HH:MM time"),
  ticketPrice: z.coerce.number().int().min(0).max(10_000),
  totalSeats: z.coerce.number().int().min(1).max(SEAT_COUNT).default(SEAT_COUNT),
  format: z.string().trim().max(20).default("2D"),
});

const router = express.Router();

router.get("/", validate(z.object({ movieId: z.coerce.number().int().positive().optional() }), "query"), getShows);
router.get("/:id", validate(idParams, "params"), getShowById);
router.post("/", protect, adminOnly, validate(showBody), createShow);
router.put(
  "/:id",
  protect,
  adminOnly,
  validate(idParams, "params"),
  validate(showBody.omit({ movieId: true, totalSeats: true })),
  updateShow,
);
router.delete("/:id", protect, adminOnly, validate(idParams, "params"), deleteShow);

export default router;
