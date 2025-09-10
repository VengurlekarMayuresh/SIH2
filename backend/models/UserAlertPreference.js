const mongoose = require('mongoose');

const userAlertPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  location: {
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    address: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  alertTypes: {
    weather: {
      type: Boolean,
      default: true
    },
    earthquake: {
      type: Boolean,
      default: true
    },
    cyclone: {
      type: Boolean,
      default: true
    },
    flood: {
      type: Boolean,
      default: true
    },
    tsunami: {
      type: Boolean,
      default: true
    },
    fire: {
      type: Boolean,
      default: true
    },
    other: {
      type: Boolean,
      default: true
    }
  },
  severityLevels: {
    low: {
      type: Boolean,
      default: false
    },
    moderate: {
      type: Boolean,
      default: true
    },
    severe: {
      type: Boolean,
      default: true
    },
    extreme: {
      type: Boolean,
      default: true
    }
  },
  notificationMethods: {
    push: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  radius: {
    type: Number,
    default: 50, // kilometers
    min: 5,
    max: 200
  },
  quietHours: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: String, // Format: "HH:MM"
    endTime: String // Format: "HH:MM"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient location-based queries
userAlertPreferenceSchema.index({ 'location.coordinates': '2dsphere' });

// Method to check if user wants alerts for a specific type and severity
userAlertPreferenceSchema.methods.shouldReceiveAlert = function(alertType, severity, currentTime = null) {
  if (!this.isActive) return false;
  
  // Check alert type preference
  const typeKey = alertType.toLowerCase().replace('_', '');
  if (this.alertTypes[typeKey] !== undefined && !this.alertTypes[typeKey]) {
    return false;
  }
  
  // Check severity preference
  const severityKey = severity.toLowerCase();
  if (!this.severityLevels[severityKey]) {
    return false;
  }
  
  // Check quiet hours
  if (this.quietHours.enabled && currentTime) {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = this.quietHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.quietHours.endTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    
    // Handle quiet hours crossing midnight
    if (startTimeMinutes > endTimeMinutes) {
      if (currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes) {
        return false;
      }
    } else {
      if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes) {
        return false;
      }
    }
  }
  
  return true;
};

// Static method to find users who should receive a specific alert
userAlertPreferenceSchema.statics.getUsersForAlert = async function(alert) {
  const query = {
    isActive: true
  };
  
  // Location-based filtering if alert has coordinates
  if (alert.location && alert.location.coordinates) {
    query['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [alert.location.coordinates.longitude, alert.location.coordinates.latitude]
        },
        $maxDistance: 100000 // 100km in meters (we'll filter by user's radius preference later)
      }
    };
  }
  
  const users = await this.find(query).populate('userId', 'name email phone pushTokens');
  
  // Filter users based on their preferences
  return users.filter(userPref => {
    return userPref.shouldReceiveAlert(alert.type, alert.severity, new Date());
  });
};

module.exports = mongoose.model('UserAlertPreference', userAlertPreferenceSchema);
