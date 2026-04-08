const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'BOOKING_CONFIRM',
        'BOOKING_CANCEL',
        'PROVIDER_APPROVED',
        'PROVIDER_REJECTED',
        'JOB_ASSIGNED',
        'PROVIDER_ON_WAY',
        'PROVIDER_ARRIVED',
        'JOB_COMPLETED',
        'OTP',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['SENT', 'FAILED', 'PENDING'],
      default: 'PENDING',
    },
    twilioSid: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SmsLog', smsLogSchema);
