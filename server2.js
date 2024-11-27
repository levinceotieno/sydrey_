const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const { router: authRoutes } = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test Database Connection
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to the database');
});

db.on('error', (err) => {
  console.error('Database error:', err);
  db.connect();
});

// Routes
app.get('/', (req, res) => {
  res.render('index'); // Render the homepage (index.ejs)
});

app.use(session({
   secret: process.env.SESSION_SECRET, // Add SESSION_SECRET to .env
   resave: false,
   saveUninitialized: true,
   cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1-day session
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/products', productsRoutes);

// Authentication Routes
app.use('/auth', authRoutes); // Routes from auth.js are accessible at the root level
app.use('/orders', ordersRoutes);
app.use('/cart', cartRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
