const mongoose = require('mongoose');

const siteStatisticSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Statistic key is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z_]+$/, 'Key must contain only lowercase letters and underscores']
  },
  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true,
    maxlength: [100, 'Label cannot exceed 100 characters']
  },
  value: {
    type: String,
    required: [true, 'Value is required'],
    trim: true,
    maxlength: [50, 'Value cannot exceed 50 characters']
  },
  numericValue: {
    type: Number,
    default: null
  },
  suffix: {
    type: String,
    trim: true,
    maxlength: [20, 'Suffix cannot exceed 20 characters']
  },
  prefix: {
    type: String,
    trim: true,
    maxlength: [20, 'Prefix cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['company', 'projects', 'clients', 'experience', 'achievements', 'other'],
    default: 'other'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  showOnHomePage: {
    type: Boolean,
    default: false
  },
  showOnAboutPage: {
    type: Boolean,
    default: false
  },
  showOnFooter: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    trim: true,
    maxlength: [50, 'Icon name cannot exceed 50 characters']
  },
  color: {
    type: String,
    trim: true,
    match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code']
  },
  animationType: {
    type: String,
    enum: ['none', 'countup', 'fade', 'slide'],
    default: 'countup'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
siteStatisticSchema.index({ key: 1 });
siteStatisticSchema.index({ category: 1, displayOrder: 1 });
siteStatisticSchema.index({ isActive: 1 });
siteStatisticSchema.index({ showOnHomePage: 1 });
siteStatisticSchema.index({ showOnAboutPage: 1 });
siteStatisticSchema.index({ showOnFooter: 1 });

// Virtual for formatted display value
siteStatisticSchema.virtual('displayValue').get(function() {
  let displayValue = this.value;
  
  if (this.prefix) {
    displayValue = this.prefix + displayValue;
  }
  
  if (this.suffix) {
    displayValue = displayValue + this.suffix;
  }
  
  return displayValue;
});

// Static method to get statistics by location
siteStatisticSchema.statics.getStatisticsByLocation = function(location) {
  const locationField = `showOn${location.charAt(0).toUpperCase() + location.slice(1)}Page`;
  
  return this.find({ 
    isActive: true,
    [locationField]: true
  })
  .sort({ displayOrder: 1, createdAt: 1 })
  .select('-createdBy -updatedBy -__v');
};

// Static method to get statistics by category
siteStatisticSchema.statics.getStatisticsByCategory = function(category) {
  return this.find({ 
    isActive: true,
    category: category
  })
  .sort({ displayOrder: 1, createdAt: 1 })
  .select('-createdBy -updatedBy -__v');
};

// Static method to get all active statistics
siteStatisticSchema.statics.getActiveStatistics = function() {
  return this.find({ isActive: true })
    .sort({ category: 1, displayOrder: 1 })
    .select('-createdBy -updatedBy -__v');
};

// Static method to get footer statistics
siteStatisticSchema.statics.getFooterStatistics = function() {
  return this.find({ 
    isActive: true,
    showOnFooter: true
  })
  .sort({ displayOrder: 1 })
  .select('-createdBy -updatedBy -__v');
};

// Instance method to toggle active status
siteStatisticSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Instance method to update value
siteStatisticSchema.methods.updateValue = function(newValue, updatedBy) {
  this.value = newValue;
  this.lastUpdated = new Date();
  if (updatedBy) {
    this.updatedBy = updatedBy;
  }
  
  // Try to parse as number for numericValue
  const numericValue = parseFloat(newValue.replace(/[^0-9.-]/g, ''));
  if (!isNaN(numericValue)) {
    this.numericValue = numericValue;
  }
  
  return this.save();
};

// Pre-save middleware to update numericValue
siteStatisticSchema.pre('save', function(next) {
  if (this.isModified('value')) {
    // Extract numeric value from the string
    const numericValue = parseFloat(this.value.replace(/[^0-9.-]/g, ''));
    if (!isNaN(numericValue)) {
      this.numericValue = numericValue;
    } else {
      this.numericValue = null;
    }
    
    this.lastUpdated = new Date();
  }
  next();
});

// Pre-save middleware to validate key uniqueness
siteStatisticSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('key')) {
    const existingStatistic = await this.constructor.findOne({ 
      key: this.key,
      _id: { $ne: this._id }
    });
    
    if (existingStatistic) {
      return next(new Error(`Statistic with key '${this.key}' already exists`));
    }
  }
  next();
});

module.exports = mongoose.model('SiteStatistic', siteStatisticSchema);
