const express = require('express');
const router = express.Router();
const { confirmBooking, getBookings, updateBookingStatus, updateRideStatus } = require('../controller/bookingController');
const accountMiddleware = require('../middleware/account');

// Confirm Booking API
router.post('/confirm', accountMiddleware, confirmBooking);

// Get Bookings API
router.get('/', accountMiddleware, getBookings);
router.patch('/update/:id', accountMiddleware, updateBookingStatus);
router.patch('/rideStatus/update/:id', accountMiddleware, updateRideStatus);

module.exports = router;
