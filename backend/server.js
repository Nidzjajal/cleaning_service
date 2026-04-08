require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const initTrackingSocket = require('./sockets/trackingSocket');

// Route imports
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const serviceRoutes = require('./routes/services');
const providerRoutes = require('./routes/providers');
const paymentRoutes = require('./routes/payment');
const reviewRoutes = require('./routes/reviews');

const app = express();
const httpServer = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Initialize tracking socket
initTrackingSocket(io);

const initAutoAssignService = require('./services/autoAssignService');

// Make io accessible in controllers
app.set('io', io);

// Start background workers
initAutoAssignService(app);

// ===== MIDDLEWARE =====
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Raw body for Stripe webhook
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HelpLender API',
    version: '1.0.0',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler (must be last)
app.use(errorHandler);

// Connect to MongoDB then start server
const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`
🚀 HelpLender Server Ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 API:    http://localhost:${PORT}/api
🔌 Socket: ws://localhost:${PORT}
🌍 Env:    ${process.env.NODE_ENV}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error('🛑 Failed to start server:', error);
    process.exit(1);
  }
};

// Global error catchers
process.on('unhandledRejection', (err) => {
  console.error('[FATAL] Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
});

startServer();

module.exports = app;
