const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  image: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: Number,
  otpExpiry: Date,
});

const User = mongoose.model("User", authSchema);
module.exports = User;