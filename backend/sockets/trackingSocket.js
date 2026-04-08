const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

/**
 * Socket.io Real-time Location Tracking Server
 *
 * Rooms: `booking-{bookingId}`
 * Provider joins room → emits location every 30s
 * Customer joins same room → receives location updates
 */
const initTrackingSocket = (io) => {
  // Middleware: authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join a booking tracking room
    socket.on('join-booking-room', async ({ bookingId }) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }
        const room = `booking-${bookingId}`;
        socket.join(room);
        console.log(`📍 User ${socket.userId} joined room: ${room}`);
        socket.emit('room-joined', { room, bookingId });

        // Send current booking status
        socket.emit('booking-status', {
          status: booking.status,
          liveLocation: booking.liveLocation,
          etaMinutes: booking.etaMinutes,
          distanceKm: booking.distanceKm,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Provider sends location update (every 30 seconds when ON_THE_WAY)
    socket.on('location-update', async ({ bookingId, lat, lng }) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return;

        // Security: only the assigned provider can send location
        if (booking.providerId?.toString() !== socket.userId) {
          socket.emit('error', { message: 'Unauthorized location update' });
          return;
        }

        // Only track when ON_THE_WAY
        if (booking.status !== 'ON_THE_WAY') return;

        // Update DB with latest location
        await Booking.findByIdAndUpdate(bookingId, {
          liveLocation: { lat, lng, updatedAt: new Date() },
        });

        // Broadcast to the booking room (customer sees this)
        const room = `booking-${bookingId}`;
        io.to(room).emit('provider-location', {
          lat,
          lng,
          updatedAt: new Date().toISOString(),
          bookingId,
        });

        console.log(`📡 Location broadcast for booking ${bookingId}: ${lat}, ${lng}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Status change broadcast
    socket.on('status-update', async ({ bookingId, status }) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return;

        // Only provider or admin can update status
        const isProvider = booking.providerId?.toString() === socket.userId;
        if (!isProvider) {
          socket.emit('error', { message: 'Unauthorized status update' });
          return;
        }

        const validTransitions = {
          CONFIRMED: ['PROVIDER_ASSIGNED'],
          PROVIDER_ASSIGNED: ['ON_THE_WAY'],
          ON_THE_WAY: ['ARRIVED'],
          ARRIVED: ['IN_PROGRESS'],
          IN_PROGRESS: ['COMPLETED'],
        };

        if (!validTransitions[booking.status]?.includes(status)) {
          socket.emit('error', {
            message: `Cannot transition from ${booking.status} to ${status}`,
          });
          return;
        }

        await Booking.findByIdAndUpdate(bookingId, {
          status,
          $push: {
            statusHistory: { status, changedAt: new Date() },
          },
        });

        const room = `booking-${bookingId}`;
        io.to(room).emit('booking-status', {
          status,
          bookingId,
          updatedAt: new Date().toISOString(),
        });

        console.log(`📊 Status updated for booking ${bookingId}: ${status}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ETA update from Distance Matrix
    socket.on('eta-update', async ({ bookingId, etaMinutes, distanceKm, distanceText }) => {
      try {
        await Booking.findByIdAndUpdate(bookingId, { etaMinutes, distanceKm });
        const room = `booking-${bookingId}`;
        io.to(room).emit('eta-update', {
          etaMinutes,
          distanceKm,
          distanceText,
          bookingId,
        });
      } catch (err) {
        console.error('ETA update error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initTrackingSocket;
