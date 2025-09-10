const axios = require('axios');
const Alert = require('../models/Alert');

class NDMAService {
  constructor() {
    this.apiKey = process.env.NDMA_API_KEY;
    this.baseUrl = 'https://sachet.ndma.gov.in/cap_public_website'; // NDMA SACHET API
    this.imdUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline'; // Alternative for weather alerts
  }

  // Fetch latest disaster alerts from NDMA
  async getDisasterAlerts(state = null, district = null) {
    try {
      // Since NDMA API might require authentication, we'll simulate with known alert patterns
      // In production, you would integrate with the actual NDMA SACHET API
      
      const alerts = await this.fetchNDMAAlerts(state, district);
      const processedAlerts = [];

      for (const alertData of alerts) {
        const processedAlert = await this.processNDMAAlert(alertData);
        if (processedAlert) {
          processedAlerts.push(processedAlert);
        }
      }

      return processedAlerts;
    } catch (error) {
      console.error('Error fetching NDMA alerts:', error);
      throw new Error('Failed to fetch disaster alerts');
    }
  }

  // Fetch alerts from NDMA SACHET system
  async fetchNDMAAlerts(state, district) {
    try {
      // Note: This is a simulated implementation
      // In production, you would use the actual NDMA SACHET API endpoints
      const params = {
        format: 'json',
        limit: 50
      };

      if (state) params.state = state;
      if (district) params.district = district;

      // Simulated NDMA alerts for demonstration
      // Replace this with actual API call when NDMA provides public access
      return this.generateSampleAlerts();

    } catch (error) {
      console.error('Error calling NDMA API:', error);
      // Fallback to sample alerts for demonstration
      return this.generateSampleAlerts();
    }
  }

  // Generate sample alerts for demonstration (remove when real API is available)
  generateSampleAlerts() {
    return [
      {
        identifier: 'NDMA_CYCLONE_2024_001',
        msgType: 'Alert',
        scope: 'Public',
        category: 'Met',
        event: 'Cyclone Warning',
        urgency: 'Immediate',
        severity: 'Severe',
        certainty: 'Observed',
        headline: 'Cyclone Biparjoy approaching Gujarat coast',
        description: 'Very Severe Cyclonic Storm "Biparjoy" over Arabian Sea is likely to cross Gujarat coast near Jakhau Port during evening hours of 15th June.',
        instruction: 'Move to safer places. Keep away from coastal areas. Follow evacuation orders.',
        web: 'https://ndma.gov.in',
        sent: new Date().toISOString(),
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        areaDesc: 'Gujarat, Rajasthan coastal districts',
        polygon: '23.5,68.5 22.8,69.2 22.0,70.1 23.2,71.0 24.0,70.5',
        geocode: {
          state: 'Gujarat',
          district: 'Kutch'
        }
      },
      {
        identifier: 'NDMA_FLOOD_2024_002',
        msgType: 'Alert',
        scope: 'Public',
        category: 'Met',
        event: 'Flood Warning',
        urgency: 'Expected',
        severity: 'Moderate',
        certainty: 'Likely',
        headline: 'Flood warning for river basins in Assam',
        description: 'Heavy to very heavy rainfall expected over Assam in next 48 hours. River levels rising in Brahmaputra basin.',
        instruction: 'Avoid low-lying areas. Keep emergency supplies ready. Monitor water levels.',
        web: 'https://ndma.gov.in',
        sent: new Date().toISOString(),
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        areaDesc: 'Assam, parts of Arunachal Pradesh',
        geocode: {
          state: 'Assam',
          district: 'Kamrup'
        }
      },
      {
        identifier: 'NDMA_HEATWAVE_2024_003',
        msgType: 'Alert',
        scope: 'Public',
        category: 'Met',
        event: 'Heat Wave Warning',
        urgency: 'Expected',
        severity: 'Severe',
        certainty: 'Likely',
        headline: 'Severe heat wave conditions over North India',
        description: 'Temperature expected to rise to 45-47°C over plains of North India for next 3 days.',
        instruction: 'Avoid direct sunlight. Stay hydrated. Use ORS. Avoid outdoor activities during 11 AM to 4 PM.',
        web: 'https://ndma.gov.in',
        sent: new Date().toISOString(),
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        areaDesc: 'Delhi, Haryana, Punjab, Uttar Pradesh',
        geocode: {
          state: 'Delhi',
          district: 'New Delhi'
        }
      }
    ];
  }

  // Process NDMA alert data
  async processNDMAAlert(alertData) {
    try {
      const alertId = `ndma_${alertData.identifier}`;

      // Check if alert already exists
      const existingAlert = await Alert.findOne({ alertId });
      if (existingAlert) {
        return existingAlert;
      }

      const type = this.mapNDMAEventType(alertData.event);
      const severity = this.mapNDMASeverity(alertData.severity);

      const alertDoc = {
        alertId,
        source: 'NDMA',
        type,
        severity,
        title: alertData.headline || alertData.event,
        description: alertData.description,
        location: {
          state: alertData.geocode?.state,
          district: alertData.geocode?.district,
          coordinates: this.parseCoordinates(alertData.polygon)
        },
        affectedAreas: alertData.areaDesc ? [alertData.areaDesc] : [],
        startTime: new Date(alertData.effective || alertData.sent),
        endTime: alertData.expires ? new Date(alertData.expires) : null,
        instructions: this.parseInstructions(alertData.instruction),
        contactInfo: {
          helplineNumber: '1077', // NDMA Disaster Helpline
          emergencyContacts: ['112', '108', '102'] // Emergency numbers
        },
        rawData: alertData,
        isActive: true
      };

      const savedAlert = await Alert.create(alertDoc);
      console.log(`NDMA alert created: ${savedAlert.title}`);
      return savedAlert;

    } catch (error) {
      console.error('Error processing NDMA alert:', error);
      return null;
    }
  }

  // Map NDMA event types to our alert types
  mapNDMAEventType(event) {
    const eventLower = event.toLowerCase();
    
    if (eventLower.includes('cyclone') || eventLower.includes('hurricane')) {
      return 'cyclone';
    } else if (eventLower.includes('earthquake')) {
      return 'earthquake';
    } else if (eventLower.includes('tsunami')) {
      return 'tsunami';
    } else if (eventLower.includes('flood')) {
      return 'flood';
    } else if (eventLower.includes('landslide')) {
      return 'landslide';
    } else if (eventLower.includes('heat')) {
      return 'heat_wave';
    } else if (eventLower.includes('cold')) {
      return 'cold_wave';
    } else if (eventLower.includes('fire')) {
      return 'fire';
    } else if (eventLower.includes('thunderstorm')) {
      return 'thunderstorm';
    } else {
      return 'other';
    }
  }

  // Map NDMA severity to our severity levels
  mapNDMASeverity(severity) {
    if (!severity) return 'Moderate';
    
    const severityLower = severity.toLowerCase();
    
    if (severityLower.includes('extreme')) {
      return 'Extreme';
    } else if (severityLower.includes('severe')) {
      return 'Severe';
    } else if (severityLower.includes('moderate')) {
      return 'Moderate';
    } else {
      return 'Low';
    }
  }

  // Parse coordinates from polygon string
  parseCoordinates(polygon) {
    if (!polygon) return null;
    
    try {
      // Parse first coordinate pair from polygon
      const coords = polygon.split(' ')[0].split(',');
      return {
        latitude: parseFloat(coords[0]),
        longitude: parseFloat(coords[1])
      };
    } catch (error) {
      return null;
    }
  }

  // Parse instruction text into array
  parseInstructions(instruction) {
    if (!instruction) return [];
    
    return instruction
      .split('.')
      .map(inst => inst.trim())
      .filter(inst => inst.length > 0);
  }

  // Get historical alerts for analysis
  async getHistoricalAlerts(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await Alert.find({
        source: 'NDMA',
        createdAt: { $gte: startDate }
      }).sort({ createdAt: -1 });

    } catch (error) {
      console.error('Error fetching historical alerts:', error);
      return [];
    }
  }

  // Get alerts by location
  async getAlertsByLocation(state, district = null) {
    try {
      const query = {
        source: 'NDMA',
        isActive: true,
        'location.state': new RegExp(state, 'i')
      };

      if (district) {
        query['location.district'] = new RegExp(district, 'i');
      }

      return await Alert.find(query).sort({ severity: -1, startTime: -1 });

    } catch (error) {
      console.error('Error fetching alerts by location:', error);
      return [];
    }
  }
}

module.exports = new NDMAService();
