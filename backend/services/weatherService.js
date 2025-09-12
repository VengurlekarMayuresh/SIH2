const axios = require('axios');
const Weather = require('../models/Weather');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = process.env.WEATHER_API_BASE_URL || 'http://api.weatherapi.com/v1';
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    if (!this.apiKey) {
      console.error('⚠️ WEATHER_API_KEY not found in environment variables');
    }
    
    console.log('🌤️ Weather service initialized with:', {
      apiKey: this.apiKey ? 'Set' : 'Missing',
      baseUrl: this.baseUrl
    });
  }

  /**
   * Get weather data for a location (with caching)
   * @param {string} query - Location query (city, coordinates, etc.)
   * @param {boolean} includeAqi - Whether to include air quality index
   * @returns {Object} Weather data
   */
  async getWeatherData(query, includeAqi = true) {
    try {
      // Check if we have fresh cached data (only if MongoDB is connected)
      let cachedWeather = null;
      try {
        cachedWeather = await Weather.getCachedWeather(query);
        if (cachedWeather && cachedWeather.isFresh()) {
          console.log(`🗄️ Serving cached weather data for: ${query}`);
          return this.formatWeatherResponse(cachedWeather);
        }
      } catch (dbError) {
        console.log(`⚠️ Cache check failed: ${dbError.message}`);
        // Continue without cache
      }

      console.log(`🌤️ Fetching fresh weather data for: ${query}`);
      
      // Fetch fresh data from WeatherAPI
      const weatherData = await this.fetchFromWeatherAPI(query, includeAqi);
      
      // Cache the data (only if MongoDB is connected)
      try {
        await this.cacheWeatherData(query, weatherData);
      } catch (cacheError) {
        console.log(`⚠️ Cache save failed: ${cacheError.message}`);
        // Continue without caching
      }
      
      // Format and return the response
      return {
        success: true,
        data: {
          location: weatherData.location,
          current: {
            ...weatherData.current,
            air_quality: weatherData.current.air_quality ? {
              ...weatherData.current.air_quality,
              us_epa_index: weatherData.current.air_quality['us-epa-index'],
              gb_defra_index: weatherData.current.air_quality['gb-defra-index']
            } : undefined
          },
          safety_recommendations: [],
          alerts: [],
          cached_at: null,
          is_stale: false
        },
        meta: {
          query: query.toLowerCase(),
          cached: false,
          expires_at: null,
          is_stale: false
        }
      };
    } catch (error) {
      console.error('Weather service error:', error.message);
      
      // If API fails, try to return stale cached data
      try {
        const staleCache = await Weather.findOne({ query: query.toLowerCase() }).sort({ cached_at: -1 });
        if (staleCache) {
          console.log(`⚠️ Serving stale cached data for: ${query}`);
          return this.formatWeatherResponse(staleCache, true);
        }
      } catch (dbError) {
        console.log(`⚠️ Unable to check stale cache: ${dbError.message}`);
      }
      
      throw new Error(`Unable to fetch weather data: ${error.message}`);
    }
  }

  /**
   * Fetch weather data from WeatherAPI
   * @param {string} query - Location query
   * @param {boolean} includeAqi - Include air quality index
   * @returns {Object} Raw weather data from API
   */
  async fetchFromWeatherAPI(query, includeAqi) {
    const url = `${this.baseUrl}/current.json`;
    const params = {
      key: this.apiKey,
      q: query,
      aqi: includeAqi ? 'yes' : 'no'
    };

    const response = await axios.get(url, { 
      params,
      timeout: 5000 // 5 second timeout
    });

    if (response.status !== 200) {
      throw new Error(`WeatherAPI returned status ${response.status}`);
    }

    return response.data;
  }

  /**
   * Cache weather data in MongoDB
   * @param {string} query - Original query
   * @param {Object} weatherData - Weather data from API
   */
  async cacheWeatherData(query, weatherData) {
    try {
      const weatherDoc = new Weather({
        query: query.toLowerCase(),
        location: weatherData.location,
        current: {
          ...weatherData.current,
          air_quality: weatherData.current.air_quality ? {
            ...weatherData.current.air_quality,
            us_epa_index: weatherData.current.air_quality['us-epa-index'],
            gb_defra_index: weatherData.current.air_quality['gb-defra-index']
          } : undefined
        }
      });

      // Generate safety recommendations
      weatherDoc.safety_recommendations = weatherDoc.generateSafetyRecommendations();

      await weatherDoc.save();
      console.log(`💾 Cached weather data for: ${query}`);
    } catch (error) {
      console.error('Failed to cache weather data:', error.message);
      // Don't throw error here, just log it
    }
  }

  /**
   * Format weather response for API
   * @param {Object} weatherDoc - Weather document from database
   * @param {boolean} isStale - Whether data is stale
   * @returns {Object} Formatted weather response
   */
  formatWeatherResponse(weatherDoc, isStale = false) {
    return {
      success: true,
      data: {
        location: weatherDoc.location,
        current: weatherDoc.current,
        safety_recommendations: weatherDoc.safety_recommendations,
        alerts: weatherDoc.alerts || [],
        cached_at: weatherDoc.cached_at,
        is_stale: isStale
      },
      meta: {
        query: weatherDoc.query,
        cached: true,
        expires_at: weatherDoc.expires_at,
        is_stale: isStale
      }
    };
  }

  /**
   * Get weather data for institution based on their location
   * @param {Object} institution - Institution object with location data
   * @returns {Object} Weather data
   */
  async getWeatherForInstitution(institution) {
    if (!institution.location) {
      throw new Error('Institution location data is required');
    }

    const { city, district, state, pincode } = institution.location;
    
    // Try different query formats for better accuracy
    const queries = [
      `${city}, ${state}, India`,
      `${district}, ${state}, India`,
      `${pincode}, India`,
      `${city}, India`
    ];

    let lastError;
    
    for (const query of queries) {
      try {
        const weatherData = await this.getWeatherData(query);
        return weatherData;
      } catch (error) {
        lastError = error;
        console.log(`❌ Failed query: ${query}, trying next...`);
        continue;
      }
    }

    throw lastError || new Error('All weather queries failed');
  }

  /**
   * Get weather alerts for a location
   * @param {string} query - Location query
   * @returns {Array} Weather alerts
   */
  async getWeatherAlerts(query) {
    try {
      const url = `${this.baseUrl}/alerts.json`;
      const params = {
        key: this.apiKey,
        q: query
      };

      const response = await axios.get(url, { 
        params,
        timeout: 5000
      });

      return response.data.alerts?.alert || [];
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error.message);
      return [];
    }
  }

  /**
   * Get weather forecast for a location
   * @param {string} query - Location query
   * @param {number} days - Number of forecast days (1-3)
   * @returns {Object} Weather forecast
   */
  async getWeatherForecast(query, days = 3) {
    try {
      const url = `${this.baseUrl}/forecast.json`;
      const params = {
        key: this.apiKey,
        q: query,
        days: Math.min(days, 3), // Max 3 days for free plan
        aqi: 'yes',
        alerts: 'yes'
      };

      const response = await axios.get(url, { 
        params,
        timeout: 10000 // 10 second timeout for forecast
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error.message);
      throw new Error(`Unable to fetch weather forecast: ${error.message}`);
    }
  }

  /**
   * Get disaster alerts with enhanced information
   * @param {string} query - Location query
   * @returns {Object} Disaster alerts with enhanced data
   */
  async getDisasterAlerts(query) {
    try {
      const url = `${this.baseUrl}/forecast.json`;
      const params = {
        key: this.apiKey,
        q: query,
        alerts: 'yes',
        days: 1 // We only need alerts for current conditions
      };

      const response = await axios.get(url, { 
        params,
        timeout: 5000
      });

      const data = response.data;
      const alerts = data.alerts?.alert || [];
      
      // Enhanced alert processing
      const processedAlerts = alerts.map(alert => {
        return {
          ...alert,
          severity_level: this.categorizeSeverity(alert.severity),
          alert_type: this.categorizeAlertType(alert.event || alert.headline),
          urgency_level: this.categorizeUrgency(alert.urgency),
          affected_areas: alert.areas ? alert.areas.split(';').map(area => area.trim()) : [],
          local_time: data.location.localtime,
          timezone: data.location.tz_id,
          coordinates: {
            lat: data.location.lat,
            lon: data.location.lon
          }
        };
      });

      return {
        success: true,
        data: {
          location: data.location,
          current_weather: data.current,
          alerts: processedAlerts,
          alert_count: processedAlerts.length,
          highest_severity: this.getHighestSeverity(processedAlerts),
          has_active_alerts: processedAlerts.length > 0,
          last_updated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Failed to fetch disaster alerts:', error.message);
      throw new Error(`Unable to fetch disaster alerts: ${error.message}`);
    }
  }

  /**
   * Categorize alert severity
   * @param {string} severity - Original severity
   * @returns {string} Categorized severity
   */
  categorizeSeverity(severity) {
    if (!severity) return 'unknown';
    
    const sev = severity.toLowerCase();
    if (sev.includes('extreme') || sev.includes('severe')) return 'extreme';
    if (sev.includes('major') || sev.includes('moderate')) return 'major';
    if (sev.includes('minor') || sev.includes('low')) return 'minor';
    return sev;
  }

  /**
   * Categorize alert type based on event or headline
   * @param {string} event - Event or headline text
   * @returns {string} Alert type category
   */
  categorizeAlertType(event) {
    if (!event) return 'general';
    
    const text = event.toLowerCase();
    
    if (text.includes('flood') || text.includes('water')) return 'flood';
    if (text.includes('hurricane') || text.includes('cyclone') || text.includes('typhoon')) return 'hurricane';
    if (text.includes('tornado')) return 'tornado';
    if (text.includes('thunderstorm') || text.includes('storm')) return 'storm';
    if (text.includes('heat') || text.includes('hot')) return 'heat';
    if (text.includes('cold') || text.includes('freeze') || text.includes('frost')) return 'cold';
    if (text.includes('snow') || text.includes('blizzard')) return 'snow';
    if (text.includes('wind')) return 'wind';
    if (text.includes('fog')) return 'fog';
    if (text.includes('fire')) return 'fire';
    if (text.includes('earthquake')) return 'earthquake';
    
    return 'weather';
  }

  /**
   * Categorize urgency level
   * @param {string} urgency - Original urgency
   * @returns {string} Categorized urgency
   */
  categorizeUrgency(urgency) {
    if (!urgency) return 'unknown';
    
    const urg = urgency.toLowerCase();
    if (urg.includes('immediate')) return 'immediate';
    if (urg.includes('expected')) return 'expected';
    if (urg.includes('future')) return 'future';
    if (urg.includes('past')) return 'past';
    
    return urg;
  }

  /**
   * Get highest severity from alerts
   * @param {Array} alerts - Array of processed alerts
   * @returns {string} Highest severity level
   */
  getHighestSeverity(alerts) {
    if (!alerts || alerts.length === 0) return 'none';
    
    const severityOrder = { 'extreme': 4, 'major': 3, 'moderate': 2, 'minor': 1, 'unknown': 0 };
    
    return alerts.reduce((highest, alert) => {
      const currentLevel = severityOrder[alert.severity_level] || 0;
      const highestLevel = severityOrder[highest] || 0;
      return currentLevel > highestLevel ? alert.severity_level : highest;
    }, 'none');
  }

  /**
   * Get comprehensive disaster assessment for a location
   * @param {string} query - Location query
   * @returns {Object} Comprehensive disaster assessment
   */
  async getDisasterAssessment(query) {
    try {
      // Get both current weather and alerts
      const [weatherData, alertData, forecastData] = await Promise.allSettled([
        this.getWeatherData(query, true),
        this.getDisasterAlerts(query),
        this.getWeatherForecast(query, 3)
      ]);

      const assessment = {
        success: true,
        data: {
          location: null,
          current_conditions: null,
          active_alerts: [],
          forecast_alerts: [],
          risk_assessment: {
            overall_risk: 'low',
            immediate_risks: [],
            upcoming_risks: [],
            safety_recommendations: []
          },
          last_updated: new Date().toISOString()
        }
      };

      // Process current weather data
      if (weatherData.status === 'fulfilled') {
        assessment.data.current_conditions = weatherData.value.data;
        assessment.data.location = weatherData.value.data.location;
      }

      // Process alert data
      if (alertData.status === 'fulfilled') {
        assessment.data.active_alerts = alertData.value.data.alerts || [];
        if (!assessment.data.location) {
          assessment.data.location = alertData.value.data.location;
        }
      }

      // Process forecast data for future risks
      if (forecastData.status === 'fulfilled' && forecastData.value.data.forecast) {
        assessment.data.forecast_alerts = this.extractForecastRisks(forecastData.value.data.forecast);
      }

      // Generate comprehensive risk assessment
      assessment.data.risk_assessment = this.generateRiskAssessment(
        assessment.data.current_conditions,
        assessment.data.active_alerts,
        assessment.data.forecast_alerts
      );

      return assessment;
    } catch (error) {
      console.error('Failed to get disaster assessment:', error.message);
      throw new Error(`Unable to get disaster assessment: ${error.message}`);
    }
  }

  /**
   * Extract potential risks from forecast data
   * @param {Object} forecast - Forecast data
   * @returns {Array} Array of potential risks
   */
  extractForecastRisks(forecast) {
    const risks = [];
    
    forecast.forecastday?.forEach((day, index) => {
      const dayRisks = {
        date: day.date,
        day_index: index,
        risks: []
      };

      // Check for extreme temperatures
      if (day.day.maxtemp_c > 40) {
        dayRisks.risks.push({
          type: 'extreme_heat',
          severity: 'high',
          description: `Extreme heat expected: ${day.day.maxtemp_c}°C`
        });
      }

      if (day.day.mintemp_c < 0) {
        dayRisks.risks.push({
          type: 'freezing_conditions',
          severity: 'medium',
          description: `Freezing temperatures expected: ${day.day.mintemp_c}°C`
        });
      }

      // Check for heavy precipitation
      if (day.day.totalprecip_mm > 50) {
        dayRisks.risks.push({
          type: 'heavy_rain',
          severity: day.day.totalprecip_mm > 100 ? 'high' : 'medium',
          description: `Heavy rainfall expected: ${day.day.totalprecip_mm}mm`
        });
      }

      // Check for high winds
      if (day.day.maxwind_kph > 60) {
        dayRisks.risks.push({
          type: 'high_winds',
          severity: day.day.maxwind_kph > 100 ? 'high' : 'medium',
          description: `High winds expected: ${day.day.maxwind_kph} km/h`
        });
      }

      if (dayRisks.risks.length > 0) {
        risks.push(dayRisks);
      }
    });

    return risks;
  }

  /**
   * Generate comprehensive risk assessment
   * @param {Object} currentConditions - Current weather conditions
   * @param {Array} activeAlerts - Active weather alerts
   * @param {Array} forecastAlerts - Forecast-based risks
   * @returns {Object} Risk assessment
   */
  generateRiskAssessment(currentConditions, activeAlerts, forecastAlerts) {
    const assessment = {
      overall_risk: 'low',
      immediate_risks: [],
      upcoming_risks: [],
      safety_recommendations: []
    };

    // Assess immediate risks from active alerts
    if (activeAlerts && activeAlerts.length > 0) {
      const highestSeverity = this.getHighestSeverity(activeAlerts);
      
      if (highestSeverity === 'extreme') {
        assessment.overall_risk = 'critical';
      } else if (highestSeverity === 'major') {
        assessment.overall_risk = 'high';
      } else {
        assessment.overall_risk = 'medium';
      }

      assessment.immediate_risks = activeAlerts.map(alert => ({
        type: alert.alert_type,
        severity: alert.severity_level,
        description: alert.headline,
        urgency: alert.urgency_level
      }));
    }

    // Assess upcoming risks from forecast
    if (forecastAlerts && forecastAlerts.length > 0) {
      forecastAlerts.forEach(dayRisk => {
        dayRisk.risks.forEach(risk => {
          assessment.upcoming_risks.push({
            ...risk,
            date: dayRisk.date,
            days_ahead: dayRisk.day_index
          });
        });
      });

      // Upgrade overall risk if severe conditions are forecast
      const hasHighForecastRisk = forecastAlerts.some(day => 
        day.risks.some(risk => risk.severity === 'high')
      );
      
      if (hasHighForecastRisk && assessment.overall_risk === 'low') {
        assessment.overall_risk = 'medium';
      }
    }

    // Generate safety recommendations
    assessment.safety_recommendations = this.generateSafetyRecommendations(
      assessment.overall_risk,
      assessment.immediate_risks,
      assessment.upcoming_risks
    );

    return assessment;
  }

  /**
   * Generate safety recommendations based on risk assessment
   * @param {string} overallRisk - Overall risk level
   * @param {Array} immediateRisks - Array of immediate risks
   * @param {Array} upcomingRisks - Array of upcoming risks
   * @returns {Array} Array of safety recommendations
   */
  generateSafetyRecommendations(overallRisk, immediateRisks, upcomingRisks) {
    const recommendations = [];
    
    // Risk-level based recommendations
    switch (overallRisk) {
      case 'critical':
        recommendations.push('🚨 CRITICAL: Seek immediate shelter and follow emergency protocols');
        recommendations.push('🏠 Stay indoors until conditions improve');
        recommendations.push('📞 Monitor emergency alerts and official communications');
        break;
        
      case 'high':
        recommendations.push('⚠️ HIGH RISK: Avoid all non-essential outdoor activities');
        recommendations.push('👥 Cancel outdoor events and gatherings');
        recommendations.push('🏫 Close or postpone school activities if possible');
        break;
        
      case 'medium':
        recommendations.push('🔍 Monitor weather conditions closely');
        recommendations.push('🌂 Take appropriate precautions if going outside');
        recommendations.push('📱 Keep emergency contacts readily available');
        break;
        
      case 'low':
        recommendations.push('✅ Conditions are generally safe');
        recommendations.push('🌤️ Continue normal activities with weather awareness');
        break;
    }
    
    // Specific risk-based recommendations
    immediateRisks.forEach(risk => {
      switch (risk.type) {
        case 'flood':
          recommendations.push('🌊 Avoid low-lying areas and do not drive through flooded roads');
          break;
        case 'hurricane':
        case 'storm':
          recommendations.push('🌀 Secure loose objects and stay away from windows');
          break;
        case 'heat':
          recommendations.push('🌡️ Stay hydrated and avoid prolonged sun exposure');
          break;
        case 'cold':
          recommendations.push('❄️ Dress warmly and check on vulnerable individuals');
          break;
        case 'wind':
          recommendations.push('💨 Avoid areas with tall trees and unsecured structures');
          break;
      }
    });
    
    // Upcoming risk preparations
    if (upcomingRisks.length > 0) {
      recommendations.push('📊 Prepare for upcoming weather changes');
      
      const riskTypes = [...new Set(upcomingRisks.map(risk => risk.type))];
      if (riskTypes.includes('heavy_rain')) {
        recommendations.push('🌧️ Prepare for heavy rainfall - check drainage and secure outdoor items');
      }
      if (riskTypes.includes('extreme_heat')) {
        recommendations.push('🌡️ Prepare for extreme heat - ensure adequate cooling and hydration');
      }
      if (riskTypes.includes('high_winds')) {
        recommendations.push('💨 Prepare for high winds - secure loose objects and trim tree branches');
      }
    }
    
    // General emergency preparedness
    if (overallRisk !== 'low') {
      recommendations.push('🎒 Keep emergency kit ready (water, food, flashlight, radio)');
      recommendations.push('🔋 Charge electronic devices and have backup power available');
    }
    
    return recommendations;
  }

  /**
   * Assess weather safety based on current conditions
   * @param {Object} weatherData - Current weather data
   * @returns {Object} Safety assessment
   */
  assessWeatherSafety(weatherData) {
    if (!weatherData || !weatherData.current) {
      return {
        overall_safety: 'unknown',
        warnings: [],
        recommendations: ['Weather data unavailable']
      };
    }

    const current = weatherData.current;
    const warnings = [];
    const recommendations = [];
    let overall_safety = 'safe';

    // Temperature-based assessment
    if (current.temp_c > 40) {
      overall_safety = 'dangerous';
      warnings.push('Extreme heat conditions');
      recommendations.push('🌡️ Avoid outdoor activities during peak hours');
      recommendations.push('💧 Stay hydrated and seek air-conditioned spaces');
    } else if (current.temp_c > 35) {
      if (overall_safety === 'safe') overall_safety = 'caution';
      warnings.push('High temperature alert');
      recommendations.push('🌞 Limit outdoor exposure during midday');
    } else if (current.temp_c < 5) {
      if (overall_safety === 'safe') overall_safety = 'caution';
      warnings.push('Cold weather conditions');
      recommendations.push('🧥 Dress warmly and protect exposed skin');
    }

    // Wind-based assessment
    if (current.wind_kph > 60) {
      overall_safety = 'dangerous';
      warnings.push('High wind speeds detected');
      recommendations.push('💨 Avoid outdoor activities and secure loose objects');
    } else if (current.wind_kph > 40) {
      if (overall_safety === 'safe') overall_safety = 'caution';
      warnings.push('Strong winds present');
      recommendations.push('🌪️ Be cautious when walking or driving');
    }

    // Visibility-based assessment
    if (current.vis_km < 1) {
      overall_safety = 'dangerous';
      warnings.push('Very poor visibility');
      recommendations.push('🌫️ Avoid travel if possible');
    } else if (current.vis_km < 3) {
      if (overall_safety === 'safe') overall_safety = 'caution';
      warnings.push('Reduced visibility conditions');
      recommendations.push('🚗 Drive carefully with headlights on');
    }

    // UV-based assessment
    if (current.uv > 8) {
      if (overall_safety === 'safe') overall_safety = 'caution';
      warnings.push('Very high UV levels');
      recommendations.push('☀️ Use strong sunscreen and protective clothing');
    }

    // Air quality assessment
    if (current.air_quality && current.air_quality.us_epa_index > 3) {
      if (overall_safety === 'safe') overall_safety = 'caution';
      warnings.push('Poor air quality detected');
      recommendations.push('😷 Limit outdoor activities, especially exercise');
    }

    // Humidity and heat index considerations
    if (current.humidity > 80 && current.temp_c > 30) {
      if (overall_safety === 'safe') overall_safety = 'caution';
      warnings.push('High humidity with elevated temperature');
      recommendations.push('💦 Take frequent breaks and stay hydrated');
    }

    // Add general safety recommendations for safe conditions
    if (overall_safety === 'safe' && recommendations.length === 0) {
      recommendations.push('✅ Weather conditions are generally safe');
      recommendations.push('🌤️ Continue normal activities with standard precautions');
    }

    return {
      overall_safety,
      warnings,
      recommendations,
      conditions_checked: {
        temperature: current.temp_c,
        wind_speed: current.wind_kph,
        visibility: current.vis_km,
        uv_index: current.uv,
        humidity: current.humidity,
        air_quality: current.air_quality ? current.air_quality.us_epa_index : null
      }
    };
  }
}

module.exports = new WeatherService();
