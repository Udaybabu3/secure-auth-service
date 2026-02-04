// Normalize email (lowercase + trim)
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

// Validate email format
function isValidEmail(email) {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isStrongPassword(password) {
  if (typeof password !== "string") return false;

  // Minimum length: 32 characters
  if (password.length < 32) return false;

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[\W_]/.test(password);

  return (
    hasUppercase &&
    hasLowercase &&
    hasDigit &&
    hasSpecialChar
  );
}

function isValidDisplayName(name) {
  if (typeof name !== "string") return false;

  const trimmed = name.trim();

  // Reasonable limits
  if (trimmed.length < 3 || trimmed.length > 50) {
    return false;
  }

  // Allow letters, numbers, space, underscore
  const nameRegex = /^[a-zA-Z0-9 _-]+$/;
  return nameRegex.test(trimmed);
}

module.exports = {
  normalizeEmail,
  isValidEmail,
  isStrongPassword,
  isValidDisplayName,
};
