const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// View order history
router.get('/history', orderController.viewOrderHistory);

// Update order status
router.post('/update-order-status', async (req, res) => {
  const { orderId, status } = req.body;
  try {
      await req.db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
      res.json({ success: true, message: 'Order status updated successfully' });
  } catch (err) {
     console.error('Error updating order status:', err);
     res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Delete an order
router.delete('/delete-order/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await req.db.query('DELETE FROM orders WHERE id = ?', [id]);
      res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
      console.error('Error deleting order:', err);
      res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
});

module.exports = router;
