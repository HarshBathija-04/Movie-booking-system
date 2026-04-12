import QRCode from "qrcode";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Seat from "../models/Seat.js";
import Show from "../models/Show.js";
import generateBookingId from "../utils/generateBookingId.js";
import sendBookingEmail from "../utils/sendBookingEmail.js";

export const createBooking = async (req, res) => {
  const { showId, seats, paymentMethod = "simulation" } = req.body;

  if (!showId || !Array.isArray(seats) || seats.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Show and seats are required" });
  }

  const show = await Show.findById(showId).populate("movie");

  if (!show) {
    return res.status(404).json({ success: false, message: "Show not found" });
  }

  const seatDocuments = await Seat.find({
    show: showId,
    seatNumber: { $in: seats },
  });

  if (seatDocuments.length !== seats.length) {
    return res
      .status(400)
      .json({ success: false, message: "One or more seats are invalid" });
  }

  const alreadyBooked = seatDocuments.find((seat) => seat.isBooked);

  if (alreadyBooked) {
    return res.status(409).json({
      success: false,
      message: `Seat ${alreadyBooked.seatNumber} is already booked`,
    });
  }

  const bookingId = generateBookingId();
  const amount = seats.length * show.ticketPrice;
  const qrCode = await QRCode.toDataURL(
    JSON.stringify({
      bookingId,
      movie: show.movie.title,
      theater: show.theaterName,
      showDate: show.showDate,
      showTime: show.showTime,
      seats,
    })
  );

  const booking = await Booking.create({
    bookingId,
    user: req.user._id,
    movie: show.movie._id,
    show: show._id,
    seats,
    seatCount: seats.length,
    amount,
    paymentMethod,
    paymentStatus: "paid",
    qrCode,
  });

  await Seat.updateMany(
    {
      show: show._id,
      seatNumber: { $in: seats },
      isBooked: false,
    },
    {
      $set: {
        isBooked: true,
        bookedByUser: req.user._id,
        bookedByBooking: booking._id,
      },
    }
  );

  await Show.findByIdAndUpdate(show._id, {
    $inc: { bookedSeatsCount: seats.length },
  });

  const emailResult = await sendBookingEmail({
    to: req.user.email,
    subject: `Booking Confirmation - ${booking.bookingId}`,
    html: `
      <h2>Movie Ticket Booking Confirmation</h2>
      <p>Hello ${req.user.name},</p>
      <p>Your ticket has been booked successfully.</p>
      <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
      <p><strong>Movie:</strong> ${show.movie.title}</p>
      <p><strong>Show:</strong> ${show.showDate} at ${show.showTime}</p>
      <p><strong>Seats:</strong> ${seats.join(", ")}</p>
      <p><strong>Amount:</strong> INR ${amount}</p>
    `,
  });

  booking.emailStatus = emailResult.status;
  await booking.save();

  const populatedBooking = await Booking.findById(booking._id)
    .populate("movie", "title posterUrl durationMinutes genre rating")
    .populate("show", "showDate showTime theaterName screenName");

  res.status(201).json({
    success: true,
    message: "Booking confirmed",
    booking: populatedBooking,
  });
};

export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("movie", "title posterUrl durationMinutes genre rating")
    .populate("show", "showDate showTime theaterName screenName")
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
};

export const getBookingById = async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate("movie", "title posterUrl durationMinutes genre rating description")
    .populate("show", "showDate showTime theaterName screenName format");

  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  res.json({ success: true, booking });
};
