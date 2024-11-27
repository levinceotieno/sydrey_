const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// View order history
router.get('/history', orderController.viewOrderHistory);

module.exports = router;
