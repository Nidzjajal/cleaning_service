const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const { generateToken } = require('../middleware/auth');
const { sendProviderApprovalSms } = require('../services/twilioService');
const crypto = require('crypto');

// @desc  Register Customer or Provider
// @route POST /api/auth/signup
// @access Public
const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'customer', address } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash: password,
      role: role === 'admin' ? 'customer' : role, // Prevent self-registering as admin
      address,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: user.toPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login
// @route POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Also check temp password for provider first login
      if (user.role === 'provider' && user.isFirstLogin) {
        const tempUser = await User.findOne({ email }).select('+tempPassword');
        if (tempUser.tempPassword !== password) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
      } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    }

    const token = generateToken(user._id);
    const profile = user.toPublicProfile();

    res.json({
      success: true,
      token,
      user: profile,
      requiresPasswordReset: user.isFirstLogin && user.role === 'provider',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get current user
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('providerProfile');
  res.json({ success: true, user: user.toPublicProfile() });
};

// @desc  Reset password (forced first login)
// @route PUT /api/auth/reset-password
// @access Private
const resetPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash +tempPassword');

    // Verify current/temp password
    const isMatch =
      (await user.comparePassword(currentPassword)) ||
      user.tempPassword === currentPassword;

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    user.passwordHash = newPassword;
    user.isFirstLogin = false;
    user.tempPassword = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successfully',
      token,
      user: user.toPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Provider submits join request
// @route POST /api/auth/become-helper
// @access Public
const becomeHelper = async (req, res, next) => {
  try {
    const { name, email, phone, password, bio, hourlyRate, experience, city, pincode, street } = req.body;
    let { skills } = req.body;

    if (typeof skills === 'string') {
      try { skills = JSON.parse(skills); } catch (e) { skills = []; }
    }

    const address = { street, city: city || 'Mumbai', pincode };

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash: password,
      role: 'provider',
      status: 'PENDING',
      isFirstLogin: true,
      address,
      idDocumentUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    try {
      await ProviderProfile.create({
        userId: user._id,
        skills: skills || [],
        bio: bio || '',
        hourlyRate: Number(hourlyRate) || 300,
        experience: experience || '0-1 years',
      });
    } catch (profileErr) {
      console.error('Error creating ProviderProfile:', profileErr);
      await User.findByIdAndDelete(user._id); // Rollback
      return res.status(500).json({ success: false, message: 'Failed to fully register provider profile validation. Please try again or check fields.' });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted! You will be notified via SMS once approved.',
      user: { name: user.name, email: user.email, status: user.status },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Forgot password
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if user exists, just return same message
      return res.json({ success: true, message: 'If an account exists, a reset link was sent.' });
    }

    // Generate a temporary reset token (for demo, just a random string)
    // In a real app, you'd save this to the User model with an expiry
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.tempPassword = resetToken; // Store temporarily as a reset key
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}&email=${email}`;
    
    // --- DEV HELPER ---
    console.log('\n--- 🔑 PASSWORD RESET LINK (DEV) ---');
    console.log(`To: ${email}`);
    console.log(`Link: ${resetUrl}`);
    console.log('------------------------------------\n');

    res.json({
      success: true,
      message: 'Password reset link generated and logged to console.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Toggle 2FA
// @route PUT /api/auth/2fa/toggle
// @access Private
const toggle2FA = async (req, res, next) => {
  try {
    const { enabled, method } = req.body;
    const { sendSecurityAlertSms } = require('../services/twilioService');

    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = enabled;
    if (method) user.twoFactorMethod = method;
    
    await user.save();

    // Send SMS alert
    await sendSecurityAlertSms({
      phone: user.phone,
      name: user.name,
      action: enabled ? 'ENABLED 🟢' : 'DISABLED 🔴',
      method: user.twoFactorMethod,
      userId: user._id
    });

    res.json({
      success: true,
      message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully. SMS alert sent.`,
      user: user.toPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, resetPassword, becomeHelper, forgotPassword, toggle2FA };

