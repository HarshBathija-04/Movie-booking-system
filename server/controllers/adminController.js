import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import User from "../models/User.js";

export const getDashboardData = async (req, res) => {
  const [totalUsers, totalMovies, totalShows, totalBookings, recentBookings] =
    await Promise.all([
      User.countDocuments(),
      Movie.countDocuments({ isActive: true }),
      Show.countDocuments(),
      Booking.countDocuments(),
      Booking.find()
        .populate("user", "name email")
        .populate("movie", "title posterUrl")
        .populate("show", "showDate showTime theaterName")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

  const revenueData = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  const ticketsData = await Booking.aggregate([
    { $group: { _id: null, totalTicketsSold: { $sum: "$seatCount" } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalMovies,
      totalShows,
      totalBookings,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      totalTicketsSold: ticketsData[0]?.totalTicketsSold || 0,
    },
    recentBookings,
  });
};

export const getAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate("user", "name email phone")
    .populate("movie", "title posterUrl")
    .populate("show", "showDate showTime theaterName screenName")
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
};
