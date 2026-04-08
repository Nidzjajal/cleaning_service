const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session for a booking
 * Amount in paise (INR smallest unit = paise, 1 INR = 100 paise)
 */
const createCheckoutSession = async ({ amountInr, bookingRef, customerId, serviceId }) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: `HelpLender Booking: ${bookingRef}`,
          },
          unit_amount: Math.round(amountInr * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    // We will redirect them back to the frontend dashboard or a success page
    success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/customer/dashboard?payment=success&bookingRef=${bookingRef}`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/customer/dashboard?payment=cancel`,
    client_reference_id: bookingRef,
    metadata: {
      bookingRef,
      customerId: customerId.toString(),
      serviceId: serviceId.toString(),
      platform: 'helplender',
    },
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
};

/**
 * Confirm that a payment was successful (used in webhook)
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

/**
 * Process Stripe webhook event
 */
const constructWebhookEvent = (payload, signature, webhookSecret) => {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};

/**
 * Refund a payment
 */
const refundPayment = async (paymentIntentId, amountInr = null) => {
  const params = { payment_intent: paymentIntentId };
  if (amountInr) params.amount = Math.round(amountInr * 100);
  return await stripe.refunds.create(params);
};

module.exports = {
  createCheckoutSession,
  retrievePaymentIntent,
  constructWebhookEvent,
  refundPayment,
};
