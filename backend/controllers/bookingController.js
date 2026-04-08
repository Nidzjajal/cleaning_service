const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { calculatePricing } = require('../services/commissionService');
const { findAvailableProviders, isProviderAvailable } = require('../services/availabilityService');
const {
  sendBookingConfirmationSms,
  sendJobAssignedSms,
  sendProviderOnWaySms,
  sendJobCompletedSms,
} = require('../services/twilioService');
const { createCheckoutSession } = require('../services/stripeService');
const { sendBookingConfiramtionEmail } = require('../services/emailService');
const mongoose = require('mongoose');

// @desc  Create a new booking
// @route POST /api/bookings
// @access Private (customer)
const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      isImmediate = false,
      serviceAddress,
      paymentMethod,
      selectedAddOns = [],
      specialInstructions,
      providerId,
    } = req.body;

    // 1. Validate service
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // 2. Validate provider availability (double-booking prevention)
    if (providerId) {
      const avail = await isProviderAvailable(
        providerId,
        scheduledDate,
        scheduledTime,
        service.duration?.max || 120
      );
      if (!avail.available) {
        await session.abortTransaction();
        return res.status(409).json({
          success: false,
          message: 'This provider is not available for the selected time slot',
        });
      }
    }

    // 3. Calculate pricing SERVER-SIDE
    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + (a.price || 0), 0);
    const pricing = calculatePricing(service.basePrice, addOnsTotal);

    // 4. Create booking inside transaction
    const [booking] = await Booking.create(
      [
        {
          customerId: req.user._id,
          providerId: providerId || null,
          serviceId,
          scheduledDate: new Date(scheduledDate),
          scheduledTime,
          isImmediate,
          estimatedDurationMinutes: service.duration?.max || 120,
          serviceAddress,
          paymentMethod,
          selectedAddOns,
          specialInstructions,
          pricing,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          status: 'PENDING',
          statusHistory: [{ status: 'PENDING', changedAt: new Date() }],
        },
      ],
      { session }
    );

    // 5. If CARD payment: create Stripe Checkout Session
    let stripeData = null;
    if (paymentMethod === 'CARD') {
      stripeData = await createCheckoutSession({
        amountInr: pricing.total,
        bookingRef: booking.bookingRef,
        customerId: req.user._id,
        serviceId,
      });
      await Booking.findByIdAndUpdate(
        booking._id,
        { stripeSessionId: stripeData.sessionId },
        { session }
      );
    }

    // 6. If COD: it's PENDING and waiting for a provider
    if (paymentMethod === 'COD') {
      // Create initial transaction record (optional here, or wait until confirmed)
      await Transaction.create(
        [
          {
            bookingId: booking._id,
            customerId: req.user._id,
            providerId: providerId || booking.providerId, // Might be null
            customerPaid: pricing.total,
            commissionRate: pricing.commissionRate,
            adminCommission: pricing.adminCommission,
            providerPayout: pricing.providerEarning,
            paymentMethod: 'COD',
            status: 'PENDING',
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    // 7. Send Dynamic Emails to the customer's email ID
    sendBookingConfiramtionEmail(req.user, {
       ...booking.toObject(),
       serviceId: service
    }).catch(err => console.error('Email failed:', err));

    // 8. If COD, broadcast to all providers (since it's unpaid online, it's alive now)
    // If CARD, we broadcast ONLY after webhook confirms payment
    if (paymentMethod === 'COD') {
      const io = req.app.get('io');
      if (io) {
        io.emit('new-job-request', {
          bookingId: booking._id,
          serviceName: service.name,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          price: pricing.providerEarning,
          address: serviceAddress,
        });
        console.log(`[SOCKET] Broadcasted new job request for booking ${booking._id}`);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: await Booking.findById(booking._id).populate('serviceId providerId'),
      ...(stripeData && { stripeUrl: stripeData.checkoutUrl }),
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error('[BOOKING_ERROR]', error);
    // Bulletproof next() check
    if (typeof next === 'function') {
      return next(error);
    }
    // Fallback for weird Express behavior
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'next is not a function' 
    });
  } finally {
    await session.endSession();
  }
};



// @desc  Get customer's bookings
// @route GET /api/bookings/my
// @access Private (customer)
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { customerId: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('serviceId', 'name icon category basePrice')
      .populate('providerId', 'name phone avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single booking
// @route GET /api/bookings/:id
// @access Private
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate('providerId', 'name phone avatar currentLocation')
      .populate('customerId', 'name phone address');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization
    const isOwner = booking.customerId._id.toString() === req.user._id.toString();
    const isProvider = booking.providerId?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Find available providers for a time slot
// @route GET /api/bookings/available-providers
// @access Private (customer)
const getAvailableProviders = async (req, res, next) => {
  try {
    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      isImmediate,
      lat,
      lng,
    } = req.query;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const providers = await findAvailableProviders({
      serviceId,
      scheduledDate,
      scheduledTime,
      durationMinutes: service.duration?.max || 120,
      customerLat: lat ? parseFloat(lat) : undefined,
      customerLng: lng ? parseFloat(lng) : undefined,
      isImmediate: isImmediate === 'true',
    });

    res.json({ success: true, providers, count: providers.length });
  } catch (error) {
    next(error);
  }
};


// @desc  Update booking status (provider actions)
// @route PUT /api/bookings/:id/status
// @access Private (provider/admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isProvider = booking.providerId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = status;
    booking.statusHistory.push({ status, changedAt: new Date(), note });
    await booking.save();

    // Handle COMPLETED: create transaction, update wallet
    if (status === 'COMPLETED') {
      const customer = await User.findById(booking.customerId);
      const provider = await User.findById(booking.providerId);
      const service = await Service.findById(booking.serviceId);

      await Transaction.findOneAndUpdate(
        { bookingId: booking._id },
        { status: 'COMPLETED', walletCredited: true, walletCreditedAt: new Date() },
        { upsert: true }
      );

      // Credit provider wallet
      await User.findByIdAndUpdate(booking.providerId, {
        $inc: { walletBalance: booking.pricing.providerEarning },
      });

      // Send completion SMS
      sendJobCompletedSms({
        customerPhone: customer.phone,
        serviceName: service.name,
        providerName: provider.name,
        total: booking.pricing.total,
        userId: customer._id,
        bookingId: booking._id,
      }).catch(console.error);
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Accept a pending booking (provider action)
// @route POST /api/bookings/:id/accept
// @access Private (provider)
const acceptBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingId = req.params.id;
    const providerId = req.user._id;

    if (req.user.role !== 'provider') {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Only providers can accept bookings' });
    }

    const booking = await Booking.findById(bookingId).session(session).populate('serviceId customerId');
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'PENDING') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Booking is no longer available' });
    }

    // Assign to this provider and set CONFIRMED
    booking.providerId = providerId;
    booking.status = 'CONFIRMED';
    booking.statusHistory.push({ status: 'CONFIRMED', changedAt: new Date(), note: 'Accepted by provider' });

    await booking.save();

    // Update the transaction to have the correct provider ID
    await Transaction.findOneAndUpdate(
      { bookingId: booking._id },
      { providerId: providerId },
      { session }
    );

    await session.commitTransaction();

    // Send the SMS to the customer now!
    let dateStr = 'TBD';
    try {
      dateStr = new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch (e) {
      dateStr = String(booking.scheduledDate);
    }

    sendBookingConfirmationSms({
      customerPhone: booking.customerId.phone,
      providerName: req.user.name,
      serviceName: booking.serviceId.name,
      date: dateStr,
      time: booking.scheduledTime,
      bookingRef: booking.bookingRef,
      userId: booking.customerId._id,
      bookingId: booking._id,
    }).catch(err => console.error('[SMS CONFIRMATION] Error:', err));
    
    // Broadcast to other providers that the job was taken
    const io = req.app.get('io');
    if (io) {
      io.emit('job-taken', { bookingId: booking._id });
    }

    res.json({ success: true, message: 'Booking accepted successfully', booking });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  getAvailableProviders,
  updateBookingStatus,
  acceptBooking,
};
