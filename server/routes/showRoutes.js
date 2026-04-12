import express from "express";
import {
  createShow,
  deleteShow,
  getShowById,
  getShows,
  updateShow,
} from "../controllers/showController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getShows);
router.get("/:id", getShowById);
router.post("/", protect, adminOnly, createShow);
router.put("/:id", protect, adminOnly, updateShow);
router.delete("/:id", protect, adminOnly, deleteShow);

export default router;
