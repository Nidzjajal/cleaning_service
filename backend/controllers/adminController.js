const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const {
  sendProviderApprovalSms,
  sendProviderRejectionSms,
} = require('../services/twilioService');
const { getPlatformSummary } = require('../services/commissionService');
const crypto = require('crypto');
const Service = require('../models/Service');

// @desc  Get all providers (paginated + filter by status)
// @route GET /api/admin/providers
// @access Private (admin)
const getProviders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { role: 'provider' };
    if (status) filter.status = status;

    const providers = await User.find(filter)
      .populate('providerProfile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-passwordHash -tempPassword');

    const total = await User.countDocuments(filter);

    res.json({ success: true, providers, total });
  } catch (error) {
    next(error);
  }
};

// @desc  Approve provider + send SMS with temp credentials
// @route PUT /api/admin/providers/:id/approve
// @access Private (admin)
const approveProvider = async (req, res, next) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    // Generate temp password
    const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase();

    provider.status = 'APPROVED';
    provider.isFirstLogin = true;
    provider.tempPassword = tempPassword;
    await provider.save({ validateBeforeSave: false });

    // Fallback: Ensure ProviderProfile exists, just in case creation failed before
    const existingProfile = await ProviderProfile.findOne({ userId: provider._id });
    if (!existingProfile) {
      await ProviderProfile.create({
        userId: provider._id,
        skills: [],
        hourlyRate: 300,
        experience: '0-1 years',
      });
    }

    // Send approval SMS with temp credentials
    await sendProviderApprovalSms({
      providerPhone: provider.phone,
      providerName: provider.name,
      username: provider.email,
      tempPassword,
      userId: provider._id,
    });

    res.json({
      success: true,
      message: `Provider ${provider.name} approved. SMS with credentials sent.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Reject provider
// @route PUT /api/admin/providers/:id/reject
// @access Private (admin)
const rejectProvider = async (req, res, next) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    provider.status = 'REJECTED';
    await provider.save({ validateBeforeSave: false });

    await sendProviderRejectionSms({
      providerPhone: provider.phone,
      providerName: provider.name,
      userId: provider._id,
    });

    res.json({ success: true, message: `Provider ${provider.name} rejected.` });
  } catch (error) {
    next(error);
  }
};

// @desc  Get transaction ledger
// @route GET /api/admin/transactions
// @access Private (admin)
const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('bookingId', 'bookingRef scheduledDate serviceId')
      .populate('customerId', 'name phone')
      .populate('providerId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);
    const summary = await getPlatformSummary();

    res.json({ success: true, transactions, total, summary });
  } catch (error) {
    next(error);
  }
};

// @desc  Get dashboard overview stats
// @route GET /api/admin/dashboard
// @access Private (admin)
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalProviders,
      pendingProviders,
      totalBookings,
      activeBookings,
      completedBookings,
      summary,
      totalServices,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider', status: { $in: ['APPROVED', 'ACTIVE'] } }),
      User.countDocuments({ role: 'provider', status: 'PENDING' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['CONFIRMED', 'PROVIDER_ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'] } }),
      Booking.countDocuments({ status: 'COMPLETED' }),
      getPlatformSummary(),
      Service.countDocuments(),
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Transaction.aggregate([
      { $match: { status: 'COMPLETED', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$customerPaid' },
          commission: { $sum: '$adminCommission' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalProviders,
        pendingProviders,
        totalBookings,
        activeBookings,
        completedBookings,
        totalServices,
        totalRevenue: summary.totalRevenue,

        totalCommission: summary.totalCommission,
        totalProviderPayouts: summary.totalProviderPayouts,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Set commission rate
// @route PUT /api/admin/commission
// @access Private (admin)
const setCommissionRate = async (req, res, next) => {
  try {
    const { rate } = req.body;
    if (rate < 0 || rate > 1) {
      return res.status(400).json({ success: false, message: 'Rate must be between 0 and 1' });
    }
    process.env.COMMISSION_RATE = rate.toString();
    res.json({ success: true, message: `Commission rate updated to ${rate * 100}%`, rate });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all services (admin)
// @route GET /api/admin/services
// @access Private (admin)
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ category: 1, sortOrder: 1 });
    res.json({ success: true, services });
  } catch (error) {
    next(error);
  }
};

// @desc  Create new service
// @route POST /api/admin/services
// @access Private (admin)
const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc  Update service
// @route PUT /api/admin/services/:id
// @access Private (admin)
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete service
// @route DELETE /api/admin/services/:id
// @access Private (admin)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all customers with LTV (Lifetime Value)
// @route GET /api/admin/customers
// @access Private (admin)
const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-passwordHash -tempPassword')
      .sort({ createdAt: -1 });

    // Aggregate initial LTV for these customers (all historical bookings)
    const ltvStats = await Booking.aggregate([
      { $group: { _id: '$customerId', totalSpend: { $sum: '$pricing.total' }, count: { $sum: 1 } } }
    ]);

    const ltvMap = ltvStats.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.totalSpend;
      return acc;
    }, {});

    const customersWithLtv = customers.map(c => ({
      ...c.toObject(),
      totalSpend: ltvMap[c._id.toString()] || 0
    }));

    res.json({ success: true, customers: customersWithLtv });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single customer details + booking history
// @route GET /api/admin/customers/:id
// @access Private (admin)
const getCustomerDetails = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id).select('-passwordHash -tempPassword');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const bookings = await Booking.find({ customerId: req.params.id })
      .populate('serviceId', 'name icon')
      .populate('providerId', 'name phone')
      .sort({ createdAt: -1 });

    const transactions = await Transaction.find({ customerId: req.params.id })
       .sort({ createdAt: -1 });

    res.json({ success: true, customer, bookings, transactions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProviders,
  approveProvider,
  rejectProvider,
  getTransactions,
  getDashboard,
  setCommissionRate,
  getServices,
  createService,
  updateService,
  deleteService,
  getCustomers,
  getCustomerDetails,
};

