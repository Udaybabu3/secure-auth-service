const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  res.json({
    message: "You have accessed a protected route",
    userId: req.user.id,
  });
});

module.exports = router;
