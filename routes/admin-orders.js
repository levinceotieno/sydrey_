const express = require('express');
const router = express.Router();
const db = require('../db');

async function getAdminOrders() {
  const query = `
    SELECT
      o.id,
      o.user_id,
      o.total_price,
      o.status,
      o.delivery_address,
      o.delivery_location,
      o.delivery_date,
      o.created_at,
      p.name as product_name,
      op.quantity,
      op.price as item_price
    FROM
      orders o
    JOIN
      order_products op ON o.id = op.order_id
    JOIN
      products p ON op.product_id = p.id
    ORDER BY
      o.created_at DESC
  `;

  try {
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
}

// Better approach using GROUP_CONCAT to group order items
async function getGroupedAdminOrders() {
  const query = `
    SELECT
      o.id,
      o.user_id,
      o.total_price,
      o.status,
      o.delivery_address,
      o.delivery_location,
      o.delivery_date,
      o.created_at,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'product_name', p.name,
          'quantity', op.quantity,
          'price', op.price
        )
      ) AS products
    FROM
      orders o
    JOIN
      order_products op ON o.id = op.order_id
    JOIN
      products p ON op.product_id = p.id
    GROUP BY
      o.id
    ORDER BY
      o.created_at DESC
  `;

  try {
    const [rows] = await db.query(query);
    return rows.map(row => ({
      ...row,
      products: row.products // Already an array of objects
    }));
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
}

// Route for the admin orders page
router.get('/admin/orders', async (req, res) => {
  try {
    // Use the grouped version for a better data structure
    const orders = await getGroupedAdminOrders();
    res.render('admin-orders', { orders, user: req.session.user });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).render('error', { message: 'Failed to load orders. Please try again later.' });
  }
});

// Route to update order status
router.post('/admin/orders/update-status/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.redirect('/admin/orders');
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).render('error', { message: 'Failed to update order status.' });
  }
});

// Route to delete an order
router.post('/admin/orders/delete/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // First delete the order products (due to foreign key constraints)
    await connection.query('DELETE FROM order_products WHERE order_id = ?', [id]);
    
    // Then delete the order
    await connection.query('DELETE FROM orders WHERE id = ?', [id]);
    
    await connection.commit();
    res.redirect('/admin/orders');
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting order:', error);
    res.status(500).render('error', { message: 'Failed to delete order.' });
  } finally {
    connection.release();
  }
});

module.exports = router;
