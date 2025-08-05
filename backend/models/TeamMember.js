const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  experienceYears: {
    type: Number,
    required: [true, 'Experience years is required'],
    min: [0, 'Experience years cannot be negative'],
    max: [50, 'Experience years cannot exceed 50']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    publicId: String, // For Cloudinary
    alt: String
  },
  email: {
    type: String,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number']
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  specializations: [String],
  achievements: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
teamMemberSchema.index({ isActive: 1, sortOrder: 1 });
teamMemberSchema.index({ position: 1 });
teamMemberSchema.index({ createdAt: -1 });

// Virtual for experience display
teamMemberSchema.virtual('experienceDisplay').get(function() {
  return `${this.experienceYears}+ years`;
});

// Static method to get active team members
teamMemberSchema.statics.getActiveMembers = function() {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .select('-createdBy -__v');
};

// Instance method to toggle active status
teamMemberSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

module.exports = mongoose.model('TeamMember', teamMemberSchema);
