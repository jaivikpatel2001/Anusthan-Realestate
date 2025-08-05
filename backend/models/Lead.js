const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number']
  },
  email: {
    type: String,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  apartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment'
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'social_media', 'referral', 'advertisement', 'walk_in', 'other'],
    default: 'website'
  },
  leadType: {
    type: String,
    enum: ['brochure_download', 'contact_inquiry', 'site_visit', 'callback_request', 'emi_calculator', 'other'],
    default: 'brochure_download'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'interested', 'not_interested', 'converted', 'lost'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  budget: {
    min: {
      type: Number,
      min: [0, 'Minimum budget cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum budget cannot be negative']
    }
  },
  requirements: {
    bedrooms: Number,
    bathrooms: Number,
    preferredFloor: String,
    facing: {
      type: String,
      enum: ['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west']
    },
    moveInDate: Date,
    additionalRequirements: String
  },
  contactHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['phone', 'email', 'sms', 'whatsapp', 'meeting', 'site_visit', 'website'],
      required: true
    },
    notes: String,
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    outcome: {
      type: String,
      enum: ['successful', 'no_response', 'callback_requested', 'not_interested', 'follow_up_needed']
    }
  }],
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isImportant: {
      type: Boolean,
      default: false
    }
  }],
  followUpDate: Date,
  lastContactedAt: Date,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  utm: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  },
  ipAddress: String,
  userAgent: String,
  referrer: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isQualified: {
    type: Boolean,
    default: false
  },
  conversionDate: Date,
  conversionValue: Number
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
leadSchema.index({ mobile: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ projectId: 1, status: 1 });
leadSchema.index({ status: 1, priority: 1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ followUpDate: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ lastContactedAt: -1 });
leadSchema.index({ isActive: 1, isQualified: 1 });

// Compound index for lead management queries
leadSchema.index({ projectId: 1, status: 1, createdAt: -1 });

// Virtual for project details
leadSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

// Virtual for apartment details
leadSchema.virtual('apartment', {
  ref: 'Apartment',
  localField: 'apartmentId',
  foreignField: '_id',
  justOne: true
});

// Virtual for assigned user details
leadSchema.virtual('assignedUser', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

// Update lastContactedAt when contact history is added
leadSchema.pre('save', function(next) {
  if (this.isModified('contactHistory') && this.contactHistory.length > 0) {
    const latestContact = this.contactHistory[this.contactHistory.length - 1];
    this.lastContactedAt = latestContact.date;
  }
  next();
});

// Update project lead count after lead creation
leadSchema.post('save', async function() {
  if (this.isNew) {
    try {
      const Project = mongoose.model('Project');
      const project = await Project.findById(this.projectId);
      if (project) {
        await project.incrementLeadCount();
      }
    } catch (error) {
      console.error('Error updating project lead count:', error);
    }
  }
});

// Method to add contact history
leadSchema.methods.addContactHistory = function(contactData) {
  this.contactHistory.push(contactData);
  return this.save();
};

// Method to add note
leadSchema.methods.addNote = function(noteData) {
  this.notes.push(noteData);
  return this.save();
};

// Method to update status
leadSchema.methods.updateStatus = function(newStatus, userId) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add to contact history
  this.contactHistory.push({
    method: 'system',
    notes: `Status changed from ${oldStatus} to ${newStatus}`,
    contactedBy: userId,
    outcome: 'successful'
  });
  
  // Set conversion date if converted
  if (newStatus === 'converted' && !this.conversionDate) {
    this.conversionDate = new Date();
  }
  
  // Mark as qualified if interested or converted
  if (['interested', 'converted'].includes(newStatus)) {
    this.isQualified = true;
  }
  
  return this.save();
};

// Method to schedule follow-up
leadSchema.methods.scheduleFollowUp = function(followUpDate, notes, userId) {
  this.followUpDate = followUpDate;
  
  if (notes) {
    this.notes.push({
      content: `Follow-up scheduled for ${followUpDate.toDateString()}: ${notes}`,
      addedBy: userId
    });
  }
  
  return this.save();
};

// Static method to get leads requiring follow-up
leadSchema.statics.getFollowUpLeads = function(date = new Date()) {
  return this.find({
    followUpDate: { $lte: date },
    status: { $nin: ['converted', 'lost', 'not_interested'] },
    isActive: true
  }).populate('projectId assignedTo');
};

// Static method to get lead statistics
leadSchema.statics.getLeadStats = function(projectId = null, dateRange = null) {
  const matchStage = { isActive: true };
  
  if (projectId) {
    matchStage.projectId = mongoose.Types.ObjectId(projectId);
  }
  
  if (dateRange) {
    matchStage.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResponseTime: { $avg: { $subtract: ['$lastContactedAt', '$createdAt'] } }
      }
    }
  ]);
};

module.exports = mongoose.model('Lead', leadSchema);
