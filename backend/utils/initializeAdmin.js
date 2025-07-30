const User = require('../models/User');

// Initialize default admin user
const initializeAdmin = async () => {
  try {
    console.log('Checking for admin user...');
    
    // Check if any admin user exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✓ Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }
    
    // Create default admin user
    const adminData = {
      name: 'Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@realstate.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    };
    
    console.log('Creating default admin user...');
    const admin = await User.createAdmin(adminData);
    
    console.log('✓ Default admin user created successfully');
    console.log('  Email:', adminData.email);
    console.log('  Password:', adminData.password);
    console.log('  ⚠️  Please change the default password after first login!');
    
    return admin;
  } catch (error) {
    console.error('✗ Failed to initialize admin user:', error.message);
    throw error;
  }
};

// Create additional admin user
const createAdminUser = async (userData) => {
  try {
    const admin = await User.createAdmin(userData);
    console.log('✓ Admin user created:', admin.email);
    return admin;
  } catch (error) {
    console.error('✗ Failed to create admin user:', error.message);
    throw error;
  }
};

// Update admin user
const updateAdminUser = async (email, updateData) => {
  try {
    const admin = await User.findOne({ email, role: 'admin' });
    
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        admin[key] = updateData[key];
      }
    });
    
    await admin.save();
    console.log('✓ Admin user updated:', admin.email);
    return admin;
  } catch (error) {
    console.error('✗ Failed to update admin user:', error.message);
    throw error;
  }
};

// List all admin users
const listAdminUsers = async () => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password -refreshToken');
    return admins;
  } catch (error) {
    console.error('✗ Failed to list admin users:', error.message);
    throw error;
  }
};

// Deactivate admin user
const deactivateAdminUser = async (email) => {
  try {
    const admin = await User.findOne({ email, role: 'admin' });
    
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    admin.isActive = false;
    admin.refreshToken = null; // Clear refresh token
    await admin.save();
    
    console.log('✓ Admin user deactivated:', admin.email);
    return admin;
  } catch (error) {
    console.error('✗ Failed to deactivate admin user:', error.message);
    throw error;
  }
};

// Activate admin user
const activateAdminUser = async (email) => {
  try {
    const admin = await User.findOne({ email, role: 'admin' });
    
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    admin.isActive = true;
    await admin.save();
    
    console.log('✓ Admin user activated:', admin.email);
    return admin;
  } catch (error) {
    console.error('✗ Failed to activate admin user:', error.message);
    throw error;
  }
};

module.exports = {
  initializeAdmin,
  createAdminUser,
  updateAdminUser,
  listAdminUsers,
  deactivateAdminUser,
  activateAdminUser
};
