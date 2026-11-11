import cors from "cors";
import express from "express";
import helmet from "helmet";
import { query } from "./configs/db.js";
import { config } from "./configs/env.js";
import { errorHandler, notFound } from "./middleware/http.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import showRoutes from "./routes/showRoutes.js";

export const createApp = () => {
  const app = express();
  app.set("trust proxy", 1); // Render terminates TLS in front of the app; needed for per-IP rate limits.
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || config.frontendUrls.includes(origin)),
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  // Keep-alive target: also exercises the database connection.
  app.get("/health", async (req, res) => {
    try {
      await query("SELECT 1");
      res.json({ status: "ok", db: "ok" });
    } catch {
      res.status(503).json({ status: "degraded", db: "error" });
    }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/movies", movieRoutes);
  app.use("/api/shows", showRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/ai", aiRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
};
