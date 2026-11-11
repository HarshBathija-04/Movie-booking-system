import express from "express";
import { z } from "zod";
import { getProfile, loginUser, registerUser } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/http.js";
import { limiter } from "../middleware/rateLimit.js";

const register = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{10,15}$/, "Enter a valid phone number (10-15 digits)"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const login = z.object({
  emailOrPhone: z.string().trim().min(3, "Enter your email or phone").max(120),
  password: z.string().min(1, "Enter your password").max(128),
});

const router = express.Router();
const authLimiter = limiter(20);

router.post("/register", authLimiter, validate(register), registerUser);
router.post("/login", authLimiter, validate(login), loginUser);
router.get("/me", protect, getProfile);

export default router;
