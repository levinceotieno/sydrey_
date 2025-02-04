const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10), // Convert port to number
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const db = mysql.createPool(dbConfig);

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Connected to the database');
    connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1); // Added to be consistent with server.js error handling
  }
})();

module.exports = db;
