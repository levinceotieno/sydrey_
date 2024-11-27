const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Your database connection
const router = express.Router();

// Serve the registration page
router.get('/register', (req, res) => {
   res.render('register'); // Render the register.ejs file
});

// Serve the login page
router.get('/login', (req, res) => {
   res.render('login'); // Render the login.ejs file
});

// User Registration
router.post('/register', async (req, res) => {
  const { name, email, password, phone_number, role, passkey } = req.body;

  try {
    // Validate fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if email exists
    const [userExists] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    // Handle admin passkey
    let userRole = role;
    let isAdmin = 0;
    if (passkey) {
      if (passkey === process.env.ADMIN_PASSKEY) {
        userRole = 'admin';
	isAdmin = 1; // Mark as admin
      } else {
        return res.status(403).json({ error: 'Invalid admin passkey.' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone_number, role, is_admin) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone_number, userRole, isAdmin]
    );

    req.session.user = { id: result.insertId, name, role: userRole, isAdmin }; // Save user in session
    if (isAdmin) {
      return res.redirect('/admin');
    }

    res.status(201).redirect('/products');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate fields
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if user exists
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { id, name, role, is_admin, password: hashedPassword } = user[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id, name, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    req.session.user = { id, name, role, isAdmin: is_admin, token }; // Save user in session
    if (is_admin === 1) {
	return res.status(200).redirect('/admin');
    }

    res.status(200).redirect('/products');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// User logout
router.post('/logout', (req, res) => {
  console.log('Logout route accessed');
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('An error occurred while logging out.');
    }
    res.redirect('/');
  });
});

router.post('/admin/logout', (req, res) => {
  console.log('Admin Logout route accessed');
  req.session.destroy(err => {
    if (err) {
       console.error('Logout error:', err);
       return res.status(500).send('An error occurred while logging out.');
    }
    res.redirect('/');
  });
});

// Middleware to check if user is authenticated and authorized (role-based access)
function authenticateUser(req, res, next) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Get the token from the header

  if (!token && !req.session.user) {
    return res.status(403).json({ error: 'No token or session provided.' });
  }

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
      }
      req.user = user;
      next();
    });
  } else {
    req.user = req.session.user; // Use session data if token is not present
    next();
  }
}

// Middleware for checking if user is an admin
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      return next();
    }
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  };
}

// Export router and middleware
module.exports = {
  router,
  authenticateUser,
  authorizeRole,
};
