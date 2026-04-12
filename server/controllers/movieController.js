import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

export const getMovies = async (req, res) => {
  const search = req.query.search?.trim();
  const filter = { isActive: true };

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const movies = await Movie.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, movies });
};

export const getMovieById = async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    return res.status(404).json({ success: false, message: "Movie not found" });
  }

  const shows = await Show.find({ movie: movie._id }).sort({ showDateTime: 1 });

  res.json({ success: true, movie, shows });
};

export const createMovie = async (req, res) => {
  const title = req.body.title?.trim();

  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }

  const slug =
    req.body.slug?.trim() ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const movie = await Movie.create({
    ...req.body,
    title,
    slug,
  });

  res.status(201).json({ success: true, message: "Movie created", movie });
};

export const updateMovie = async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!movie) {
    return res.status(404).json({ success: false, message: "Movie not found" });
  }

  res.json({ success: true, message: "Movie updated", movie });
};

export const deleteMovie = async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!movie) {
    return res.status(404).json({ success: false, message: "Movie not found" });
  }

  res.json({ success: true, message: "Movie deleted" });
};
