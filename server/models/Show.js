import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theaterName: {
      type: String,
      required: true,
      trim: true,
    },
    screenName: {
      type: String,
      required: true,
      trim: true,
    },
    showDate: {
      type: String,
      required: true,
    },
    showTime: {
      type: String,
      required: true,
    },
    showDateTime: {
      type: Date,
      required: true,
    },
    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    bookedSeatsCount: {
      type: Number,
      default: 0,
    },
    format: {
      type: String,
      default: "2D",
    },
  },
  { timestamps: true }
);

const Show = mongoose.models.Show || mongoose.model("Show", showSchema);

export default Show;
