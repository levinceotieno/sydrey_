const express = require('express');
const router = express.Router();
const cartModel = require('../models/cartModel');
const cartController = require('../controllers/cartController');
const db = require('../db');

// Function to calculate delivery date
function calculateDeliveryDate(deliveryLocation) {
   if (deliveryLocation === 'withinKenya') {
      return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
   } else {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
   }
}

// Add to Cart Route
router.post('/add', async (req, res) => {
  try {
    const userId = req.session.user.id; // Ensure user ID is obtained from session
    const { productId, quantity } = req.body; // Include quantity in the request

    if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID are required.' });
    }

    await cartModel.addToCart(userId, productId, quantity || 1); // Default quantity to 1
    const cartItems = await cartModel.getCart(userId); // Retrieve updated cart

    res.json({ success: true, cartCount: cartItems.length });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Failed to add to cart.' });
  }
});

// View Cart Route
router.get('/', async (req, res) => {
   try {
      const userId = req.session.user?.id; // Ensure user ID is fetched from the session
      if (!userId) {
	  return res.redirect('/auth/login'); // Redirect to login if user is not logged in
      }

      const cartItems = await cartModel.getCart(userId);
      console.log('Cart Items:', cartItems); // Log the cart items

      const updatedCart = cartItems.map(item => {
	 const price = parseFloat(item.price);
	 const quantity = parseInt(item.quantity);
	 return {
	   ...item,
	   price: price, // Ensure price is a number
	   quantity: quantity, // Ensure quantity is a number
	   total_price: price * quantity // Add total price calculation
	 };
      });

      const grandTotal = updatedCart.reduce((total, item) => {
	  return total + (parseFloat(item.price) * item.quantity);
      }, 0);

      res.render('cart', { 
	 cart: updatedCart,
	 cartCount: updatedCart.length,
	 grandTotal: grandTotal,
	 userId, // Pass userId to the EJS template
	 user: req.session.user
      });
   } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).send('Failed to fetch cart.');
   }
});

// Checkout
router.post('/checkout', async (req, res) => {
   const { userId, deliveryLocation, deliveryAddress } = req.body;

   console.log('Request Body:', req.body);
   if (!userId || !deliveryLocation || !deliveryAddress) {
      return res.status(400).json({ message: 'All fields are required' });
   }

   try {
      // Retrieve all items from the user's cart
      const cartItems = await cartModel.getCart(userId);

      if (cartItems.length === 0) {
	 return res.status(400).json({ message: 'Cart is empty.' });
      }

      // Calculate delivery date based on location
      const deliveryDate = calculateDeliveryDate(deliveryLocation);

      // Calculate total price for the entire order
      const totalOrderPrice = cartItems.reduce((total, item) => {
	// Make sure to parse values to numbers and multiply by quantity
	const price = parseFloat(item.price);
	const quantity = parseInt(item.quantity, 10);
	return total + (price * quantity);
      }, 0);

      const [orderResult] = await db.query(
	 'INSERT INTO orders (user_id, delivery_location, delivery_address, delivery_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)', 
	 [userId, deliveryLocation, deliveryAddress, deliveryDate, totalOrderPrice, 'Pending']
      );

      const orderId = orderResult.insertId;

      // Insert each cart item into the orders table
      for (const item of cartItems) {
	 console.log('Cart Items:', cartItems);

	 // Insert each cart item into order_products table
         await db.query(
	    'INSERT INTO order_products (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', 
	    [orderId, item.product_id, item.quantity, item.price]
	 );
      }

      // Clear the cart after successful checkout
      await cartModel.clearCart(userId);
      res.status(201).json({ message: 'Order placed successfully', orderId });
   } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ message: 'Failed to place order' });
   }
});

router.post('/update', async (req, res) => {
   try {
       const userId = req.session.user?.id;
       const { productId, quantity } = req.body;

       if (!userId) {
	  return res.status(401).json({ success: false, message: 'Please log in to update the cart.' });
       }

       if (quantity < 1) {
	  return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
       }

       await cartModel.updateCartItem(userId, productId, quantity); // Update the item quantity
       const cartItems = await cartModel.getCart(userId); // Fetch updated cart items                 
       res.json({ success: true, cartCount: cartItems.length, message: 'Cart updated successfully.' });
   } catch (error) {
       console.error('Error updating cart:', error);
       res.status(500).json({ success: false, message: 'Failed to update the cart.' });
   }
});

router.post('/remove', async (req, res) => {
   try {
       const userId = req.session.user?.id;
       const { productId } = req.body;

       if (!userId) {
          return res.status(401).json({ success: false, message: 'Please log in to remove items from the cart.' });
       }

       await cartModel.removeCartItem(userId, productId); // Remove the item from the cart
       const cartItems = await cartModel.getCart(userId); // Fetch updated cart items

       res.json({ success: true, cartCount: cartItems.length, message: 'Item removed from cart.' });
   } catch (error) {
       console.error('Error removing item from cart:', error);
       res.status(500).json({ success: false, message: 'Failed to remove item from the cart.' });
   }
});

module.exports = router;
