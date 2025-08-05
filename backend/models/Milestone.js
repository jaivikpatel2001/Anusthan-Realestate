const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  year: {
    type: String,
    required: [true, 'Year is required'],
    trim: true,
    match: [/^\d{4}$/, 'Year must be a 4-digit number']
  },
  heading: {
    type: String,
    required: [true, 'Heading is required'],
    trim: true,
    maxlength: [100, 'Heading cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    trim: true,
    maxlength: [50, 'Icon name cannot exceed 50 characters']
  },
  image: {
    url: String,
    publicId: String, // For Cloudinary
    alt: String
  },
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
milestoneSchema.index({ isActive: 1, sortOrder: 1 });
milestoneSchema.index({ year: 1 });
milestoneSchema.index({ createdAt: -1 });

// Virtual for formatted year display
milestoneSchema.virtual('yearDisplay').get(function() {
  return this.year;
});

// Static method to get active milestones
milestoneSchema.statics.getActiveMilestones = function() {
  return this.find({ isActive: true })
    .sort({ year: 1, sortOrder: 1 })
    .select('-createdBy -__v');
};

// Static method to get milestones by year range
milestoneSchema.statics.getMilestonesByYearRange = function(startYear, endYear) {
  return this.find({
    isActive: true,
    year: {
      $gte: startYear.toString(),
      $lte: endYear.toString()
    }
  })
  .sort({ year: 1, sortOrder: 1 })
  .select('-createdBy -__v');
};

// Instance method to toggle active status
milestoneSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Pre-save middleware to ensure year is valid
milestoneSchema.pre('save', function(next) {
  const currentYear = new Date().getFullYear();
  const year = parseInt(this.year);
  
  if (year < 1900 || year > currentYear + 10) {
    return next(new Error(`Year must be between 1900 and ${currentYear + 10}`));
  }
  
  next();
});

module.exports = mongoose.model('Milestone', milestoneSchema);
