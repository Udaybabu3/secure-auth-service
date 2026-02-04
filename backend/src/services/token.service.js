const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");

/* =========================
   ACCESS TOKEN (JWT)
   ========================= */
function signAccessToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      algorithm: "HS256",
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

/* =========================
   REFRESH TOKEN HELPERS
   ========================= */
function generateRefreshToken() {
  // 64 bytes = high entropy
  return crypto.randomBytes(64).toString("hex");
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function storeRefreshToken({ userId, token, expiresAt }) {
  const tokenHash = hashRefreshToken(token);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

/* =========================
   ROTATION & THEFT DETECTION
   ========================= */

// Find refresh token record
async function findRefreshToken(tokenHash) {
  const { rows } = await pool.query(
    `SELECT id, user_id, is_revoked, expires_at
     FROM refresh_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );
  return rows[0];
}

// Revoke a single refresh token (normal rotation)
async function revokeRefreshToken(tokenId) {
  await pool.query(
    `UPDATE refresh_tokens
     SET is_revoked = TRUE
     WHERE id = $1`,
    [tokenId]
  );
}

// Revoke ALL refresh tokens for a user (theft detected)
async function revokeAllUserRefreshTokens(userId) {
  await pool.query(
    `UPDATE refresh_tokens
     SET is_revoked = TRUE
     WHERE user_id = $1`,
    [userId]
  );
}

module.exports = {
  // Access tokens
  signAccessToken,
  verifyAccessToken,

  // Refresh tokens
  generateRefreshToken,
  hashRefreshToken,
  storeRefreshToken,

  // Rotation & security
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
};
