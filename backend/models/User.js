const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => emailRegex.test(value),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: (value) => !value || gstinRegex.test(value),
        message: "Invalid GSTIN format",
      },
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: (value) => !value || panRegex.test(value),
        message: "Invalid PAN format",
      },
    },
    businessType: {
      type: String,
      enum: ["Retailer", "Wholesaler", "Service Provider"],
      required: true,
    },
    turnover: {
      type: Number,
      min: 0,
    },
    gstRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
