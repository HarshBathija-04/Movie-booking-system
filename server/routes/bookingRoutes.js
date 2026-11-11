import express from "express";
import { z } from "zod";
import { createBooking, getBookingById, getMyBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";
import { idParams, validate } from "../middleware/http.js";

const MAX_SEATS = 10;

const bookingBody = z.object({
  showId: z.coerce.number().int().positive(),
  seats: z
    .array(
      z
        .string()
        .trim()
        .regex(/^[A-Z]\d{1,2}$/, "Invalid seat"),
    )
    .min(1, "Pick at least one seat")
    .max(MAX_SEATS, `You can book up to ${MAX_SEATS} seats at a time`)
    .refine((s) => new Set(s).size === s.length, "Duplicate seats in request"),
});

const router = express.Router();

router.post("/", protect, validate(bookingBody), createBooking);
router.get("/mine", protect, getMyBookings);
router.get("/mine/:id", protect, validate(idParams, "params"), getBookingById);

export default router;
