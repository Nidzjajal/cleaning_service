const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skills: [
      {
        type: String,
        enum: [
          'bedroom_cleaning',
          'living_room_cleaning',
          'kitchen_cleaning',
          'bathroom_cleaning',
          'floor_care',
          'carpet_cleaning',
          'upholstery_cleaning',
          'balcony_cleaning',
          'window_cleaning',
          'deep_cleaning',
          'appliance_cleaning',
        ],
      },
    ],
    serviceAreas: [
      {
        city: String,
        pincode: String,
        lat: Number,
        lng: Number,
        radiusKm: { type: Number, default: 15 },
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalJobs: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      default: 300, // ₹300/hour base rate
    },
    experience: {
      type: String,
      enum: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
      default: '0-1 years',
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    languages: [{ type: String }],
    // Availability calendar — days of the week
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: false },
      startTime: { type: String, default: '08:00' }, // 24h format
      endTime: { type: String, default: '20:00' },
    },
    // Total earnings tracked here as well
    totalEarnings: {
      type: Number,
      default: 0,
    },
    pendingPayout: {
      type: Number,
      default: 0,
    },
    completedPayout: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
