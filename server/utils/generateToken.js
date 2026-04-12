import jwt from "jsonwebtoken";

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || "development-jwt-secret",
    { expiresIn: "7d" }
  );

export default generateToken;
