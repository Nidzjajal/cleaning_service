const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// @desc Get all active services
// @route GET /api/services
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const services = await Service.find(filter).sort({ sortOrder: 1, isPopular: -1 });
    res.json({ success: true, services });
  } catch (error) {
    next(error);
  }
});

// @desc Get single service
// @route GET /api/services/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
