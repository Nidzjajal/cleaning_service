const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

const adminOnly = [protect, authorize('admin')];

router.get('/dashboard', ...adminOnly, getDashboard);
router.get('/providers', ...adminOnly, getProviders);
router.put('/providers/:id/approve', ...adminOnly, approveProvider);
router.put('/providers/:id/reject', ...adminOnly, rejectProvider);
router.get('/transactions', ...adminOnly, getTransactions);
router.put('/commission', ...adminOnly, setCommissionRate);
router.get('/customers', ...adminOnly, getCustomers);
router.get('/customers/:id', ...adminOnly, getCustomerDetails);
router.get('/services', ...adminOnly, getServices);
router.post('/services', ...adminOnly, createService);
router.put('/services/:id', ...adminOnly, updateService);
router.delete('/services/:id', ...adminOnly, deleteService);


module.exports = router;
