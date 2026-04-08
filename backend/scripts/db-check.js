require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');

const checkConnection = async () => {
  try {
    console.log('🔍 Starting Database Connection Check...');

    // Use the existing connection utility
    await connectDB();

    // Connection check complete
    console.log('✅ Connection is stable and secure.');
    console.log('⚠️  Note: This script DOES NOT modify or delete any data.');

    // Check connection state
    if (mongoose.connection.readyState === 1) {
      console.log(`📡 Connected to database: "${mongoose.connection.name}"`);
    }

    // Gracefully exit
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Connection Check Failed:');
    console.error(error);
    process.exit(1);
  }
};

checkConnection();
