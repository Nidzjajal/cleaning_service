const nodemailer = require('nodemailer');

// 1. Setup the "Post Office" (Transporter) using your .env settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 2. The Dynamic Function
/**
 * @param {string} to - The customer's email (Dynamic)
 * @param {string} subject - Email Subject
 * @param {string} html - Email Content
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to, // This is where the customer's email goes!
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // We don't throw here to prevent the whole booking process from crashing if email fails
  }
};

// 3. Pre-defined Templates
const sendBookingConfiramtionEmail = async (user, booking) => {
    const subject = `Booking Confirmed! - ${booking.bookingRef}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4F46E5;">Hello ${user.name},</h2>
            <p>Your booking with HelpLender has been successfully placed!</p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 10px;">
                <p><strong>Booking Ref:</strong> ${booking.bookingRef}</p>
                <p><strong>Service:</strong> ${booking.serviceId.name}</p>
                <p><strong>Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${booking.scheduledTime}</p>
            </div>
            <p>You will receive another update once a professional is assigned to your request.</p>
            <p>Thanks,<br/>The HelpLender Team</p>
        </div>
    `;
    return sendEmail(user.email, subject, html);
};

module.exports = { sendEmail, sendBookingConfiramtionEmail };
