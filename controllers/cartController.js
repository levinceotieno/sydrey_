const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    await cartModel.addToCart(req.session.user.id, productId, quantity);
    res.json({ success: true, message: 'Product added to cart!' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.viewCart = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/auth/login');

    const cartItems = await cartModel.getCart(userId);
    res.render('cart', { cartItems });
  } catch (error) {
    console.error('Error viewing cart:', error);
    res.status(500).send('Server error.');
  }
}

exports.checkout = async (req, res) => {
  try {
    const { deliveryAddress, withinKenya } = req.body;
    const cart = await cartModel.getCart(req.session.user.id);

    const deliveryDate = deliveryLocation === 'withinKenya'
	  ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
	  : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    for (const item of cart) {
      await orderModel.createOrder(
        req.session.user.id,
        item.product_id,
        item.quantity,
        deliveryAddress,
        withinKenya,
        deliveryDate
      );
    }

    await cartModel.clearCart(req.session.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ success: false });
  }
};
