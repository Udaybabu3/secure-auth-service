const express = require("express");
const { register, login, refresh, me, logout } = require("../controllers/auth.controller");
const { loginRateLimiter } = require("../middleware/loginRateLimit.middleware");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", loginRateLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Get current authenticated user
router.get("/me", authMiddleware, me);

module.exports = router;
