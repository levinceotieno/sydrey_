const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const createTables = async () => {
  const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10), // Convert port to number
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      ca: fs.readFileSync('config/ca.pem')  // Path to CA certificate
    }
  };

  let db;
  try {
    db = await mysql.createConnection(dbConfig);

    // Create users table (required for foreign key in orders)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(15),
        profile_photo VARCHAR(255),
        is_admin TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role ENUM('customer', 'farmer', 'admin') DEFAULT 'customer'
      )
    `);

    // Create products table (required for foreign key in order_products)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        quantity VARCHAR(50) NOT NULL,
        category ENUM('wholesale', 'retail') NOT NULL,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create orders table (required for foreign key in order_products)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        delivery_location ENUM('withinKenya', 'outsideKenya') NOT NULL,
        delivery_address VARCHAR(255) NOT NULL,
        delivery_date DATE NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create order_products table (depends on orders and products)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS order_products (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT UNSIGNED NOT NULL,
        product_id BIGINT UNSIGNED NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Create blogs table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        cover_image VARCHAR(255),
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create bookings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        service ENUM('education', 'agronomist') NOT NULL,
        status ENUM('pending', 'confirmed', 'completed') DEFAULT 'pending',
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cart table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cart (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        product_id BIGINT UNSIGNED NOT NULL,
        quantity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(128) PRIMARY KEY,
        expires INT UNSIGNED NOT NULL,
        data MEDIUMTEXT
      )
    `);

    console.log('All tables created successfully!');
  } catch (err) {
    console.error('Error creating tables:', err);
    process.exit(1);
  } finally {
    if (db) {
      await db.end();
    }
  }
};

createTables();
