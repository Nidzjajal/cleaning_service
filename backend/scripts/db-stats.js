require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');
const User = require('../models/User');

const checkStats = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const serviceCount = await Service.countDocuments();
    const userCount = await User.countDocuments();

    console.log('\n📊 Database Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🧹 Services:   ${serviceCount}`);
    console.log(`👤 Users:      ${userCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (serviceCount === 0) {
      console.log('⚠️  Your services collection is EMPTY. The home page will be blank.');
      console.log('💡 Run "npm run seed" once to populate default services.');
    } else {
      console.log('✅ Services found! Make sure your BACKEND server is running.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking stats:', error);
    process.exit(1);
  }
};

checkStats();
