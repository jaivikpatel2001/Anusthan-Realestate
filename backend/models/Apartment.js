const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  type: {
    type: String,
    required: [true, 'Apartment type is required'],
    trim: true,
    maxlength: [20, 'Type cannot exceed 20 characters']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [0, 'Bedrooms cannot be negative'],
    max: [10, 'Bedrooms cannot exceed 10']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: [0, 'Bathrooms cannot be negative'],
    max: [10, 'Bathrooms cannot exceed 10']
  },
  area: {
    builtUp: {
      type: Number,
      required: [true, 'Built-up area is required'],
      min: [1, 'Built-up area must be at least 1 sq ft']
    },
    carpet: {
      type: Number,
      min: [1, 'Carpet area must be at least 1 sq ft']
    },
    balcony: {
      type: Number,
      min: [0, 'Balcony area cannot be negative'],
      default: 0
    },
    unit: {
      type: String,
      enum: ['sqft', 'sqm'],
      default: 'sqft'
    }
  },
  price: {
    base: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    perSqFt: {
      type: Number,
      min: [0, 'Price per sq ft cannot be negative']
    },
    maintenance: {
      type: Number,
      min: [0, 'Maintenance cost cannot be negative'],
      default: 0
    },
    parkingCharges: {
      type: Number,
      min: [0, 'Parking charges cannot be negative'],
      default: 0
    }
  },
  floorPlan: {
    url: String,
    publicId: String, // For Cloudinary
    filename: String
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // For Cloudinary
    caption: String
  }],
  features: [String],
  amenities: [String],
  facing: {
    type: String,
    enum: ['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west']
  },
  floor: {
    min: {
      type: Number,
      min: [0, 'Minimum floor cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum floor cannot be negative']
    }
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    totalUnits: {
      type: Number,
      min: [1, 'Total units must be at least 1'],
      default: 1
    },
    availableUnits: {
      type: Number,
      min: [0, 'Available units cannot be negative']
    },
    soldUnits: {
      type: Number,
      min: [0, 'Sold units cannot be negative'],
      default: 0
    }
  },
  specifications: {
    flooring: String,
    kitchen: String,
    bathroom: String,
    doors: String,
    windows: String,
    electrical: String,
    plumbing: String
  },
  possession: {
    readyToMove: {
      type: Boolean,
      default: false
    },
    expectedDate: Date,
    actualDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
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
apartmentSchema.index({ projectId: 1, type: 1 });
apartmentSchema.index({ 'price.base': 1 });
apartmentSchema.index({ bedrooms: 1, bathrooms: 1 });
apartmentSchema.index({ 'availability.isAvailable': 1 });
apartmentSchema.index({ isActive: 1, isFeatured: 1 });
apartmentSchema.index({ sortOrder: 1 });

// Virtual for project details
apartmentSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

// Calculate price per sq ft before saving
apartmentSchema.pre('save', function(next) {
  if (this.isModified('price.base') || this.isModified('area.builtUp')) {
    if (this.area.builtUp > 0) {
      this.price.perSqFt = Math.round(this.price.base / this.area.builtUp);
    }
  }
  
  // Set available units to total units if not specified
  if (this.isNew && !this.availability.availableUnits) {
    this.availability.availableUnits = this.availability.totalUnits;
  }
  
  next();
});

// Update project's available units after apartment changes
apartmentSchema.post('save', async function() {
  try {
    const Project = mongoose.model('Project');
    const project = await Project.findById(this.projectId);
    if (project) {
      await project.updateAvailableUnits();
    }
  } catch (error) {
    console.error('Error updating project available units:', error);
  }
});

// Update project's available units after apartment deletion
apartmentSchema.post('remove', async function() {
  try {
    const Project = mongoose.model('Project');
    const project = await Project.findById(this.projectId);
    if (project) {
      await project.updateAvailableUnits();
    }
  } catch (error) {
    console.error('Error updating project available units:', error);
  }
});

// Method to book/sell units
apartmentSchema.methods.bookUnits = function(quantity = 1) {
  if (this.availability.availableUnits >= quantity) {
    this.availability.availableUnits -= quantity;
    this.availability.soldUnits += quantity;
    
    if (this.availability.availableUnits === 0) {
      this.availability.isAvailable = false;
    }
    
    return this.save();
  } else {
    throw new Error('Not enough units available');
  }
};

// Method to release units (in case of cancellation)
apartmentSchema.methods.releaseUnits = function(quantity = 1) {
  if (this.availability.soldUnits >= quantity) {
    this.availability.availableUnits += quantity;
    this.availability.soldUnits -= quantity;
    this.availability.isAvailable = true;
    
    return this.save();
  } else {
    throw new Error('Cannot release more units than sold');
  }
};

module.exports = mongoose.model('Apartment', apartmentSchema);
