import jwt from "jsonwebtoken";
import { query } from "../configs/db.js";
import { config } from "../configs/env.js";
import { HttpError } from "./http.js";

export const signToken = (user) =>
  jwt.sign({ sub: String(user.id), role: user.role }, config.jwtSecret, { expiresIn: "7d" });

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next(new HttpError(401, "Please sign in to continue", "unauthorized"));

  let payload;
  try {
    payload = jwt.verify(header.slice(7), config.jwtSecret);
  } catch {
    return next(new HttpError(401, "Your session has expired, please sign in again", "unauthorized"));
  }

  const { rows } = await query(
    `SELECT id, name, email, phone, role, created_at AS "createdAt" FROM users WHERE id = $1`,
    [Number(payload.sub)],
  );
  if (!rows[0]) return next(new HttpError(401, "Account not found", "unauthorized"));
  req.user = rows[0];
  next();
};

export const adminOnly = (req, res, next) =>
  req.user?.role === "admin" ? next() : next(new HttpError(403, "Admin access is required", "forbidden"));
