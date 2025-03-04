const orderModel = require('../models/orderModel');

exports.viewOrderHistory = async (req, res) => {
  try {
    const orders = await orderModel.getOrderHistory(req.session.user.id);
    res.render('orderHistory', { orders });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).send('Server error.');
  }
};
