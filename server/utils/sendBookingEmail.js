import { createTransporter } from "../configs/nodeMailer.js";

const sendBookingEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  if (!transporter) {
    return { status: "not_configured" };
  }

  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    return { status: "sent" };
  } catch (error) {
    console.error("Booking email failed", error.message);
    return { status: "failed" };
  }
};

export default sendBookingEmail;
