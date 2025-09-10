const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const ndmaService = require('../services/ndmaService');
const Alert = require('../models/Alert');
const UserAlertPreference = require('../models/UserAlertPreference');
const { authMiddleware } = require('../middleware/index');

// Get all active alerts for dashboard
router.get('/active', async (req, res) => {
  try {
    const { latitude, longitude, radius = 50, severity, type } = req.query;
    
    let query = {
      isActive: true,
      startTime: { $lte: new Date() },
      $or: [
        { endTime: { $gte: new Date() } },
        { endTime: null }
      ]
    };

    // Add severity filter
    if (severity) {
      query.severity = severity;
    }

    // Add type filter
    if (type) {
      query.type = type;
    }

    let alerts;
    
    if (latitude && longitude) {
      // Get location-based alerts
      alerts = await Alert.getActiveAlertsForLocation(
        parseFloat(latitude), 
        parseFloat(longitude), 
        parseInt(radius)
      );
    } else {
      // Get all active alerts
      alerts = await Alert.find(query).sort({ severity: -1, startTime: -1 }).limit(20);
    }

    res.json({
      success: true,
      count: alerts.length,
      alerts: alerts.map(alert => ({
        id: alert._id,
        alertId: alert.alertId,
        source: alert.source,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        location: alert.location,
        affectedAreas: alert.affectedAreas,
        startTime: alert.startTime,
        endTime: alert.endTime,
        instructions: alert.instructions,
        contactInfo: alert.contactInfo,
        isActive: alert.isCurrentlyActive()
      }))
    });
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// Get weather data and alerts for a location
router.get('/weather/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Get weather data and alerts
    const weatherData = await weatherService.getWeatherAlertsAndForecast(latitude, longitude);
    
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data'
    });
  }
});

// Get NDMA disaster alerts
router.get('/disasters', async (req, res) => {
  try {
    const { state, district } = req.query;
    
    const alerts = await ndmaService.getDisasterAlerts(state, district);
    
    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error fetching disaster alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disaster alerts'
    });
  }
});

// Get alerts by severity
router.get('/severity/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const validLevels = ['Low', 'Moderate', 'Severe', 'Extreme'];
    
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity level'
      });
    }

    const alerts = await Alert.getAlertsBySeverity(level);
    
    res.json({
      success: true,
      severity: level,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error fetching alerts by severity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// Get user's alert preferences (requires authentication)
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const preferences = await UserAlertPreference.findOne({ userId })
      .populate('userId', 'name email');
    
    if (!preferences) {
      return res.json({
        success: true,
        preferences: null,
        message: 'No preferences set'
      });
    }
    
    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences'
    });
  }
});

// Update user's alert preferences (requires authentication)
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = {
      ...req.body,
      userId,
      updatedAt: new Date()
    };
    
    const preferences = await UserAlertPreference.findOneAndUpdate(
      { userId },
      updateData,
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// Get personalized alerts for user (requires authentication)
router.get('/personalized', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user preferences
    const preferences = await UserAlertPreference.findOne({ userId });
    
    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: 'User preferences not set. Please set your location and preferences first.'
      });
    }
    
    // Get alerts for user's location
    const alerts = await Alert.getActiveAlertsForLocation(
      preferences.location.coordinates.latitude,
      preferences.location.coordinates.longitude,
      preferences.radius
    );
    
    // Filter alerts based on user preferences
    const personalizedAlerts = alerts.filter(alert => 
      preferences.shouldReceiveAlert(alert.type, alert.severity, new Date())
    );
    
    res.json({
      success: true,
      location: preferences.location,
      count: personalizedAlerts.length,
      alerts: personalizedAlerts
    });
  } catch (error) {
    console.error('Error fetching personalized alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personalized alerts'
    });
  }
});

// Refresh alerts from external sources
router.post('/refresh', async (req, res) => {
  try {
    const { source, latitude, longitude, state, district } = req.body;
    
    let refreshedAlerts = [];
    
    if (source === 'weather' || !source) {
      if (latitude && longitude) {
        const weatherData = await weatherService.getWeatherAlertsAndForecast(
          parseFloat(latitude), 
          parseFloat(longitude)
        );
        refreshedAlerts = refreshedAlerts.concat(weatherData.alerts);
      }
    }
    
    if (source === 'ndma' || !source) {
      const ndmaAlerts = await ndmaService.getDisasterAlerts(state, district);
      refreshedAlerts = refreshedAlerts.concat(ndmaAlerts);
    }
    
    res.json({
      success: true,
      message: 'Alerts refreshed successfully',
      newAlerts: refreshedAlerts.length,
      alerts: refreshedAlerts
    });
  } catch (error) {
    console.error('Error refreshing alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh alerts'
    });
  }
});

// Get alert statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Alert.aggregate([
      {
        $match: {
          isActive: true,
          startTime: { $lte: new Date() },
          $or: [
            { endTime: { $gte: new Date() } },
            { endTime: null }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          severityBreakdown: {
            $push: {
              severity: '$severity',
              type: '$type',
              source: '$source'
            }
          }
        }
      }
    ]);

    const severityCount = {};
    const typeCount = {};
    const sourceCount = {};

    if (stats.length > 0) {
      stats[0].severityBreakdown.forEach(item => {
        severityCount[item.severity] = (severityCount[item.severity] || 0) + 1;
        typeCount[item.type] = (typeCount[item.type] || 0) + 1;
        sourceCount[item.source] = (sourceCount[item.source] || 0) + 1;
      });
    }

    res.json({
      success: true,
      stats: {
        total: stats.length > 0 ? stats[0].total : 0,
        severityBreakdown: severityCount,
        typeBreakdown: typeCount,
        sourceBreakdown: sourceCount
      }
    });
  } catch (error) {
    console.error('Error fetching alert statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
