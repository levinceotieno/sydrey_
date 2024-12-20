const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Function to get admin orders
const getAdminOrders = async (db) => {
  try {
    const [orders] = await db.query(`
      SELECT
        o.id AS order_id,
        o.user_id,
        u.name AS customer_name,
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
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC;
    `);
    return orders;
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
};

// Middleware to ensure database connection
const requireDatabase = (req, res, next) => {
  if (!req.db) {
    return res.status(500).send('Database connection not established');
  }
  next();
};

// Route to fetch and render admin orders
router.get('/orders', requireDatabase, async (req, res) => {
  try {
    // Use the database connection from the request
    const orders = await getAdminOrders(req.db);
    
    console.log('Admin Orders:', orders);
    
    // Render the admin-orders view with fetched orders
    res.render('admin-orders', { orders });
  } catch (error) {
    console.error('Error in admin orders route:', error);
    res.status(500).render('error', { 
      message: 'Failed to load orders. Please try again later.',
      error: error.message 
    });
  }
});

// Route to update order status
router.post('/orders/:id/update', requireDatabase, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await req.db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    
    res.json({ 
      success: true, 
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status' 
    });
  }
});

// Route to delete an order
router.delete('/orders/:id/delete', requireDatabase, async (req, res) => {
  try {
    const { id } = req.params;

    await req.db.query('DELETE FROM orders WHERE id = ?', [id]);
    
    res.json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete order' 
    });
  }
});

module.exports = router;
