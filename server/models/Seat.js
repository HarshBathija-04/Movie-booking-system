import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    row: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["Regular", "Premium", "Recliner"],
      default: "Regular",
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bookedByBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true }
);

seatSchema.index({ show: 1, seatNumber: 1 }, { unique: true });

const Seat = mongoose.models.Seat || mongoose.model("Seat", seatSchema);

export default Seat;
