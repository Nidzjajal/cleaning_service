const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

// @route POST /api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingRef = session.metadata?.bookingRef;

    if (bookingRef) {
      try {
        const booking = await Booking.findOne({ bookingRef });
        if (booking) {
          booking.paymentStatus = 'PAID';
          booking.statusHistory.push({ status: 'PENDING', changedAt: new Date(), note: 'Payment completed' });
          await booking.save();

          // Create transaction for PAID booking
          await Transaction.create({
            bookingId: booking._id,
            customerId: booking.customerId,
            providerId: null,
            customerPaid: booking.pricing.total,
            commissionRate: booking.pricing.commissionRate,
            adminCommission: booking.pricing.adminCommission,
            providerPayout: booking.pricing.providerEarning,
            paymentMethod: 'CARD',
            status: 'PENDING'
          });

          // Broadcast to all providers that a new paid job is available
          const io = req.app.get('io');
          if (io) {
            io.emit('new-job-request', {
              bookingId: booking._id,
              serviceName: 'Paid Service',
              scheduledDate: booking.scheduledDate,
              scheduledTime: booking.scheduledTime,
              price: booking.pricing.providerEarning,
            });
          }
        }
      } catch (err) {
        console.error('Error handling checkout session completed:', err);
      }
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;
