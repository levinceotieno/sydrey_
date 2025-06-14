const express = require('express');
const db = require('./db');
const mysql = require('mysql2/promise'); // Use promise-based version of mysql2
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const fs = require('fs');
require('dotenv').config();
const flash = require('express-flash');
const { router: authRoutes } = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const blogRoutes = require('./routes/blogs');
const { getOrdersFromDatabase } = require('./utils/database');
const { authenticateUser, authorizeRole } = require('./middleware/auth');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//app.use("/.well-known", express.static("public/.well-known"));
app.use("/.well-known", express.static(path.join(__dirname, "public/.well-known"), {
   setHeaders: (res, path, stat) => {
      res.set("Content-Type", "application/json");
   }
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
	  ca: fs.readFileSync(path.join(__dirname, 'config', 'ca.pem')), // Use CA cert
	  rejectUnauthorized: true,
    },
}, db);

app.use(session({
    secret: process.env.SESSION_SECRET, // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // Use MySQL to persist sessions
    cookie: {
	secure: false, // Set to true if using HTTPS
	maxAge: 24 * 60 * 60 * 1000, // 1 day
	sameSite: 'Lax',
    },
}));

app.use((req, res, next) => {
  console.log('Session:', req.session);
  next();
});

app.use(flash());

// Middleware to inject `db` into requests
app.use((req, res, next) => {
  req.db = db; // Attach the database connection to the request object
  next();
});

// Error handler for database disconnections
db?.on('error', (err) => {
  console.error('Database error:', err);
});

app.use((req, res, next) => {
   console.log('Session:', req.session);
   next();
});

app.use((req, res, next) => {
   console.log('Incoming Request:');
   console.log('Method:', req.method);
   console.log('URL:', req.url);
   console.log('Headers:', req.headers);
   console.log('Body:', req.body);
   next();
});

app.use('/bookings', bookingRoutes);

app.use(async (req, res, next) => {
  if (!req.session.user) {
     return next();
  }

  try {
    const [cartResults] = await db.query(
	'SELECT COUNT(*) as count FROM cart WHERE user_id = ?',
	[req.session.user.id]
    );
    res.locals.cartCount = cartResults[0]?.count || 0;
  } catch (error) {
    console.error('Error fetching cart count:', error);
    res.locals.cartCount = 0;
  }
  next();
});

// Routes
app.get('/', async (req, res) => {
  try {
    // Fetch featured products from the database
    const [featuredProducts] = await db.query('SELECT * FROM products LIMIT 200'); // Adjust the query as needed
    // Render the index.ejs template and pass the featuredProducts data
    res.render('index', { featuredProducts });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/checkout', (req, res) => {
  const userId = req.session.userId; // Or however you store the user's ID
  res.render('checkout', { userId });
});

app.get('/orders', (req, res) => {
  const userId = req.user.id; // Assuming user id is available through session or JWT

  const query = `
     SELECT o.id, o.user_id, o.product_id, o.delivery_address, o.delivery_location, o.quantity, o.status, o.delivery_date, o.total_price, p.name, p.price
     FROM orders o
     JOIN cart c ON o.user_id = c.user_id
     JOIN products p ON c.product_id = p.id
     WHERE o.user_id = ?;
    `;
    db.query(query, [userId], (err, results) => {
       if (err) throw err;
       res.json(results);
    });
});

app.get('/admin/orders', async (req, res) => {
  try {
     const [orders] = await db.query(`
	SELECT 
	   o.id AS order_id,
	   o.user_id,
	   o.total_price,
	   o.delivery_address,
	   o.status,
	   o.delivery_date,
	   o.created_at,
	   JSON_ARRAYAGG(
	     JSON_OBJECT(
		'product_name', p.name,
		'quantity', op.quantity,
		'price', p.price
	     )
	   ) AS products
        FROM orders o
	JOIN order_products op ON o.id = op.order_id
	JOIN products p ON op.product_id = p.id
	GROUP BY o.id;
       `);

       console.log('Raw Orders:', orders);
       const parsedOrders = orders.map(order => {
          console.log('Products Before Parsing:', order.products, typeof order.products);
	  return {
	     ...order,
	     products: typeof order.products === 'string' ? JSON.parse(order.products) : order.products
	  };
       });
       console.log('Parsed Orders:', parsedOrders);

       const [cartResults] = await db.query(
	  'SELECT COUNT(*) as count FROM cart WHERE user_id = ?',
	  [req.session.user.id]
       );
       const cartCount = cartResults[0]?.count || 0; // Default to 0 if cartResults is empty

       res.render('admin-orders', { orders: parsedOrders, user: req.session.user, cartCount });
  } catch (err) {
      console.error('Error fetching admin orders:', err.message);
      res.status(500).send('Error fetching orders.');
  }
});

app.get('/terms', (req, res) => {
  res.render('terms', {
    title: 'Terms and Conditions - Sydrey Enterprise'
  });
});

app.post('/admin/orders/update-status/:id', async (req, res) => {
     console.log('Update Status Route - Params:', req.params);
     console.log('Update Status Route - Body:', req.body);

     const { id } = req.params;
     const { status } = req.body;

     console.log(`Attempting to update order ${id} to status: ${status}`);

     if (!status) {
	console.log('NO STATUS PROVIDED');
        return res.status(400).json({
        message: 'Status is required'
	});
     }

     try {
	   console.log(`Attempting to update order ${id} to status: ${status}`);
	   const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
	   console.log('Update result:', result);

	   if (result.affectedRows === 0) {
	      console.log('NO ROWS AFFECTED');
	      return res.status(404).json({
	      message: 'Order not found',
	      id
	      });
	   }

	   res.json({ 
	      message: 'Order status updated successfully', 
	      id, 
	      newStatus: status 
	   });
     } catch (err) {
	   console.error('FULL ERROR in Update Status:', err);
	   res.status(500).json({ 
	       message: 'Failed to update order status',
	       error: err.message 
	   });
     }
});

app.delete('/admin/orders/:id/delete', authenticateUser, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;

    if (!id) {
	return res.status(400).json({ message: 'Order ID is required' });
    }

    try {
	const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);

	console.log('Delete query result:', result);

	if (result.affectedRows === 0) {
	    return res.status(404).send('Order not found or already deleted.');
	}

	res.json({ message: 'Order deleted successfully' });
    } catch (err) {
	console.error('Error deleting order:', err);
	res.status(500).json({ message: 'Failed to delete order', error: err.message });
    }
});

app.post('/orders/delete/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.session.user.id;

  console.log('User ID:', userId);

    try {
	await db.query('DELETE FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
	res.redirect('/orders/history');
    } catch (err) {
	console.error(err);
	res.status(500).send('Failed to delete order');
    }
});

app.put('/admin/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const query = `
     UPDATE orders
     SET status = ?
     WHERE id = ?;
    `;

  db.query(query, [status, orderId], (err, result) => {
     if (err) throw err;
     res.json({ message: 'Order status updated successfully' });
  });
});

app.get('/user/orders', async (req, res) => {
  if (!req.session.userId) {
     return res.redirect('/auth/login'); // Redirect to login if not authenticated
  }

  try {
     const userId = req.session.userId;

     const [orders] = await db.query(`
	SELECT 
	   o.id AS order_id,
	   p.name AS product_name,
           o.quantity,
	   p.price,
	   (o.quantity * p.price) AS total_price,
	   o.delivery_address,
	   o.delivery_location,
	   o.status,
	   o.delivery_date,
	   o.created_at
	FROM orders o
	JOIN products p ON o.product_id = p.id
	WHERE o.user_id = ?
	ORDER BY o.created_at DESC;
     `, [userId]);
     res.render('orderHistory', { orders });
  } catch (error) {
       console.error('Error fetching user orders:', error);
       res.status(500).send('Error fetching orders.');
  }
});

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/products', productsRoutes);

// Authentication Routes
app.use('/auth', authRoutes); // Routes from auth.js are accessible at the root level
app.use('/orders', ordersRoutes);
app.use('/cart', cartRoutes);
app.use(blogRoutes);
app.use('/payment', paymentRoutes);

app.all('*', (req, res, next) => {
    console.log(`Received ${req.method} request to ${req.path}`);
    next();
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
