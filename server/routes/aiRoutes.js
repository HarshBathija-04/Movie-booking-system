import express from "express";
import { z } from "zod";
import { recommend } from "../controllers/aiController.js";
import { validate } from "../middleware/http.js";
import { limiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post(
  "/recommend",
  limiter(15, 10),
  validate(
    z.object({ prompt: z.string().trim().min(3, "Tell us a little more").max(300, "Keep it under 300 characters") }),
  ),
  recommend,
);

export default router;
