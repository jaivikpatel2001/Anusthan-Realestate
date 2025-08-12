const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  location: {
    type: String,
    required: [true, 'Project location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    required: [true, 'Project status is required'],
    default: 'upcoming'
  },
  category: {
    type: String,
    enum: ['residential', 'commercial', 'mixed'],
    required: [true, 'Project category is required']
  },
  startingPrice: {
    type: Number,
    min: [0, 'Starting price cannot be negative']
  },
  maxPrice: {
    type: Number,
    min: [0, 'Max price cannot be negative']
  },
  totalUnits: {
    type: Number,
    min: [1, 'Total units must be at least 1']
  },
  availableUnits: {
    type: Number,
    min: [0, 'Available units cannot be negative']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // For Cloudinary
    caption: String,
    isHero: {
      type: Boolean,
      default: false
    }
  }],
  heroImage: {
    type: String,
    required: [true, 'Hero image is required']
  },
  brochure: {
    url: String,
    publicId: String, // For Cloudinary
    filename: String
  },
  amenities: [{
    name: {
      type: String,
      required: true,
      trim: true
    }
  }],
  features: [String],
  unitTypes: [{
    type: String,
    enum: ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Penthouse', 'Studio', 'Duplex', 'Villa'],
    trim: true
  }],
  specifications: {
    totalFloors: Number,
    parkingSpaces: Number,
    elevators: Number,
    constructionArea: Number, // in sq ft
    landArea: Number, // in sq ft
    approvals: [String]
  },
  timeline: {
    startDate: Date,
    expectedCompletion: Date,
    actualCompletion: Date
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  developer: {
    name: String,
    contact: String,
    email: String,
    website: String
  },
  seoData: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  leadCount: {
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
projectSchema.index({ status: 1, category: 1 });
projectSchema.index({ location: 1 });
projectSchema.index({ startingPrice: 1 });
projectSchema.index({ slug: 1 });
projectSchema.index({ isActive: 1, isFeatured: 1 });
projectSchema.index({ createdAt: -1 });

// Text index for search functionality
projectSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  'amenities.name': 'text'
});

// Virtual for apartments
projectSchema.virtual('apartments', {
  ref: 'Apartment',
  localField: '_id',
  foreignField: 'projectId'
});

// Virtual for leads
projectSchema.virtual('leads', {
  ref: 'Lead',
  localField: '_id',
  foreignField: 'projectId'
});

// Generate slug before saving
projectSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Update available units when apartments are modified
projectSchema.methods.updateAvailableUnits = async function() {
  const Apartment = mongoose.model('Apartment');
  const availableCount = await Apartment.countDocuments({
    projectId: this._id,
    isAvailable: true
  });
  this.availableUnits = availableCount;
  return this.save({ validateBeforeSave: false });
};

// Increment view count
projectSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Increment lead count
projectSchema.methods.incrementLeadCount = function() {
  this.leadCount += 1;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Project', projectSchema);
