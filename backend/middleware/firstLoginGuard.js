// Forces providers with isFirstLogin=true to reset password before proceeding
// DISABLED per user request: Everyone now goes straight to dashboard
const firstLoginGuard = (req, res, next) => {
  /*
  if (!req.user) return next();

  if (
    req.user.role === 'provider' &&
    req.user.isFirstLogin === true &&
    req.path !== '/reset-password' &&
    req.path !== '/auth/reset-password'
  ) {
    return res.status(403).json({
      success: false,
      message: 'You must reset your password before accessing the dashboard',
      requiresPasswordReset: true,
      redirectTo: '/reset-password',
    });
  }
  */

  next();
};

module.exports = firstLoginGuard;
