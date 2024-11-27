const express = require('express');
const db = require('../db'); // Database connection
const cartModel = require('../models/cartModel'); // Include cartModel
const router = express.Router();

// Fetch all products
router.get('/', async (req, res) => {
  try {
    // Fetch products from the database
    const [products] = await db.query('SELECT * FROM products');
    // Fetch cart count from database
    const userId = req.session.user?.id || null; // Check if user is logged in
    const cartCount = userId ? (await cartModel.getCart(userId)).length : 0;

    res.render('products', { products, user: req.session.user, cartCount });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/cart/add', async (req, res) => {
  try {
     const userId = req.session.user?.id;
     const { productId, quantity } = req.body;

     if (!userId) {
	return res.status(401).json({ success: false, message: 'Please log in to add to cart.' });
     }

     await cartModel.addToCart(userId, productId, quantity || 1);
     const cartItems = await cartModel.getCart(userId); // Fetch updated cart items

     res.json({ success: true, cartCount: cartItems.length });
  } catch (error) {
     console.error('Error adding to cart:', error);
	res.status(500).json({ success: false, message: 'Failed to add to cart.' });
  }
});

router.get('/cart', async (req, res) => {
   try {
      const userId = req.session.user.id;
      const cartItems = await cartModel.getCart(userId);

      res.render('cart', { 
	 cart: cartItems, 
	 cartCount: cartItems.length 
      });
   } catch (error) {
      console.error('Error rendering cart page:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.get('/:id', async (req, res) => {
   try {
      const [product] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
      if (product.length === 0) return res.status(404).send('Product not found');
      res.render('product-details', { product: product[0], user: req.session.user });
   } catch (error) {
      res.status(500).send('Error fetching product details');
   }
});

/**
router.post('/cart/update', async (req, res) => {
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

router.post('/cart/remove', async (req, res) => {
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
**/

module.exports = router;
