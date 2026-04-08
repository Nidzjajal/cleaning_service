const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const { findAvailableProviders } = require('./availabilityService');
const { sendBookingConfirmationSms } = require('./twilioService');

// Runs every 1 minute
const initAutoAssignService = (app) => {
  setInterval(async () => {
    try {
      // Find bookings pending for more than 5 minutes
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const abandonedBookings = await Booking.find({
        status: 'PENDING',
        createdAt: { $lt: fiveMinsAgo }
      }).populate('serviceId customerId');

      if (abandonedBookings.length === 0) return;

      for (const booking of abandonedBookings) {
        console.log(`[AUTO-ASSIGN] Attempting to auto-assign booking ${booking._id}`);
        
        // Find providers
        const providers = await findAvailableProviders({
          serviceId: booking.serviceId._id,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          durationMinutes: booking.estimatedDurationMinutes,
          isImmediate: booking.isImmediate
        });

        if (providers.length > 0) {
          // Pick the highest rated or just the first
          const selectedProvider = providers[0].provider;

          booking.providerId = selectedProvider._id;
          booking.status = 'CONFIRMED';
          booking.statusHistory.push({ status: 'CONFIRMED', changedAt: new Date(), note: 'Auto-assigned by system' });
          await booking.save();

          await Transaction.findOneAndUpdate(
            { bookingId: booking._id },
            { providerId: selectedProvider._id }
          );

          // SMS Customer
          let dateStr = 'TBD';
          try {
            dateStr = new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
          } catch (e) {
            dateStr = String(booking.scheduledDate);
          }

          sendBookingConfirmationSms({
            customerPhone: booking.customerId.phone,
            providerName: selectedProvider.name,
            serviceName: booking.serviceId.name,
            date: dateStr,
            time: booking.scheduledTime,
            bookingRef: booking.bookingRef,
            userId: booking.customerId._id,
            bookingId: booking._id,
          }).catch(console.error);

          // Broadcast taking
          const io = app.get('io');
          if (io) {
            io.emit('job-taken', { bookingId: booking._id });
          }
          console.log(`[AUTO-ASSIGN] Assigned ${selectedProvider.name} to booking ${booking._id}`);
        } else {
           console.log(`[AUTO-ASSIGN] No providers available for booking ${booking._id}. Keeping PENDING.`);
        }
      }
    } catch (error) {
      console.error('[AUTO-ASSIGN ERROR]', error.message);
    }
  }, 60 * 1000); // 60 seconds
};

module.exports = initAutoAssignService;
