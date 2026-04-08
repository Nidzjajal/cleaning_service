const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');
const Booking = require('../models/Booking');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');

// @desc  Provider gets their assigned jobs
// @route GET /api/providers/jobs
router.get('/jobs', protect, authorize('provider'), async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { providerId: req.user._id };
    if (status) filter.status = status;

    const jobs = await Booking.find(filter)
      .populate('serviceId', 'name icon basePrice category')
      .populate('customerId', 'name phone address')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
});

// @desc  Provider gets pending (new) jobs in their area
// @route GET /api/providers/jobs/new
router.get('/jobs/new', protect, authorize('provider'), async (req, res, next) => {
  try {
    const jobs = await Booking.find({
      status: 'PENDING',
      providerId: null,
    })
      .populate('serviceId', 'name icon basePrice')
      .populate('customerId', 'name phone address')
      .sort({ scheduledDate: 1 })
      .limit(20);

    res.json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
});

// @desc  Provider updates location
// @route PUT /api/providers/me/location
router.put('/me/location', protect, authorize('provider'), async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      'currentLocation.lat': lat,
      'currentLocation.lng': lng,
      'currentLocation.updatedAt': new Date(),
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// @desc  Provider toggles online/offline
// @route PUT /api/providers/me/status
router.put('/me/status', protect, authorize('provider'), async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    await User.findByIdAndUpdate(req.user._id, { isOnline });
    res.json({ success: true, isOnline });
  } catch (error) {
    next(error);
  }
});

// @desc  Update provider profile
// @route PUT /api/providers/me/profile
router.put('/me/profile', protect, authorize('provider'), async (req, res, next) => {
  try {
    const { skills, hourlyRate, serviceAreas, experience, bio, availability } = req.body;
    
    let profile = await ProviderProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      profile = new ProviderProfile({ userId: req.user._id });
    }

    if (skills) profile.skills = skills;
    if (hourlyRate) profile.hourlyRate = hourlyRate;
    if (serviceAreas) profile.serviceAreas = serviceAreas;
    if (experience) profile.experience = experience;
    if (bio) profile.bio = bio;
    if (availability) profile.availability = availability;

    await profile.save();
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
});

// @desc  Get provider profile
// @route GET /api/providers/me/profile
router.get('/me/profile', protect, authorize('provider'), async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    res.json({ success: true, profile });
  } catch (error) {

    next(error);
  }
});

// @desc  Provider toggles 2FA
// @route PUT /api/providers/2fa/toggle
router.put('/2fa/toggle', protect, authorize('provider'), require('../controllers/authController').toggle2FA);



// @desc  Get public provider profile
// @route GET /api/providers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    const profile = await ProviderProfile.findOne({ userId: req.params.id });
    if (!user || user.role !== 'provider') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, provider: user, profile });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
