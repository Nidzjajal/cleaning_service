const mongoose = require('mongoose');
const User = require('./backend/models/User');
const ProviderProfile = require('./backend/models/ProviderProfile');
require('dotenv').config({ path: './backend/.env' });

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({ role: 'provider', name: /sanjay|madhav/i });
    console.log('Found providers:', users.map(u => ({ id: u._id, name: u.name, status: u.status })));
    
    for (const u of users) {
      const profile = await ProviderProfile.findOne({ userId: u._id });
      console.log(`Profile for ${u.name}:`, profile ? 'EXISTS' : 'MISSING');
      
      // If missing, let's try to simulate what authController does to catch the error
      if (!profile) {
        try {
          const newProfile = new ProviderProfile({
            userId: u._id,
            skills: ['bedroom_cleaning'],
            bio: 'test',
            hourlyRate: 300,
            experience: '0-1 years',
          });
          const error = newProfile.validateSync();
          if (error) {
            console.log(`Validation Error for ${u.name}:`, error.message);
          } else {
            console.log(`No validation errors for simulated profile of ${u.name}`);
          }
        } catch (e) {
          console.log(`Exception for ${u.name}:`, e.message);
        }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

checkDb();
