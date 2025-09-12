const weatherService = require('../services/weatherService');

/**
 * Middleware to automatically fetch and attach weather data to institution requests
 * This can be used to add weather context to dashboard and other endpoints
 */
const attachWeatherData = async (req, res, next) => {
  try {
    // Only attach weather data for authenticated institution users
    if (!req.user || !req.user.institutionId) {
      return next();
    }

    // Skip if user doesn't have location data
    if (!req.user.location) {
      req.weather = {
        available: false,
        reason: 'Institution location data not available'
      };
      return next();
    }

    // Try to get weather data (with error handling)
    try {
      const weatherData = await weatherService.getWeatherForInstitution(req.user);
      const safetyAssessment = weatherService.assessWeatherSafety(weatherData.data);
      
      req.weather = {
        available: true,
        data: weatherData.data,
        safety_assessment: safetyAssessment,
        meta: weatherData.meta,
        fetched_at: new Date().toISOString()
      };
    } catch (weatherError) {
      console.log(`Weather data unavailable for ${req.user.name}: ${weatherError.message}`);
      req.weather = {
        available: false,
        reason: weatherError.message,
        error_type: 'fetch_failed'
      };
    }

    next();
  } catch (error) {
    console.error('Weather middleware error:', error);
    req.weather = {
      available: false,
      reason: 'Weather middleware error',
      error_type: 'middleware_error'
    };
    next(); // Continue even if weather fails
  }
};

/**
 * Middleware to check weather conditions and add warnings for unsafe conditions
 * This adds weather-based recommendations to the response
 */
const addWeatherWarnings = (req, res, next) => {
  // Store the original json method
  const originalJson = res.json;
  
  // Override the json method to add weather warnings
  res.json = function(data) {
    // Only add weather warnings if we have weather data and it's a successful response
    if (req.weather && req.weather.available && data && data.success !== false) {
      const safetyLevel = req.weather.safety_assessment?.safety_level;
      
      if (safetyLevel === 'danger' || safetyLevel === 'warning') {
        // Add weather warnings to the response
        data.weather_warnings = {
          level: safetyLevel,
          concerns: req.weather.safety_assessment.concerns,
          recommendations: req.weather.safety_assessment.recommendations,
          message: safetyLevel === 'danger' 
            ? '🚨 Dangerous weather conditions detected!' 
            : '⚠️ Weather conditions require caution!'
        };
      }
      
      // Add basic weather info if requested
      if (req.query.include_weather === 'true') {
        data.current_weather = {
          temperature: `${req.weather.data.current.temp_c}°C`,
          condition: req.weather.data.current.condition.text,
          location: req.weather.data.location.name,
          safety_level: safetyLevel
        };
      }
    }
    
    // Call the original json method with modified data
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Middleware to cache weather data at request level
 * This prevents multiple weather API calls in a single request cycle
 */
const cacheWeatherInRequest = (req, res, next) => {
  // Add weather cache to request object
  req.weatherCache = new Map();
  
  // Add helper method to get cached weather
  req.getCachedWeather = async (query) => {
    if (req.weatherCache.has(query)) {
      return req.weatherCache.get(query);
    }
    
    try {
      const weatherData = await weatherService.getWeatherData(query);
      req.weatherCache.set(query, weatherData);
      return weatherData;
    } catch (error) {
      throw error;
    }
  };
  
  next();
};

/**
 * Middleware to validate weather-dependent operations
 * This can be used to block certain operations during dangerous weather
 */
const validateWeatherSafety = (options = {}) => {
  return async (req, res, next) => {
    try {
      // Skip validation if weather data is not available
      if (!req.weather || !req.weather.available) {
        return next();
      }
      
      const safetyLevel = req.weather.safety_assessment?.safety_level;
      const { blockOnDanger = true, blockOnWarning = false, operationType = 'operation' } = options;
      
      // Block operation if weather is dangerous and blockOnDanger is true
      if (blockOnDanger && safetyLevel === 'danger') {
        return res.status(423).json({
          success: false,
          message: `${operationType} blocked due to dangerous weather conditions`,
          weather_info: {
            safety_level: safetyLevel,
            concerns: req.weather.safety_assessment.concerns,
            recommendations: req.weather.safety_assessment.recommendations
          },
          error_code: 'WEATHER_DANGER_BLOCK'
        });
      }
      
      // Block operation if weather has warnings and blockOnWarning is true
      if (blockOnWarning && safetyLevel === 'warning') {
        return res.status(423).json({
          success: false,
          message: `${operationType} blocked due to weather warnings`,
          weather_info: {
            safety_level: safetyLevel,
            concerns: req.weather.safety_assessment.concerns,
            recommendations: req.weather.safety_assessment.recommendations
          },
          error_code: 'WEATHER_WARNING_BLOCK'
        });
      }
      
      next();
    } catch (error) {
      console.error('Weather safety validation error:', error);
      next(); // Continue on error (don't block operations due to middleware errors)
    }
  };
};

/**
 * Express middleware to add weather data to institution dashboard
 */
const enrichDashboardWithWeather = async (req, res, next) => {
  // Store the original json method
  const originalJson = res.json;
  
  // Override the json method to add weather data to dashboard responses
  res.json = function(data) {
    // Check if this looks like a dashboard response and we have weather data
    if (req.weather && req.weather.available && data && (data.institution || data.dashboard)) {
      data.weather_info = {
        current: {
          temperature: `${req.weather.data.current.temp_c}°C (${req.weather.data.current.temp_f}°F)`,
          condition: req.weather.data.current.condition.text,
          humidity: `${req.weather.data.current.humidity}%`,
          wind: `${req.weather.data.current.wind_kph} km/h ${req.weather.data.current.wind_dir}`,
          visibility: `${req.weather.data.current.vis_km} km`
        },
        location: {
          name: req.weather.data.location.name,
          region: req.weather.data.location.region,
          country: req.weather.data.location.country,
          localtime: req.weather.data.location.localtime
        },
        safety: {
          level: req.weather.safety_assessment.safety_level,
          is_safe_for_outdoor_activities: req.weather.safety_assessment.is_safe_for_outdoor_activities,
          concerns: req.weather.safety_assessment.concerns
        },
        cached_at: req.weather.meta?.cached_at,
        is_stale: req.weather.meta?.is_stale || false
      };
      
      // Add safety recommendations if conditions aren't safe
      if (req.weather.data.safety_recommendations && req.weather.data.safety_recommendations.length > 0) {
        data.weather_info.recommendations = req.weather.data.safety_recommendations;
      }
    }
    
    // Call the original json method with modified data
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = {
  attachWeatherData,
  addWeatherWarnings,
  cacheWeatherInRequest,
  validateWeatherSafety,
  enrichDashboardWithWeather
};