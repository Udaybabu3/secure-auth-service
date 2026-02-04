const {
  normalizeEmail,
  isValidEmail,
  isStrongPassword,
  isValidDisplayName,
} = require("../utils/validators");

const { hashPassword, verifyPassword } = require("../services/password.service");
const {
  findByEmail,
  createUser,
  findById,
} = require("../models/user.model");

const {
  signAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  hashRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} = require("../services/token.service");

// Common error helper
function error(res, status, message) {
  return res.status(status).json({ error: message });
}

/* =========================
   REGISTER CONTROLLER
   ========================= */
async function register(req, res) {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return error(res, 400, "Missing required fields");
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return error(res, 400, "Invalid email format");
    }

    if (!isStrongPassword(password)) {
      return error(res, 400, "Password does not meet security requirements");
    }

    if (!isValidDisplayName(displayName)) {
      return error(res, 400, "Invalid display name");
    }

    const existing = await findByEmail(normalizedEmail);
    if (existing) {
      return error(res, 409, "Email already in use");
    }

    const passwordHash = await hashPassword(password);

    const user = await createUser({
      email: normalizedEmail,
      passwordHash,
      displayName: displayName.trim(),
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at,
    });
  } catch (e) {
    console.error(e);
    return error(res, 500, "Internal server error");
  }
}

/* =========================
   LOGIN CONTROLLER
   ========================= */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const invalid = () =>
      res.status(401).json({ error: "Invalid email or password" });

    if (!email || !password) return invalid();

    const normalizedEmail = normalizeEmail(email);
    const user = await findByEmail(normalizedEmail);
    if (!user) return invalid();

    const passwordOk = await verifyPassword(
      user.password_hash,
      password
    );
    if (!passwordOk) return invalid();

    const accessToken = signAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await storeRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/api/auth/refresh",
    });

    return res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
      },
    });
  } catch (e) {
    console.error(e);
    return error(res, 500, "Internal server error");
  }
}

/* =========================
   REFRESH TOKEN CONTROLLER
   ========================= */
async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "Missing refresh token" });
    }

    const tokenHash = hashRefreshToken(token);
    const record = await findRefreshToken(tokenHash);

    if (!record || new Date(record.expires_at) < new Date()) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    if (record.is_revoked) {
      await revokeAllUserRefreshTokens(record.user_id);
      return res.status(401).json({
        error: "Session compromised. Please log in again.",
      });
    }

    await revokeRefreshToken(record.id);

    const newAccessToken = signAccessToken(record.user_id);
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await storeRefreshToken({
      userId: record.user_id,
      token: newRefreshToken,
      expiresAt,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/api/auth/refresh",
    });

    return res.json({ accessToken: newAccessToken });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* =========================
   GET CURRENT USER (/me)
   ========================= */
async function me(req, res) {
  try {
    const userId = req.user.id;

    const user = await findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* =========================
   LOGOUT CONTROLLER
   ========================= */
async function logout(req, res) {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      const tokenHash = hashRefreshToken(token);
      const record = await findRefreshToken(tokenHash);

      if (record && !record.is_revoked) {
        await revokeRefreshToken(record.id);
      }
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/api/auth/refresh",
    });

    return res.json({ message: "Logged out successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  register,
  login,
  refresh,
  me,
  logout,
};
