import express from "express";
import {
  getAllBookings,
  getDashboardData,
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboardData);
router.get("/bookings", protect, adminOnly, getAllBookings);

export default router;
