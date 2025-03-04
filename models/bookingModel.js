const db = require('../db');

const bookingModel = {
  // Get all bookings for a specific user
  getUserBookings: async (userId) => {
    try {
      const [bookings] = await db.query(
        `SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC, booking_time DESC`,
        [userId]
      );
      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  // Get all bookings (for admin)
  getAllBookings: async () => {
    try {
      const [bookings] = await db.query(
        `SELECT b.*, u.name, u.email, u.phone_number 
         FROM bookings b 
         JOIN users u ON b.user_id = u.id 
         ORDER BY b.booking_date DESC, b.booking_time DESC`
      );
      return bookings;
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  },

  // Create a new booking
  createBooking: async (userId, service, bookingDate, bookingTime) => {
    try {
      const [result] = await db.query(
        `INSERT INTO bookings (user_id, service, booking_date, booking_time) 
         VALUES (?, ?, ?, ?)`,
        [userId, service, bookingDate, bookingTime]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      const [result] = await db.query(
        `UPDATE bookings SET status = ? WHERE id = ?`,
        [status, bookingId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Delete a booking
  deleteBooking: async (bookingId, userId = null) => {
    try {
      let query = 'DELETE FROM bookings WHERE id = ?';
      const params = [bookingId];
      
      // If userId is provided, add it to the query for security
      if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
      }
      
      const [result] = await db.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  // Check for booking availability (prevent double bookings)
  checkAvailability: async (service, bookingDate, bookingTime) => {
    try {
      // Check if the requested time is already booked
      const [existing] = await db.query(
        `SELECT COUNT(*) as count FROM bookings 
         WHERE service = ? AND booking_date = ? AND booking_time = ?`,
        [service, bookingDate, bookingTime]
      );
      
      return existing[0].count === 0; // Return true if time slot is available
    } catch (error) {
      console.error('Error checking booking availability:', error);
      throw error;
    }
  }
};

module.exports = bookingModel;
