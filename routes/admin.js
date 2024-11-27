const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authenticateUser, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// Set up multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './public/uploads'; // Image upload directory
    cb(null, dir); // Store image in this folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file to avoid conflicts
  }
});

const upload = multer({ storage: storage });

// Protect routes for Admins only
router.use(authenticateUser, authorizeRole('admin'));

// Admin dashboard
router.get('/', authenticateUser, authorizeRole('admin'), async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.render('admin', { user: req.user, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add Product
router.post('/add-product', upload.single('image'), async (req, res) => {
  const { name, description, price, quantity, category } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Get uploaded file path

  try {
     await db.query(
	'INSERT INTO products (name, description, price, quantity, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
	[name, description, price, quantity, category, image_url]
     );
     res.redirect('/admin');
  } catch (err) {
     console.error(err);
     res.status(500).json({ error: 'Failed to add product.' });
  }
});

// View Orders
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT orders.id, users.name AS user_name, products.name AS product_name, orders.quantity, orders.status, orders.created_at
      FROM orders
      JOIN users ON orders.user_id = users.id
      JOIN products ON orders.product_id = products.id
    `);
    res.render('admin-orders', { orders }); // Render an 'admin-orders.ejs' view
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Update Order Status
router.patch('/update-order/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Status sent from the form

  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.redirect('/admin/orders'); // Redirect back to the orders page after update
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).send('Failed to update order status.');
  }
});

// Edit Product
router.post('/edit-product/:id', upload.single('image'), async (req, res) => {
   const { id } = req.params;
   const { name, description, price, quantity, category } = req.body;
   const image_url = req.file ? `/uploads/${req.file.filename}` : null;

   try {
      // Update query for product details
      let query = 'UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, category = ?';
      const params = [name, description, price, quantity, category];

      // Check if an image is uploaded
      if (image_url) {
         query += ', image_url = ?';
	 params.push(image_url);
      }
      query += ' WHERE id = ?';
      params.push(id);

      await db.query(query, params);
      res.redirect('/admin');
   } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).send('Failed to update product.');
   }
});

router.post('/delete-product/:id', async (req, res) => {
   const productId = req.params.id;

   try {
      // Delete product from the database
      await db.query('DELETE FROM products WHERE id = ?', [productId]);
      res.redirect('/admin'); // Redirect to the admin dashboard after deletion
   } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).send('An error occurred while deleting the product.');
   }
});

module.exports = router;
