const express = require('express');
const db = require('../db');
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });


// Protect routes for all authenticated users
router.use(authenticateUser);

// View Profile
router.get('/profile', async (req, res) => {
  try {
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (user.length > 0) {
	res.render('profile', { user: user[0] }); // Render profile.ejs with user data
    } else {
	res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// Update Profile
router.post('/profile', async (req, res) => {
  const { name, phone_number, email } = req.body;

  try {
    await db.query(
      'UPDATE users SET name = ?, phone_number = ?, email = ? WHERE id = ?',
      [name, phone_number, email, req.user.id]
    );

    // Update session data
    req.session.user = { 
	...req.session.user, 
	name, 
	phone_number, 
	email 
    };	
    res.redirect('/user/profile');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Place Order
router.post('/place-order', async (req, res) => {
  const { product_id, quantity } = req.body;

  try {
    await db.query(
      'INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [req.user.id, product_id, quantity]
    );
    res.status(201).json({ message: 'Order placed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// View Order History
router.get('/order-history', async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT orders.id, products.name AS product_name, orders.quantity, orders.status FROM orders JOIN products ON orders.product_id = products.id WHERE orders.user_id = ?',
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order history.' });
  }
});

router.post('/profile/photo', upload.single('profilePhoto'), async (req, res) => {
   try {
     const photoPath = `/uploads/${req.file.filename}`;
     await db.query('UPDATE users SET profile_photo = ? WHERE id = ?', [photoPath, req.user.id]);

     // Update session user data
     req.session.user.profile_photo = photoPath;
     res.redirect('/user/profile');
   } catch (err) {
     console.error('Error updating profile photo:', err);
     res.status(500).json({ error: 'Failed to update profile photo.' });
   }
});

module.exports = router;
