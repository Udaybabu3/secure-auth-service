const { Pool } = require("pg");

console.log("🧪 db.js file loaded");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Only fail-fast outside test environment
if (process.env.NODE_ENV !== "test") {
  pool
    .query("SELECT 1")
    .then(() => {
      console.log("✅ PostgreSQL connected and ready");
    })
    .catch((err) => {
      console.error("❌ PostgreSQL connection failed:", err.message);
      process.exit(1);
    });
}

module.exports = pool;
