const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    // Booking reference number
    bookingRef: {
      type: String,
      unique: true,
    },
    // Full lifecycle status
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'PROVIDER_ASSIGNED',
        'ON_THE_WAY',
        'ARRIVED',
        'IN_PROGRESS',
        'COMPLETED',
        'REVIEWED',
        'CANCELLED',
      ],
      default: 'PENDING',
    },
    // Scheduling
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String, // "14:30" 24h format
      required: true,
    },
    isImmediate: {
      type: Boolean,
      default: false,
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 120,
    },
    // bufferEndTime = scheduledTime + duration + 30 min buffer
    bufferEndTime: {
      type: Date,
    },
    // Location
    serviceAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: 'Maharashtra' },
      pincode: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    // Live tracking (updated by provider during ON_THE_WAY)
    liveLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
    // Financial breakdown — ALL calculated server-side
    pricing: {
      subtotal: { type: Number, required: true },
      addOnsTotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
      commissionRate: {
        type: Number,
        default: parseFloat(process.env.COMMISSION_RATE || '0.20'),
      },
      adminCommission: { type: Number },
      providerEarning: { type: Number },
    },
    // Add-ons selected
    selectedAddOns: [
      {
        name: String,
        price: Number,
      },
    ],
    // Payment
    paymentMethod: {
      type: String,
      enum: ['CARD', 'COD'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED', 'FAILED'],
      default: 'PENDING',
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
    // Special instructions from customer
    specialInstructions: {
      type: String,
      maxlength: 500,
    },
    // Timestamps for each status change
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    // ETA from Google Distance Matrix
    etaMinutes: {
      type: Number,
      default: null,
    },
    distanceKm: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save: Generate booking reference
bookingSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    this.bookingRef =
      'HL' +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  // Calculate commission and provider earning server-side
  if (this.pricing && this.pricing.total) {
    const rate = this.pricing.commissionRate || 0.2;
    this.pricing.adminCommission = Math.round(this.pricing.total * rate);
    this.pricing.providerEarning =
      this.pricing.total - this.pricing.adminCommission;
  }

  // Calculate buffer end time
  if (this.scheduledDate && this.estimatedDurationMinutes) {
    const buffer = parseInt(process.env.BUFFER_TIME_MINUTES || '30');
    const endTime = new Date(this.scheduledDate);
    const [hours, minutes] = (this.scheduledTime || '00:00').split(':');
    endTime.setHours(parseInt(hours), parseInt(minutes));
    endTime.setMinutes(
      endTime.getMinutes() + this.estimatedDurationMinutes + buffer
    );
    this.bufferEndTime = endTime;
  }

  next();
});

bookingSchema.index({
  providerId: 1,
  scheduledDate: 1,
  status: 1,
});
bookingSchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
