const argon2 = require("argon2");
const crypto = require("crypto");

// Argon2id config (balanced for security & performance)
const ARGON_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 3,
  parallelism: 1,
};

// Handle very long passwords safely (pre-hash)
function prehash(password) {
  if (password.length > 64) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }
  return password;
}

async function hashPassword(password) {
  return argon2.hash(prehash(password), ARGON_OPTIONS);
}

async function verifyPassword(hash, password) {
  return argon2.verify(hash, prehash(password));
}

module.exports = { hashPassword, verifyPassword };
