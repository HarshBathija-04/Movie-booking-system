import Movie from "../models/Movie.js";
import Seat from "../models/Seat.js";
import Show from "../models/Show.js";
import createSeatLayout from "../utils/createSeatLayout.js";

export const getShows = async (req, res) => {
  const filter = {};

  if (req.query.movieId) {
    filter.movie = req.query.movieId;
  }

  const shows = await Show.find(filter)
    .populate("movie")
    .sort({ showDateTime: 1 });

  res.json({ success: true, shows });
};

export const getShowById = async (req, res) => {
  const show = await Show.findById(req.params.id).populate("movie");

  if (!show) {
    return res.status(404).json({ success: false, message: "Show not found" });
  }

  const seats = await Seat.find({ show: show._id }).sort({ row: 1, number: 1 });

  res.json({ success: true, show, seats });
};

export const createShow = async (req, res) => {
  const {
    movie,
    theaterName,
    screenName,
    showDate,
    showTime,
    ticketPrice,
    totalSeats,
    format,
  } = req.body;

  const existingMovie = await Movie.findById(movie);

  if (!existingMovie) {
    return res.status(404).json({ success: false, message: "Movie not found" });
  }

  const showDateTime = new Date(`${showDate}T${showTime}:00`);

  const show = await Show.create({
    movie,
    theaterName,
    screenName,
    showDate,
    showTime,
    showDateTime,
    ticketPrice,
    totalSeats,
    format,
  });

  const seats = createSeatLayout().slice(0, totalSeats).map((seat) => ({
    ...seat,
    show: show._id,
  }));

  await Seat.insertMany(seats);

  res.status(201).json({ success: true, message: "Show created", show });
};

export const updateShow = async (req, res) => {
  const { showDate, showTime, ...rest } = req.body;
  const payload = { ...rest };

  if (showDate) payload.showDate = showDate;
  if (showTime) payload.showTime = showTime;
  if (showDate || showTime) {
    const existing = await Show.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    payload.showDateTime = new Date(
      `${showDate || existing.showDate}T${showTime || existing.showTime}:00`
    );
  }

  const show = await Show.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!show) {
    return res.status(404).json({ success: false, message: "Show not found" });
  }

  res.json({ success: true, message: "Show updated", show });
};

export const deleteShow = async (req, res) => {
  const show = await Show.findByIdAndDelete(req.params.id);

  if (!show) {
    return res.status(404).json({ success: false, message: "Show not found" });
  }

  await Seat.deleteMany({ show: show._id });

  res.json({ success: true, message: "Show deleted" });
};
