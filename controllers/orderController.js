const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel'); // Add this line to import the cart model

exports.viewOrderHistory = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const orders = await orderModel.getOrderHistory(userId);
    
    // Get cart items to calculate cart count
    const cartItems = await cartModel.getCart(userId);
    const cartCount = cartItems.length;
    
    res.render('orderHistory', { 
      orders, 
      cartCount,
      user: req.session.user // Also pass the user object which is needed in the template
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).send('Server error.');
  }
};
