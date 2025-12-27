const User = require("../models/authModel");
const { sendMail } = require("../middleware/SendMail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.TOKEN_SECRET;

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, jwtSecret, { expiresIn: "7d" });
};

// ---------------- SIGN UP ----------------
exports.signUp = async (req, res) => {
  try {
    const { name, password, email } = req.body;
    const img = req.file ? req.file.filename : null;

    if (!email || !password || !name) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email, password, and name",
      });
    }

    // 🔴 PASSWORD LENGTH VALIDATION (ADDED)
    if (password.length < 4) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 4 characters long",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(406).json({
        status: "OOPS",
        message: "The E-Mail already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      image: img,
      name,
      password: hashPassword,
      email,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      status: "success",
      message: "User Created",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// ---------------- NORMAL LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User does not exist",
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({
        status: "fail",
        message: "Wrong password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        status: "fail",
        message: "Please verify your account with OTP before logging in.",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        image: user.image,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// ---------------- OTP LOGIN ----------------
exports.otpLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User does not exist",
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({
        status: "fail",
        message: "Wrong password",
      });
    }

    // Reset verification
    user.isVerified = false;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiryTime = Date.now() + 5 * 60 * 1000;
    user.otp = otp;
    user.otpExpiry = expiryTime;
    await user.save();

    // Auto-delete OTP after expiry
    setTimeout(async () => {
      const currentUser = await User.findOne({ email });
      if (currentUser && currentUser.otpExpiry <= Date.now()) {
        currentUser.otp = undefined;
        currentUser.otpExpiry = undefined;
        await currentUser.save();
      }
    }, 5 * 60 * 1000);

    await sendMail(
      email,
      `Your OTP is ${otp}. It is valid for 5 minutes.`,
      `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`
    );

    res.status(200).json({
      status: "success",
      message: "OTP sent successfully. Please verify to complete login.",
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// ---------------- OTP VERIFICATION ----------------
exports.otpVerification = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if email and otp are provided
    if (!email || !otp) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and OTP",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== parseInt(otp) || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid or expired OTP",
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Refetch updated user from DB
    const verifiedUser = await User.findById(user._id);

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      data: {
        name: verifiedUser.name,
        email: verifiedUser.email,
        isVerified: verifiedUser.isVerified, // ✅ will always appear
      },
      token: generateToken(verifiedUser._id),
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ---------------- LOGOUT ----------------
exports.logout = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    user.isVerified = false;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ---------------- RESET PASSWORD ----------------
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and new password",
      });
    }

    // 🔴 PASSWORD LENGTH VALIDATION (ADDED)
    if (password.length < 4) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 4 characters long",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        status: "fail",
        message: "New password cannot be same as old password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// ---------------- SEND OTP ----------------
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiryTime = Date.now() + 5 * 60 * 1000;
    user.otp = otp;
    user.otpExpiry = expiryTime;
    await user.save();

    setTimeout(async () => {
      const currentUser = await User.findOne({ email });
      if (currentUser && currentUser.otpExpiry <= Date.now()) {
        currentUser.otp = undefined;
        currentUser.otpExpiry = undefined;
        await currentUser.save();
      }
    }, 5 * 60 * 1000);

    await sendMail(
      email,
      `Your OTP is ${otp}. It is valid for 5 minutes.`,
      `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`
    );

    res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
