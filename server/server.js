import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./configs/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") || "*",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Movie booking API is running",
    databaseState: mongoose.connection.readyState,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
