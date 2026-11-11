import express from "express";
import { z } from "zod";
import { createMovie, deleteMovie, getMovieById, getMovies, updateMovie } from "../controllers/movieController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { idParams, validate } from "../middleware/http.js";

const optionalUrl = z.union([z.url("Must be a valid URL"), z.literal(""), z.null()]).optional();

const movieBody = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .max(200)
    .optional(),
  description: z.string().trim().min(1, "Description is required").max(2000),
  posterUrl: optionalUrl,
  bannerUrl: optionalUrl,
  trailerUrl: optionalUrl,
  genres: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  language: z.string().trim().min(1).max(40).default("English"),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  rating: z.coerce.number().min(0).max(10).default(0),
  releaseDate: z.iso.date().optional().or(z.literal("")),
  cast: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
});

const listQuery = z.object({
  search: z.string().trim().max(100).optional(),
  genre: z.string().trim().max(40).optional(),
});

const router = express.Router();

router.get("/", validate(listQuery, "query"), getMovies);
router.get("/:id", validate(idParams, "params"), getMovieById);
router.post("/", protect, adminOnly, validate(movieBody), createMovie);
router.put("/:id", protect, adminOnly, validate(idParams, "params"), validate(movieBody), updateMovie);
router.delete("/:id", protect, adminOnly, validate(idParams, "params"), deleteMovie);

export default router;
