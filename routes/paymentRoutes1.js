const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');

// Paystack API Key
const PAYSTACK_SECRET_KEY = 'sk_test_936bdc0d3bfb54788eda7f99199f1896866a21df';

// Initialize Payment
router.post('/initialize', async (req, res) => {
    const { email, amount, userId, deliveryLocation, deliveryAddress } = req.body;

    try {
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: amount * 100, // Paystack expects amount in kobo
		metadata: {
		   userId,
		   deliveryLocation,
		   deliveryAddress,
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
router.get('/verify/:reference', async (req, res) => {
    const { reference } = req.params;

    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error verifying payment:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to verify payment' });
    }
});

router.post('/callback', async (req, res) => {
  const event = req.body;
    // Verify the event is from Paystack
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

	   if (paymentData.status === 'success') {
	      // Payment was successful
	      const { metadata } = paymentData.data;

	      // Place the order using metadata (e.g., userId, delivery details)
	      const orderResponse = await fetch('/cart/checkout', {
		    method: 'POST',
		    headers: {
			'Content-Type': 'application/json',
		    },
		    body: JSON.stringify({
			userId: metadata.userId,
			deliveryLocation: metadata.deliveryLocation,
			deliveryAddress: metadata.deliveryAddress,
		    }),
	      });

	       const orderResult = await orderResponse.json();

	       if (orderResponse.ok) {
		  console.log('Order placed successfully:', orderResult);
		  res.status(200).json({ message: 'Order placed successfully' });
	       } else {
		  console.error('Failed to place order:', orderResult.message);
		  res.status(500).json({ message: 'Failed to place order' });
	       }
	   } else {
	       console.error('Payment verification failed:', paymentData.message);
	       res.status(400).json({ message: 'Payment verification failed' });
	   }
       } catch (error) {
	  console.error('Error verifying payment:', error);
	  res.status(500).json({ message: 'Error verifying payment' });
       }
    } else {
	res.status(200).json({ message: 'Event not handled' });
    }
});

module.exports = router;
