const express = require('express');
const router = express.Router();
const bookingModel = require('../models/bookingModel');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Get bookings page (for users to make bookings)
router.get('/services', authenticateUser, (req, res) => {
  res.render('booking-services', { 
    user: req.session.user 
  });
});

// Form to create a new booking
router.get('/new', authenticateUser, (req, res) => {
  const { service } = req.query;
  if (!service || !['education', 'agronomist'].includes(service)) {
    return res.redirect('/bookings/services');
  }
  
  res.render('booking-form', {
    user: req.session.user,
    service: service
  });
});

// User's booking history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const bookings = await bookingModel.getUserBookings(userId);
    
    res.render('booking-history', {
      user: req.session.user,
      bookings: bookings
    });
  } catch (error) {
    console.error('Error fetching booking history:', error);
    res.status(500).send('Error fetching booking history');
  }
});

// Create a new booking
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { service, bookingDate, bookingTime } = req.body;
    
    // Validate input
    if (!service || !bookingDate || !bookingTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required booking information' 
      });
    }
    
    // Check if the selected time is available
    const isAvailable = await bookingModel.checkAvailability(service, bookingDate, bookingTime);
    if (!isAvailable) {
      return res.status(409).json({ 
        success: false, 
        message: 'This time slot is already booked. Please select another time.' 
      });
    }
    
    // Create the booking
    await bookingModel.createBooking(userId, service, bookingDate, bookingTime);
    
    // If it's an AJAX request, return JSON
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ 
        success: true, 
        message: 'Booking created successfully!' 
      });
    }
    
    // Otherwise redirect to booking history
    res.redirect('/bookings/history');
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Handle response based on request type
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create booking' 
      });
    }
    
    res.status(500).send('Failed to create booking');
  }
});

// Delete a booking
router.post('/delete/:id', authenticateUser, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.session.user.id;
    
    // Only allow users to delete their own bookings unless they're an admin
    if (!req.session.user.isAdmin) {
      const deleted = await bookingModel.deleteBooking(bookingId, userId);
      if (!deleted) {
        return res.status(404).send('Booking not found or not authorized to delete');
      }
    } else {
      await bookingModel.deleteBooking(bookingId);
    }
    
    res.redirect('/bookings/history');
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).send('Failed to delete booking');
  }
});

// Admin routes
router.get('/admin', authenticateUser, authorizeRole('admin'), async (req, res) => {
  try {
    const bookings = await bookingModel.getAllBookings();
    res.render('admin-bookings', { 
      user: req.session.user, 
      bookings: bookings 
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).send('Error fetching bookings');
  }
});

// Update booking status (admin only)
router.post('/admin/update-status/:id', authenticateUser, authorizeRole('admin'), async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updated = await bookingModel.updateBookingStatus(bookingId, status);
    
    if (!updated) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ 
      message: 'Booking status updated successfully',
      id: bookingId,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ 
      message: 'Failed to update booking status',
      error: error.message
    });
  }
});

module.exports = router;
