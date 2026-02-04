const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Initialize DB connection at startup
require("./config/db");

const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");

const app = express();

/* =====================
   MIDDLEWARE
   ===================== */
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:3000",
      "http://localhost:57498",
    ],
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());

/* =====================
   ROUTES
   ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

/* =====================
   HEALTH CHECK
   ===================== */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
