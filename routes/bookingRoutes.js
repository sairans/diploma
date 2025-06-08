const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const {
  createBooking,
  updateBooking,
  deleteBooking,
  getMyBookings,
  getAllBookings,
  getOccupiedSlots,
  getAvailableSlots,
  getNearbyGrounds,
  getBookingsByGround
} = require('../controllers/bookingController');

router.get('/my', protect, getMyBookings);

router.post('/', protect, createBooking);

router.get('/occupied', getOccupiedSlots);

router.get('/available', getAvailableSlots);

router.get('/nearby', getNearbyGrounds);

router.get('/all', protect, admin, getAllBookings);

router.put('/:id', protect, updateBooking);

router.delete('/:id', protect, deleteBooking);

router.get('/ground/:groundId', protect, getBookingsByGround);

module.exports = router;
