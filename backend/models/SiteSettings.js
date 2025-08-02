const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  // Company Information
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [200, 'Tagline cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    logo: {
      url: String,
      publicId: String // For Cloudinary
    },
    favicon: {
      url: String,
      publicId: String // For Cloudinary
    }
  },

  // Contact Information
  contact: {
    phone: {
      primary: {
        type: String,
        required: [true, 'Primary phone is required']
      },
      secondary: String,
      whatsapp: String
    },
    email: {
      primary: {
        type: String,
        required: [true, 'Primary email is required'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
      },
      support: String,
      sales: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Social Media Links
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String,
    pinterest: String
  },

  // SEO Settings
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [String],
    ogImage: {
      url: String,
      publicId: String // For Cloudinary
    },
    googleAnalyticsId: String,
    googleTagManagerId: String,
    facebookPixelId: String
  },

  // Business Hours
  businessHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    saturday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: '10:00' },
      closeTime: { type: String, default: '16:00' }
    }
  },

  // Website Settings
  website: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    maintenanceMessage: {
      type: String,
      default: 'We are currently performing maintenance. Please check back soon.'
    },
    allowRegistration: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: false
    },
    defaultCurrency: {
      type: String,
      default: 'INR'
    },
    defaultLanguage: {
      type: String,
      default: 'en'
    }
  },

  // Email Settings
  email: {
    fromName: String,
    fromEmail: String,
    replyToEmail: String,
    templates: {
      leadNotification: {
        subject: {
          type: String,
          default: 'New Lead Received - {{projectTitle}}'
        },
        body: String
      },
      welcomeEmail: {
        subject: {
          type: String,
          default: 'Welcome to {{companyName}}'
        },
        body: String
      }
    }
  },

  // Integration Settings
  integrations: {
    googleMaps: {
      apiKey: String,
      isEnabled: { type: Boolean, default: false }
    },
    whatsapp: {
      businessNumber: String,
      isEnabled: { type: Boolean, default: false }
    },
    razorpay: {
      keyId: String,
      isEnabled: { type: Boolean, default: false }
    },
    mailchimp: {
      apiKey: String,
      listId: String,
      isEnabled: { type: Boolean, default: false }
    }
  },

  // Theme Settings
  theme: {
    primaryColor: {
      type: String,
      default: '#007bff'
    },
    secondaryColor: {
      type: String,
      default: '#6c757d'
    },
    accentColor: {
      type: String,
      default: '#28a745'
    },
    fontFamily: {
      type: String,
      default: 'Inter, sans-serif'
    }
  },

  // Last updated information
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// MongoDB automatically creates a unique index on _id

// Static method to get or create settings
siteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Create default settings
    settings = new this({
      company: {
        name: 'Real Estate Company',
        tagline: 'Your Dream Home Awaits'
      },
      contact: {
        phone: {
          primary: '+91-9999999999'
        },
        email: {
          primary: 'info@realstate.com'
        }
      }
    });
    await settings.save();
  }
  
  return settings;
};

// Static method to update settings
siteSettingsSchema.statics.updateSettings = async function(updateData, userId) {
  let settings = await this.getSettings();
  
  // Merge the update data
  Object.keys(updateData).forEach(key => {
    if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
      settings[key] = { ...settings[key], ...updateData[key] };
    } else {
      settings[key] = updateData[key];
    }
  });
  
  settings.lastUpdatedBy = userId;
  return settings.save();
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
