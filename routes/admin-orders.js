// routes/admin-orders.js
const express = require('express');
const { getOrdersFromDatabase } = require('../utils/database');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await getAdminOrders();
    console.log('Admin Orders:', orders);
    res.render('admin-orders', { orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).render('error', { message: 'Failed to load orders. Please try again later.' });
  }
});

module.exports = router;
