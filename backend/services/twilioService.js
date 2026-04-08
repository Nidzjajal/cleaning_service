const twilio = require('twilio');
const SmsLog = require('../models/SmsLog');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSms = async ({
  to,
  message,
  type,
  userId = null,
  bookingId = null,
}) => {
  const log = await SmsLog.create({
    to,
    message,
    type,
    userId,
    bookingId,
    status: 'PENDING',
  });

  try {
    // Format Indian phone to E.164
    const formattedPhone = to.startsWith('+') ? to : `+91${to}`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    await SmsLog.findByIdAndUpdate(log._id, {
      status: 'SENT',
      twilioSid: result.sid,
      sentAt: new Date(),
    });

    console.log(`✅ SMS sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    await SmsLog.findByIdAndUpdate(log._id, {
      status: 'FAILED',
      errorMessage: error.message,
    });
    console.error(`❌ SMS failed to ${to}: ${error.message}`);
    // Don't throw — SMS failure should not break booking flow
    return { success: false, error: error.message };
  }
};

// BOOKING CONFIRMATION — sent to customer
const sendBookingConfirmationSms = async ({
  customerPhone,
  providerName,
  serviceName,
  date,
  time,
  bookingRef,
  userId,
  bookingId,
}) => {
  const message =
    `✅ HelpLender Booking Confirmed!\n` +
    `Ref: ${bookingRef}\n` +
    `Service: ${serviceName}\n` +
    `Provider: ${providerName}\n` +
    `Date: ${date} at ${time}\n` +
    `Your helper is vetted & verified. Thank you!`;

  return sendSms({ to: customerPhone, message, type: 'BOOKING_CONFIRM', userId, bookingId });
};

// PROVIDER APPROVED — sent to provider with temp credentials
const sendProviderApprovalSms = async ({
  providerPhone,
  providerName,
  username,
  tempPassword,
  userId,
}) => {
  const message =
    `🎉 Congratulations ${providerName}!\n` +
    `Your HelpLender Helper account has been APPROVED.\n` +
    `Login at: helplender.com/login\n` +
    `Username: ${username}\n` +
    `Temp Password: ${tempPassword}\n` +
    `Please change your password immediately after login.`;

  return sendSms({ to: providerPhone, message, type: 'PROVIDER_APPROVED', userId });
};

// PROVIDER REJECTED
const sendProviderRejectionSms = async ({ providerPhone, providerName, userId }) => {
  const message =
    `Hi ${providerName}, unfortunately your HelpLender Helper application was not approved at this time. ` +
    `Please contact support@helplender.com for more information.`;

  return sendSms({ to: providerPhone, message, type: 'PROVIDER_REJECTED', userId });
};

// JOB ASSIGNED — sent to provider
const sendJobAssignedSms = async ({
  providerPhone,
  serviceName,
  customerName,
  date,
  time,
  address,
  userId,
  bookingId,
}) => {
  const message =
    `📋 HelpLender: New Job Assigned!\n` +
    `Service: ${serviceName}\n` +
    `Customer: ${customerName}\n` +
    `When: ${date} at ${time}\n` +
    `Address: ${address}\n` +
    `Open your app to Accept/Reject.`;

  return sendSms({ to: providerPhone, message, type: 'JOB_ASSIGNED', userId, bookingId });
};

// PROVIDER ON THE WAY — sent to customer
const sendProviderOnWaySms = async ({
  customerPhone,
  providerName,
  etaMinutes,
  userId,
  bookingId,
}) => {
  const message =
    `🚗 HelpLender: ${providerName} is on the way!\n` +
    `Estimated arrival: ${etaMinutes} minutes.\n` +
    `Track live in your app.`;

  return sendSms({ to: customerPhone, message, type: 'PROVIDER_ON_WAY', userId, bookingId });
};

// JOB COMPLETED
const sendJobCompletedSms = async ({
  customerPhone,
  serviceName,
  providerName,
  total,
  userId,
  bookingId,
}) => {
  const message =
    `✅ HelpLender: Your ${serviceName} is complete!\n` +
    `Provider: ${providerName}\n` +
    `Amount: ₹${total}\n` +
    `Please rate your experience in the app. Thank you!`;

  return sendSms({ to: customerPhone, message, type: 'JOB_COMPLETED', userId, bookingId });
};


// SECURITY ALERT — sent when 2FA status changes
const sendSecurityAlertSms = async ({ phone, name, action, method, userId }) => {
  const message = 
    `🔐 HelpLender Security Alert!\n` +
    `Hi ${name}, Two-Factor Authentication (2FA) was just ${action}.\n` +
    `Method: ${method}\n` +
    `If this wasn't you, please change your password immediately.`;

  return sendSms({ to: phone, message, type: 'SECURITY_ALERT', userId });
};

module.exports = {
  sendSms,
  sendBookingConfirmationSms,
  sendProviderApprovalSms,
  sendProviderRejectionSms,
  sendJobAssignedSms,
  sendProviderOnWaySms,
  sendJobCompletedSms,
  sendSecurityAlertSms,
};

