const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
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
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Ledger fields (the 3-column Admin view)
    customerPaid: {
      type: Number,
      required: true,
    },
    commissionRate: {
      type: Number,
      required: true,
    },
    adminCommission: {
      type: Number,
      required: true,
    },
    providerPayout: {
      type: Number,
      required: true,
    },
    // Payment info
    paymentMethod: {
      type: String,
      enum: ['CARD', 'COD'],
    },
    stripePaymentId: {
      type: String,
      default: null,
    },
    stripeTransferId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'REFUNDED', 'DISPUTED'],
      default: 'PENDING',
    },
    // Wallet credit tracking
    walletCredited: {
      type: Boolean,
      default: false,
    },
    walletCreditedAt: {
      type: Date,
      default: null,
    },
    // Notes for admin
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for admin ledger queries
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ providerId: 1 });
transactionSchema.index({ customerId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
