const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const adminExists = await User.findOne({ role: 'admin' });
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await User.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });
    
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }
  
  await mongoose.disconnect();
}

createAdmin().catch(console.error);