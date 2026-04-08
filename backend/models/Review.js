const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    tags: [
      {
        type: String,
        enum: ['punctual', 'thorough', 'professional', 'friendly', 'value'],
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    // Provider reply
    providerReply: {
      type: String,
      maxlength: 500,
    },
    providerRepliedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// After review saved, update provider's average rating
reviewSchema.post('save', async function () {
  const ProviderProfile = mongoose.model('ProviderProfile');
  const reviews = await mongoose
    .model('Review')
    .find({ providerId: this.providerId });
  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;
  await ProviderProfile.findOneAndUpdate(
    { userId: this.providerId },
    { rating: Math.round(avg * 10) / 10, totalReviews: reviews.length }
  );
});

module.exports = mongoose.model('Review', reviewSchema);
