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

      const updatedCart = cartItems.map(item => ({
	 ...item,
	 totalPrice: item.price * item.quantity // Add total price calculation
      }));

      res.render('cart', { 
	 cart: cartItems, 
	 cartCount: cartItems.length, 
	 userId // Pass userId to the EJS template 
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

      // Insert each cart item into the orders table
      for (const item of cartItems) {
	 console.log('Cart Items:', cartItems);
	 if (!item.product_id) {
	    console.error('Missing product ID for cart item:', item);
	    continue; // Skip items with missing product
	 }

         // Calculate the total price for the item
	 const totalPrice = item.price * item.quantity;

	 // Insert order into the database
         await db.query('INSERT INTO orders (user_id, product_id, quantity, delivery_location, delivery_address, delivery_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
	 userId,
	 item.product_id,
	 item.quantity,
	 deliveryLocation,
	 deliveryAddress,
	 deliveryDate,
	 totalPrice,
	 'Pending'
      ]);
      }

      // Clear the cart after successful checkout
      await cartModel.clearCart(userId);
      res.status(201).json({ message: 'Order placed successfully' });
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
