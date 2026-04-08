const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  getAvailableProviders,
  updateBookingStatus,
  acceptBooking,
  rejectBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

router.get('/available-providers', protect, getAvailableProviders);
router.get('/my', protect, authorize('customer'), getMyBookings);
router.post('/', protect, authorize('customer'), createBooking);
router.get('/:id', protect, getBooking);
router.post('/:id/accept', protect, authorize('provider'), acceptBooking);
router.post('/:id/reject', protect, authorize('provider'), rejectBooking);
router.put('/:id/status', protect, authorize('provider', 'admin'), updateBookingStatus);

module.exports = router;
