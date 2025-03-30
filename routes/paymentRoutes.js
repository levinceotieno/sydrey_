const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');

// Paystack API Key
const PAYSTACK_SECRET_KEY = 'sk_test_936bdc0d3bfb54788eda7f99199f1896866a21df';

// Initialize Payment
router.post('/initialize', async (req, res) => {
  const { email, amount, userId, deliveryLocation, deliveryAddress, deliveryDate } = req.body;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        callback_url: `${req.protocol}://${req.get('host')}/payment/verify`, // Add redirect URL
        metadata: {
          userId,
          deliveryLocation,
          deliveryAddress,
          deliveryDate
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error initializing payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to initialize payment' });
  }
});

// Verify Payment
router.get('/verify', async (req, res) => {
  const { reference } = req.query;
  
  if (!reference) {
    return res.redirect('/cart?error=Missing payment reference');
  }
  
  try {
    // Verify the payment
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    
    const paymentData = response.data;
    console.log('Payment verification data:', paymentData);
    
    if (paymentData.status && paymentData.data.status === 'success') {
      // Get the metadata
      const { metadata } = paymentData.data;
      const userId = metadata.userId;
      
      try {
        // Get cart items for the user
        const [cartItems] = await db.query(
          'SELECT c.*, p.price, p.name FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?', 
          [userId]
        );
        
        if (cartItems.length === 0) {
          return res.redirect('/cart?error=Cart is empty');
        }
        
        // Calculate total amount
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        // Create the order using your schema (without payment_reference)
        const [orderResult] = await db.query(
          'INSERT INTO orders (user_id, total_price, delivery_address, delivery_location, status, delivery_date) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, totalAmount, metadata.deliveryAddress, metadata.deliveryLocation, 'pending', metadata.deliveryDate]
        );
        
        const orderId = orderResult.insertId;
        
        // Add order items to order_products table
        for (const item of cartItems) {
          await db.query(
            'INSERT INTO order_products (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.product_id, item.quantity, item.price]
          );
        }
        
        // Clear the user's cart
        await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);
        
        // Redirect to success page
        return res.redirect(`/payment/success?reference=${reference}&orderId=${orderId}`);
      } catch (dbError) {
        console.error('Database error when processing order:', dbError);
        return res.redirect('/cart?error=Failed to create order: ' + dbError.message);
      }
    } else {
      // Payment failed
      return res.redirect('/cart?error=Payment verification failed');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.redirect('/cart?error=Payment verification error: ' + error.message);
  }
});

// Success page after payment
router.get('/success', async (req, res) => {
  const { reference, orderId } = req.query;
  
  try {
    // Verify the payment again to get details
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    
    const paymentData = response.data;
    
    // Get order details
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).render('error', { message: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Render success page
    return res.render('payment-success', { 
      reference,
      amount: paymentData.data.amount / 100, // Convert from kobo
      orderId,
      order
    });
  } catch (error) {
    console.error('Error rendering success page:', error);
    return res.render('error', { message: 'Error retrieving order details' });
  }
});

// Webhook for Paystack (should be set up in the Paystack dashboard)
router.post('/callback', async (req, res) => {
  // Verify signature if available
  const hash = req.headers['x-paystack-signature'];
  
  try {
    // Log the event for debugging
    console.log('Webhook payload:', req.body);
    
    const event = req.body;
    
    // Verify the event is a charge.success
    if (event.event === 'charge.success') {
      const { reference } = event.data;
      
      try {
        // Verify the payment
        const verifyResponse = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
          }
        );
        
        const paymentData = verifyResponse.data;
        
        if (paymentData.status && paymentData.data.status === 'success') {
          const { metadata } = paymentData.data;
          const userId = metadata.userId;
          
          // Check if an order with this user has already been processed recently
          // This prevents duplicate orders if both callback and verify endpoints process the same payment
          const [existingOrders] = await db.query(
            'SELECT id FROM orders WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
            [userId]
          );
          
          if (existingOrders.length > 0) {
            console.log('An order was already created for this payment');
            return res.status(200).json({ message: 'Order already processed' });
          }
          
          // Get cart items
          const [cartItems] = await db.query(
            'SELECT c.*, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?', 
            [userId]
          );
          
          if (cartItems.length === 0) {
            return res.status(200).json({ message: 'Cart is empty' });
          }
          
          // Calculate total
          const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
          
          // Create order
          const [orderResult] = await db.query(
            'INSERT INTO orders (user_id, total_price, delivery_address, delivery_location, status, delivery_date) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, totalAmount, metadata.deliveryAddress, metadata.deliveryLocation, 'pending', metadata.deliveryDate]
          );
          
          const orderId = orderResult.insertId;
          
          // Add order items
          for (const item of cartItems) {
            await db.query(
              'INSERT INTO order_products (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
              [orderId, item.product_id, item.quantity, item.price]
            );
          }
          
          // Clear cart
          await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);
          
          console.log('Order processed via webhook:', orderId);
          return res.status(200).json({ message: 'Order processed successfully' });
        }
      } catch (error) {
        console.error('Error processing webhook:', error);
      }
    }
    
    // Always respond with 200 to Paystack
    return res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return res.status(200).json({ message: 'Webhook received with errors' });
  }
});

module.exports = router;
