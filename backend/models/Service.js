const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'indoor_living',
        'kitchen_dining',
        'floor_surface',
        'outdoor',
        'deep_cleaning',
      ],
    },
    categoryLabel: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    whatIncluded: [{ type: String }],
    icon: {
      type: String,
      default: '🧹',
    },
    image: {
      type: String,
      default: null,
    },
    // Pricing in INR
    basePrice: {
      type: Number,
      required: true,
    },
    priceUnit: {
      type: String,
      enum: ['per_visit', 'per_hour', 'per_room', 'per_sqft'],
      default: 'per_visit',
    },
    priceLabel: {
      type: String, // e.g. "Starting from ₹499"
    },
    // Add-on pricing
    addOns: [
      {
        name: String,
        description: String,
        price: Number,
      },
    ],
    duration: {
      min: { type: Number }, // minutes
      max: { type: Number },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isImmediate: {
      type: Boolean,
      default: true, // Can be booked same-day
    },
    tags: [{ type: String }],
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
