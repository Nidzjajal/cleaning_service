const mongoose = require('mongoose');

const cancellationSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['CANCEL', 'POSTPONE'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    details: {
      originalDate: { type: Date },
      originalTime: { type: String },
      newDate: { type: Date },
      newTime: { type: String },
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'],
      default: 'PROCESSED',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cancellation', cancellationSchema);
