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
  cancelBooking,
  postponeBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

router.get('/available-providers', protect, getAvailableProviders);
router.get('/my', protect, authorize('customer'), getMyBookings);
router.post('/', protect, authorize('customer', 'provider'), createBooking);
router.get('/:id', protect, getBooking);
router.post('/:id/accept', protect, authorize('provider'), acceptBooking);
router.post('/:id/reject', protect, authorize('provider'), rejectBooking);
router.put('/:id/status', protect, authorize('provider', 'admin'), updateBookingStatus);
router.post('/:id/cancel', protect, authorize('customer'), cancelBooking);
router.post('/:id/postpone', protect, authorize('customer'), postponeBooking);

module.exports = router;
