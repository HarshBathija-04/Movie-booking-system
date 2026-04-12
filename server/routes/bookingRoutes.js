import express from "express";
import {
  createBooking,
  getBookingById,
  getMyBookings,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/mine", protect, getMyBookings);
router.get("/mine/:id", protect, getBookingById);

export default router;
