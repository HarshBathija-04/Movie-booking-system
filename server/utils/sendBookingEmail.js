import { createTransporter } from "../configs/nodeMailer.js";

const escape = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const sendBookingEmail = async ({ user, booking }) => {
  const transporter = createTransporter();
  if (!transporter) return { status: "not_configured" };

  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: user.email,
      subject: `Your tickets for ${booking.movie.title} (${booking.bookingCode})`,
      html: `
        <h2>You're booked, ${escape(user.name)}!</h2>
        <p><strong>${escape(booking.movie.title)}</strong></p>
        <p>${escape(booking.show.showDate)} at ${escape(booking.show.showTime)} &middot;
           ${escape(booking.show.theaterName)}, ${escape(booking.show.screenName)}</p>
        <p>Seats: ${escape(booking.seats.join(", "))}</p>
        <p>Amount paid: INR ${booking.amount}</p>
        <p>Booking code: <strong>${escape(booking.bookingCode)}</strong></p>`,
    });
    return { status: "sent" };
  } catch (error) {
    console.error("Booking email failed", error.message);
    return { status: "failed" };
  }
};

export default sendBookingEmail;
