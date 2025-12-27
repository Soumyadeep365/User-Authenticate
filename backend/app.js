const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/authMiddleware");
const userRouter = require("./routes/authRoute");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ❗ Do NOT use bodyParser separately
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/api/v1/", authMiddleware, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
  });
});

app.get("/test-mail", async (req, res) => {
  try {
    await sendMail(
      "your_email@gmail.com",
      "Test email",
      "<b>Email working!</b>"
    );
    res.send("Email sent");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.use("/api/v1", userRouter);

module.exports = app;
