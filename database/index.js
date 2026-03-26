const { Pool } = require("pg");
require("dotenv").config();

/* Connection Pool */
const connectionString = process.env.DATABASE_URL;

// Debug database connection
console.log("Database URL exists:", !!connectionString);
console.log(
  "Database URL length:",
  connectionString ? connectionString.length : 0,
);

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      console.log("executed query", { text });
      return res;
    } catch (error) {
      console.error("error in query", { text, error: error.message });
      throw error;
    }
  },
};
