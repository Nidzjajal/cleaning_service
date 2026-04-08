const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');

// @desc  Create a review for a booking
// @route POST /api/reviews
// @access Private (customer)
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment, tags } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'You can only review completed services' });
    }

    // Check if user is the owner
    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You already reviewed this booking' });
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user.id,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      rating,
      comment,
      tags,
    });

    // Update booking to mark as reviewed
    await Booking.findByIdAndUpdate(bookingId, { status: 'REVIEWED' });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc  Get reviews for a provider
// @route GET /api/reviews/provider/:providerId
// @access Public
const getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ providerId: req.params.providerId })
      .populate('customerId', 'name avatar')
      .populate('serviceId', 'name icon')
      .sort('-createdAt');

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProviderReviews,
};
