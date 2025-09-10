const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    required: true,
    enum: ['NDMA', 'OpenWeatherMap', 'IMD', 'Manual']
  },
  type: {
    type: String,
    required: true,
    enum: [
      'weather_warning',
      'cyclone',
      'earthquake',
      'tsunami',
      'flood',
      'landslide',
      'heat_wave',
      'cold_wave',
      'thunderstorm',
      'heavy_rain',
      'drought',
      'fire',
      'other'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Moderate', 'Severe', 'Extreme']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    state: String,
    district: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  affectedAreas: [String],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  instructions: [String],
  contactInfo: {
    helplineNumber: String,
    emergencyContacts: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rawData: mongoose.Schema.Types.Mixed, // Store original API response
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
alertSchema.index({ location: 1, isActive: 1, severity: 1 });
alertSchema.index({ startTime: 1, endTime: 1 });
alertSchema.index({ type: 1, severity: 1 });

// Static method to get active alerts for a location
alertSchema.statics.getActiveAlertsForLocation = async function(latitude, longitude, radius = 50) {
  const now = new Date();
  
  return this.find({
    isActive: true,
    startTime: { $lte: now },
    $or: [
      { endTime: { $gte: now } },
      { endTime: null }
    ],
    $or: [
      {
        'location.coordinates.latitude': {
          $gte: latitude - (radius / 111), // Rough conversion to degrees
          $lte: latitude + (radius / 111)
        },
        'location.coordinates.longitude': {
          $gte: longitude - (radius / 111),
          $lte: longitude + (radius / 111)
        }
      },
      { 'location.coordinates': { $exists: false } } // Include alerts without specific coordinates
    ]
  }).sort({ severity: -1, startTime: -1 });
};

// Static method to get alerts by severity
alertSchema.statics.getAlertsBySeverity = async function(severity) {
  const now = new Date();
  
  return this.find({
    isActive: true,
    severity: severity,
    startTime: { $lte: now },
    $or: [
      { endTime: { $gte: now } },
      { endTime: null }
    ]
  }).sort({ startTime: -1 });
};

// Method to check if alert is currently active
alertSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         this.startTime <= now && 
         (this.endTime === null || this.endTime >= now);
};

module.exports = mongoose.model('Alert', alertSchema);
