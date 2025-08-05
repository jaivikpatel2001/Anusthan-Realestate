const mongoose = require('mongoose');

const companyAddressSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Address type is required'],
    enum: ['headquarters', 'branch', 'sales_office', 'site_office', 'other'],
    default: 'headquarters'
  },
  name: {
    type: String,
    required: [true, 'Address name is required'],
    trim: true,
    maxlength: [100, 'Address name cannot exceed 100 characters']
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    maxlength: [200, 'Address line 1 cannot exceed 200 characters']
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [200, 'Address line 2 cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters'],
    default: 'India'
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit postal code']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  website: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      'Please provide a valid website URL'
    ]
  },
  coordinates: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  workingHours: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  showOnWebsite: {
    type: Boolean,
    default: true
  },
  showOnFooter: {
    type: Boolean,
    default: false
  },
  showOnContactPage: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
companyAddressSchema.index({ type: 1, isActive: 1 });
companyAddressSchema.index({ isPrimary: 1 });
companyAddressSchema.index({ showOnWebsite: 1, displayOrder: 1 });
companyAddressSchema.index({ showOnFooter: 1 });
companyAddressSchema.index({ showOnContactPage: 1 });

// Virtual for full address
companyAddressSchema.virtual('fullAddress').get(function() {
  const parts = [this.addressLine1];
  if (this.addressLine2) parts.push(this.addressLine2);
  parts.push(this.city, this.state, this.country, this.postalCode);
  return parts.join(', ');
});

// Virtual for formatted address (for display)
companyAddressSchema.virtual('formattedAddress').get(function() {
  const parts = [];
  if (this.addressLine1) parts.push(this.addressLine1);
  if (this.addressLine2) parts.push(this.addressLine2);
  if (this.city) parts.push(this.city);
  if (this.state) parts.push(this.state);
  if (this.postalCode) parts.push(this.postalCode);
  if (this.country) parts.push(this.country);
  return parts.join(', ');
});

// Virtual for Google Maps URL
companyAddressSchema.virtual('googleMapsUrl').get(function() {
  if (this.coordinates.latitude && this.coordinates.longitude) {
    return `https://www.google.com/maps?q=${this.coordinates.latitude},${this.coordinates.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.fullAddress)}`;
});

// Static method to get primary address
companyAddressSchema.statics.getPrimaryAddress = function() {
  return this.findOne({ isPrimary: true, isActive: true })
    .select('-createdBy -updatedBy -__v');
};

// Static method to get addresses for website
companyAddressSchema.statics.getWebsiteAddresses = function() {
  return this.find({ 
    isActive: true,
    showOnWebsite: true
  })
  .sort({ displayOrder: 1, createdAt: 1 })
  .select('-createdBy -updatedBy -__v');
};

// Static method to get footer addresses
companyAddressSchema.statics.getFooterAddresses = function() {
  return this.find({ 
    isActive: true,
    showOnFooter: true
  })
  .sort({ displayOrder: 1 })
  .select('-createdBy -updatedBy -__v');
};

// Static method to get contact page addresses
companyAddressSchema.statics.getContactPageAddresses = function() {
  return this.find({ 
    isActive: true,
    showOnContactPage: true
  })
  .sort({ displayOrder: 1 })
  .select('-createdBy -updatedBy -__v');
};

// Instance method to set as primary
companyAddressSchema.methods.setAsPrimary = async function() {
  // Remove primary status from all other addresses
  await this.constructor.updateMany(
    { _id: { $ne: this._id } },
    { isPrimary: false }
  );
  
  // Set this address as primary
  this.isPrimary = true;
  return this.save();
};

// Instance method to toggle active status
companyAddressSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Pre-save middleware to ensure only one primary address
companyAddressSchema.pre('save', async function(next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    // Remove primary status from all other addresses
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

// Pre-save middleware to update updatedBy
companyAddressSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.updatedBy || this.createdBy;
  }
  next();
});

module.exports = mongoose.model('CompanyAddress', companyAddressSchema);
