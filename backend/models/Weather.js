const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema(
  {
    location: {
      name: { type: String, required: true },
      region: { type: String },
      country: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
      tz_id: { type: String },
      localtime: { type: String }
    },
    current: {
      last_updated: { type: String },
      temp_c: { type: Number, required: true },
      temp_f: { type: Number, required: true },
      is_day: { type: Number },
      condition: {
        text: { type: String, required: true },
        icon: { type: String },
        code: { type: Number }
      },
      wind_mph: { type: Number },
      wind_kph: { type: Number },
      wind_degree: { type: Number },
      wind_dir: { type: String },
      pressure_mb: { type: Number },
      pressure_in: { type: Number },
      precip_mm: { type: Number },
      precip_in: { type: Number },
      humidity: { type: Number },
      cloud: { type: Number },
      feelslike_c: { type: Number },
      feelslike_f: { type: Number },
      windchill_c: { type: Number },
      windchill_f: { type: Number },
      heatindex_c: { type: Number },
      heatindex_f: { type: Number },
      dewpoint_c: { type: Number },
      dewpoint_f: { type: Number },
      vis_km: { type: Number },
      vis_miles: { type: Number },
      uv: { type: Number },
      gust_mph: { type: Number },
      gust_kph: { type: Number },
      air_quality: {
        co: { type: Number },
        no2: { type: Number },
        o3: { type: Number },
        so2: { type: Number },
        pm2_5: { type: Number },
        pm10: { type: Number },
        us_epa_index: { type: Number },
        gb_defra_index: { type: Number }
      }
    },
    // Query parameters used for caching
    query: { type: String, required: true, index: true },
    
    // Cache management
    cached_at: { type: Date, default: Date.now },
    expires_at: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) }, // 10 minutes cache
    
    // Weather alerts and warnings
    alerts: [{
      headline: String,
      msgtype: String,
      severity: String,
      urgency: String,
      areas: String,
      category: String,
      certainty: String,
      event: String,
      note: String,
      effective: String,
      expires: String,
      desc: String,
      instruction: String
    }],
    
    // Safety recommendations based on weather conditions
    safety_recommendations: [{
      type: { type: String, enum: ['warning', 'caution', 'info'] },
      message: String,
      icon: String
    }]
  },
  {
    timestamps: true
  }
);

// Index for efficient cache queries
weatherSchema.index({ query: 1, expires_at: 1 });
weatherSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired cache

// Method to check if weather data is still fresh
weatherSchema.methods.isFresh = function() {
  return this.expires_at > new Date();
};

// Static method to get cached weather or null if expired
weatherSchema.statics.getCachedWeather = function(query) {
  return this.findOne({
    query: query.toLowerCase(),
    expires_at: { $gt: new Date() }
  });
};

// Method to generate safety recommendations based on weather conditions
weatherSchema.methods.generateSafetyRecommendations = function() {
  const recommendations = [];
  const weather = this.current;
  
  // Temperature-based recommendations
  if (weather.temp_c > 35) {
    recommendations.push({
      type: 'warning',
      message: 'Extreme heat warning! Stay hydrated and avoid outdoor activities during peak hours.',
      icon: '🌡️'
    });
  } else if (weather.temp_c < 5) {
    recommendations.push({
      type: 'warning',
      message: 'Cold weather alert! Dress warmly and be cautious of icy conditions.',
      icon: '❄️'
    });
  }
  
  // Wind-based recommendations
  if (weather.wind_kph > 50) {
    recommendations.push({
      type: 'warning',
      message: 'High wind speeds detected! Secure loose objects and avoid outdoor activities.',
      icon: '💨'
    });
  }
  
  // Precipitation-based recommendations
  if (weather.precip_mm > 10) {
    recommendations.push({
      type: 'caution',
      message: 'Heavy rainfall expected! Carry umbrellas and be cautious of flooding.',
      icon: '🌧️'
    });
  }
  
  // Visibility-based recommendations
  if (weather.vis_km < 2) {
    recommendations.push({
      type: 'warning',
      message: 'Poor visibility conditions! Drive carefully and use fog lights if necessary.',
      icon: '🌫️'
    });
  }
  
  // UV-based recommendations
  if (weather.uv > 7) {
    recommendations.push({
      type: 'caution',
      message: 'High UV levels! Use sunscreen and protective clothing when outdoors.',
      icon: '☀️'
    });
  }
  
  // Air quality recommendations
  if (weather.air_quality && weather.air_quality.us_epa_index > 3) {
    recommendations.push({
      type: 'warning',
      message: 'Poor air quality detected! Limit outdoor activities, especially for sensitive individuals.',
      icon: '😷'
    });
  }
  
  return recommendations;
};

const Weather = mongoose.model("Weather", weatherSchema);
module.exports = Weather;