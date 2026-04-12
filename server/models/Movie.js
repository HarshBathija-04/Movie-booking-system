import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    posterUrl: {
      type: String,
      required: true,
      trim: true,
    },
    bannerUrl: {
      type: String,
      default: "",
      trim: true,
    },
    genre: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: "English",
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    cast: {
      type: [String],
      default: [],
    },
    trailerUrl: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);

export default Movie;
