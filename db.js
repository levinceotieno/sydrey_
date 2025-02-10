const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  ssl: {
	ca: fs.readFileSync(path.join(__dirname, 'config', 'ca.pem')), // Use CA cert
	rejectUnauthorized: true,
  },
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Connected to the database');
    connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
})();

module.exports = db;
