import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

export const registerUser = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All required fields must be provided" });
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }],
  });

  if (existingUser) {
    return res
      .status(409)
      .json({ success: false, message: "Email or phone already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const firstUser = (await User.countDocuments()) === 0;

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    password: hashedPassword,
    role: role === "admin" || firstUser ? "admin" : "user",
  });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token: generateToken(user),
    user: sanitizeUser(user),
  });
};

export const loginUser = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Credentials are required" });
  }

  const user = await User.findOne({
    $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
  });

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  res.json({
    success: true,
    message: "Login successful",
    token: generateToken(user),
    user: sanitizeUser(user),
  });
};

export const getProfile = async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
};
