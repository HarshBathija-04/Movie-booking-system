import bcrypt from "bcryptjs";
import { query } from "../configs/db.js";
import { HttpError } from "../middleware/http.js";
import { signToken } from "../middleware/auth.js";

const USER_COLUMNS = `id, name, email, phone, role, created_at AS "createdAt"`;

export const registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  // Role is never taken from the request: new accounts are always customers.
  const { rows } = await query(
    `INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING RETURNING ${USER_COLUMNS}`,
    [name, email, phone, hash],
  );
  if (!rows[0]) throw new HttpError(409, "An account with this email or phone already exists", "conflict");

  res.status(201).json({ success: true, token: signToken(rows[0]), user: rows[0] });
};

export const loginUser = async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const { rows } = await query(
    `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = lower($1) OR phone = $1 LIMIT 1`,
    [emailOrPhone],
  );
  const { password_hash: hash, ...user } = rows[0] || {};

  if (!hash || !(await bcrypt.compare(password, hash))) {
    throw new HttpError(401, "Incorrect email/phone or password", "invalid_credentials");
  }
  res.json({ success: true, token: signToken(user), user });
};

export const getProfile = (req, res) => res.json({ success: true, user: req.user });
