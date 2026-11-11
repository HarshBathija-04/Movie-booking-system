import { rateLimit } from "express-rate-limit";

// shortcut: in-memory store is per instance, move to a shared store if the API scales past one instance.
export const limiter = (limit, windowMinutes = 15) =>
  rateLimit({
    windowMs: windowMinutes * 60_000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    handler: (req, res) =>
      res
        .status(429)
        .json({ success: false, error: { code: "rate_limited", message: "Too many requests, please slow down" } }),
  });
