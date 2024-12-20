const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// View order history
router.get('/history', orderController.viewOrderHistory);

router.post('/update-order-status', async (req, res) => {
  const { orderId, status } = req.body;
  try {
      await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
      res.json({ success: true });
  } catch (err) {
     console.error('Error updating order status:', err);
     res.status(500).json({ success: false, message: 'Failed to update order status' })
  }
});

router.delete('/delete-order/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await db.query('DELETE FROM orders WHERE id = ?', [id]);
      res.json({ success: true });
  } catch (err) {
      console.error('Error deleting order:', err);
      res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
});

module.exports = router;
