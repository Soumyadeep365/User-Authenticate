const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");

router.post("/signup", upload.single("image"), authController.signUp);
router.post("/login", authController.login);
router.post("/otp-login", authController.otpLogin);
router.post("/verify-otp", authController.otpVerification);
router.post("/logout", authController.logout);
router.post("/reset-password", authController.resetPassword);
router.post("/send-otp", authController.sendOtp);

module.exports = router;
