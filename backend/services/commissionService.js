/**
 * Commission Service
 * ALL commission calculations happen SERVER-SIDE only.
 * Never trust the frontend for commission amounts.
 */

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '0.20');

/**
 * Calculate pricing breakdown for a booking
 * @param {number} subtotal - base price from service
 * @param {number} addOnsTotal - add-on prices
 * @param {number} discount - any discount applied
 * @param {number} customRate - override commission rate (admin-set)
 */
const calculatePricing = (
  subtotal,
  addOnsTotal = 0,
  discount = 0,
  customRate = null
) => {
  const rate = customRate !== null ? customRate : COMMISSION_RATE;
  const total = Math.max(0, subtotal + addOnsTotal - discount);
  const adminCommission = Math.round(total * rate);
  const providerEarning = total - adminCommission;

  return {
    subtotal,
    addOnsTotal,
    discount,
    total,
    commissionRate: rate,
    adminCommission,
    providerEarning,
  };
};

/**
 * Verify that the frontend-submitted price matches what server expects.
 * Used as a security check in booking creation.
 */
const verifyPricing = (submittedTotal, serviceBasePrice, addOnsTotal = 0, discount = 0) => {
  const expected = serviceBasePrice + addOnsTotal - discount;
  const tolerance = 1; // ₹1 rounding tolerance
  return Math.abs(submittedTotal - expected) <= tolerance;
};

/**
 * Get the platform's total earned commission
 */
const getPlatformSummary = async () => {
  const Transaction = require('../models/Transaction');
  const result = await Transaction.aggregate([
    { $match: { status: 'COMPLETED' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$customerPaid' },
        totalCommission: { $sum: '$adminCommission' },
        totalProviderPayouts: { $sum: '$providerPayout' },
        count: { $sum: 1 },
      },
    },
  ]);
  return result[0] || {
    totalRevenue: 0,
    totalCommission: 0,
    totalProviderPayouts: 0,
    count: 0,
  };
};

module.exports = { calculatePricing, verifyPricing, getPlatformSummary, COMMISSION_RATE };
