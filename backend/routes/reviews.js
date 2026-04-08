const express = require('express');
const router = express.Router();
const {
  createReview,
  getProviderReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

router.post('/', protect, authorize('customer'), createReview);
router.get('/provider/:providerId', getProviderReviews);

module.exports = router;
