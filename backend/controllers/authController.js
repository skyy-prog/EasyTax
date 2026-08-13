const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const buildToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  shopName: user.shopName,
  gstin: user.gstin,
  pan: user.pan,
  businessType: user.businessType,
  turnover: user.turnover,
  gstRegistered: user.gstRegistered,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      shopName,
      gstin,
      pan,
      businessType,
      turnover,
      gstRegistered,
    } = req.body;

    if (!name || !email || !password || !shopName || !businessType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!emailRegex.test(String(email).toLowerCase())) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (gstin && !gstinRegex.test(String(gstin).toUpperCase())) {
      return res.status(400).json({ message: "Invalid GSTIN format" });
    }

    if (pan && !panRegex.test(String(pan).toUpperCase())) {
      return res.status(400).json({ message: "Invalid PAN format" });
    }

    const allowedBusinessTypes = ["Retailer", "Wholesaler", "Service Provider"];
    if (!allowedBusinessTypes.includes(businessType)) {
      return res.status(400).json({ message: "Invalid business type" });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: String(password),
      shopName: String(shopName).trim(),
      gstin: gstin ? String(gstin).toUpperCase().trim() : undefined,
      pan: pan ? String(pan).toUpperCase().trim() : undefined,
      businessType,
      turnover: turnover !== undefined ? Number(turnover) : undefined,
      gstRegistered: Boolean(gstRegistered),
    });

    return res.status(201).json({
      token: buildToken(user._id),
      user: serializeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const matched = await bcrypt.compare(String(password), user.password);
    if (!matched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      token: buildToken(user._id),
      user: serializeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
