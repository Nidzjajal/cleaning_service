const axios = require('axios');
const Booking = require('../models/Booking');
const User = require('../models/User');

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BUFFER_MINUTES = parseInt(process.env.BUFFER_TIME_MINUTES || '30');
const GEO_FENCE_KM = parseInt(process.env.GEO_FENCE_KM || '15');
const IMMEDIATE_LEAD_HOURS = parseInt(process.env.IMMEDIATE_BOOKING_LEAD_HOURS || '3');

/**
 * Haversine formula — distance between two lat/lng points in km
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Get ETA and distance via Google Distance Matrix API
 */
const getDistanceMatrix = async (originLat, originLng, destLat, destLng) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
    const response = await axios.get(url, {
      params: {
        origins: `${originLat},${originLng}`,
        destinations: `${destLat},${destLng}`,
        key: GOOGLE_API_KEY,
        mode: 'driving',
        units: 'metric',
      },
    });

    const row = response.data.rows?.[0]?.elements?.[0];
    if (row?.status === 'OK') {
      return {
        distanceKm: row.distance.value / 1000,
        distanceText: row.distance.text,
        durationMinutes: Math.ceil(row.duration.value / 60),
        durationText: row.duration.text,
      };
    }
    return null;
  } catch (err) {
    console.error('Distance Matrix API error:', err.message);
    return null;
  }
};

/**
 * Check if a provider is available for a given time slot.
 * Accounts for buffer time between jobs.
 */
const isProviderAvailable = async (providerId, scheduledDate, scheduledTime, durationMinutes = 120) => {
  const date = new Date(scheduledDate);
  const [hours, mins] = scheduledTime.split(':').map(Number);

  const jobStart = new Date(date);
  jobStart.setHours(hours, mins, 0, 0);

  const jobEnd = new Date(jobStart);
  jobEnd.setMinutes(jobEnd.getMinutes() + durationMinutes + BUFFER_MINUTES);

  // Find any overlapping booking for this provider on this date
  const sameDay = new Date(date);
  sameDay.setHours(0, 0, 0, 0);
  const nextDay = new Date(sameDay);
  nextDay.setDate(nextDay.getDate() + 1);

  const existing = await Booking.find({
    providerId,
    scheduledDate: { $gte: sameDay, $lt: nextDay },
    status: {
      $in: ['CONFIRMED', 'PROVIDER_ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'],
    },
  });

  for (const booking of existing) {
    const [bh, bm] = booking.scheduledTime.split(':').map(Number);
    const existStart = new Date(booking.scheduledDate);
    existStart.setHours(bh, bm, 0, 0);
    const existEnd = booking.bufferEndTime || new Date(existStart);
    if (!booking.bufferEndTime) {
      existEnd.setMinutes(existEnd.getMinutes() + 120 + BUFFER_MINUTES);
    }

    // Check overlap
    if (jobStart < existEnd && jobEnd > existStart) {
      return { available: false, conflictingBooking: booking._id };
    }
  }

  return { available: true };
};

/**
 * Find available providers for a booking request.
 * Applies geo-fencing + availability check + job count.
 */
const findAvailableProviders = async ({
  serviceId,
  scheduledDate,
  scheduledTime,
  durationMinutes = 120,
  customerLat,
  customerLng,
  isImmediate = false,
}) => {
  // Immediate booking: at least 3 hours from now
  if (isImmediate) {
    const leadTime = new Date();
    leadTime.setHours(leadTime.getHours() + IMMEDIATE_LEAD_HOURS);
    const [h, m] = scheduledTime.split(':').map(Number);
    const slotTime = new Date(scheduledDate);
    slotTime.setHours(h, m, 0, 0);
    if (slotTime < leadTime) {
      throw new Error(
        `Immediate bookings require at least ${IMMEDIATE_LEAD_HOURS} hours lead time`
      );
    }
  }

  // Get all active, approved providers
  const providers = await User.find({
    role: 'provider',
    status: 'APPROVED',
    isOnline: true,
    isActive: true,
  }).populate('providerProfile');

  const available = [];

  for (const provider of providers) {
    // Skip if no profile or no location
    if (!provider.providerProfile) continue;

    // Geo-fence: distance check (if customer location provided)
    if (customerLat && customerLng && provider.currentLocation?.lat) {
      const dist = haversineDistance(
        customerLat,
        customerLng,
        provider.currentLocation.lat,
        provider.currentLocation.lng
      );
      if (dist > GEO_FENCE_KM) continue;

      // Check availability
      const avail = await isProviderAvailable(
        provider._id,
        scheduledDate,
        scheduledTime,
        durationMinutes
      );
      if (!avail.available) continue;

      // Get real distance via Distance Matrix
      const matrix = await getDistanceMatrix(
        provider.currentLocation.lat,
        provider.currentLocation.lng,
        customerLat,
        customerLng
      );

      available.push({
        provider: provider.toPublicProfile(),
        profile: provider.providerProfile,
        distanceKm: matrix?.distanceKm || dist,
        etaMinutes: matrix?.durationMinutes || Math.ceil((dist / 40) * 60),
        distanceText: matrix?.distanceText || `${dist.toFixed(1)} km`,
        durationText: matrix?.durationText || 'Approx.',
      });
    } else {
      // No location data — still check availability
      const avail = await isProviderAvailable(
        provider._id,
        scheduledDate,
        scheduledTime,
        durationMinutes
      );
      if (avail.available) {
        available.push({
          provider: provider.toPublicProfile(),
          profile: provider.providerProfile,
          distanceKm: null,
          etaMinutes: null,
        });
      }
    }
  }

  // Sort by rating desc, then distance asc
  available.sort((a, b) => {
    const ratingDiff =
      (b.profile?.rating || 0) - (a.profile?.rating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (a.distanceKm || 999) - (b.distanceKm || 999);
  });

  return available;
};

module.exports = {
  haversineDistance,
  getDistanceMatrix,
  isProviderAvailable,
  findAvailableProviders,
};
