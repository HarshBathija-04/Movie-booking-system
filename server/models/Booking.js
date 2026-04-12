import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seats: {
      type: [String],
      required: true,
    },
    seatCount: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid",
    },
    paymentMethod: {
      type: String,
      default: "simulation",
    },
    qrCode: {
      type: String,
      default: "",
    },
    emailStatus: {
      type: String,
      enum: ["not_configured", "sent", "failed"],
      default: "not_configured",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
