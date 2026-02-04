const pool = require("../config/db");

async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, email, password_hash, display_name, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  return rows[0];
}

async function createUser({ email, passwordHash, displayName }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, display_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, display_name, created_at`,
    [email, passwordHash, displayName]
  );
  return rows[0];
}

/* =========================
   FIND USER BY ID (for /me)
   ========================= */
async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, email, display_name, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return rows[0];
}

module.exports = {
  findByEmail,
  createUser,
  findById,
};
