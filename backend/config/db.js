const mongoose = require('mongoose');

const connectDB = async (retryCount = 5) => {
  const options = {
    // These are often needed for stable Atlas connections
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  for (let i = 0; i < retryCount; i++) {
    try {
      console.log(`📡 Attempting MongoDB connection (Attempt ${i + 1}/${retryCount})...`);
      
      const conn = await mongoose.connect(process.env.MONGODB_URI, options);
      
      console.log(`
✅ MongoDB Connected!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Host: ${conn.connection.host}
📂 DB:   ${conn.connection.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
      return; // Success!
    } catch (error) {
      console.error(`❌ MongoDB Connection Error (Attempt ${i + 1}): ${error.message}`);
      
      if (i === retryCount - 1) {
        console.error('🛑 MISSION CRITICAL: Database connection failed after multiple retries.');
        // In production, you might want to exit, but let's be graceful and wait if needed
        // process.exit(1); 
      } else {
        const wait = Math.pow(2, i) * 1000;
        console.log(`⏱️ Retrying in ${wait / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, wait));
      }
    }
  }
};

module.exports = connectDB;
