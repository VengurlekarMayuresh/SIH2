const axios = require('axios');
const Alert = require('../models/Alert');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.onecallUrl = 'https://api.openweathermap.org/data/3.0/onecall';
  }

  // Get current weather for a location
  async getCurrentWeather(latitude, longitude) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return {
        location: {
          coordinates: { latitude, longitude },
          city: response.data.name,
          country: response.data.sys.country
        },
        current: {
          temperature: response.data.main.temp,
          feelsLike: response.data.main.feels_like,
          humidity: response.data.main.humidity,
          pressure: response.data.main.pressure,
          visibility: response.data.visibility / 1000, // Convert to km
          windSpeed: response.data.wind.speed,
          windDirection: response.data.wind.deg,
          description: response.data.weather[0].description,
          icon: response.data.weather[0].icon,
          clouds: response.data.clouds.all
        },
        timestamp: new Date(response.data.dt * 1000)
      };
    } catch (error) {
      console.error('Error fetching current weather:', error.response?.data || error.message);
      throw new Error('Failed to fetch weather data');
    }
  }

  // Get weather forecast and alerts (using free API)
  async getWeatherAlertsAndForecast(latitude, longitude) {
    try {
      // Get current weather using the free API
      const currentWeather = await this.getCurrentWeather(latitude, longitude);
      
      // Get 5-day forecast using the free API
      const forecastResponse = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const forecastData = forecastResponse.data;
      const result = {
        current: currentWeather.current,
        hourly: forecastData.list.slice(0, 8).map(item => ({
          time: new Date(item.dt * 1000),
          temperature: item.main.temp,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          precipitation: (item.pop || 0) * 100
        })),
        daily: this.processDailyForecast(forecastData.list),
        alerts: [] // We'll generate some sample alerts based on weather conditions
      };

      // Generate sample weather warnings based on conditions
      const sampleAlerts = this.generateSampleWeatherAlerts(currentWeather.current, latitude, longitude);
      result.alerts = sampleAlerts;

      return result;
    } catch (error) {
      console.error('Error fetching weather forecast and alerts:', error.response?.data || error.message);
      throw new Error('Failed to fetch weather forecast and alerts');
    }
  }

  // Process and store weather alert
  async processWeatherAlert(alertData, latitude, longitude) {
    try {
      const alertId = `weather_${alertData.sender_name}_${alertData.start}`;
      
      // Check if alert already exists
      const existingAlert = await Alert.findOne({ alertId });
      if (existingAlert) {
        return existingAlert;
      }

      const severity = this.mapWeatherSeverity(alertData.event, alertData.description);
      const type = this.mapWeatherEventType(alertData.event);

      const alertDoc = {
        alertId,
        source: 'OpenWeatherMap',
        type,
        severity,
        title: `Weather Alert: ${alertData.event}`,
        description: alertData.description,
        location: {
          coordinates: { latitude, longitude }
        },
        startTime: new Date(alertData.start * 1000),
        endTime: new Date(alertData.end * 1000),
        instructions: this.generateWeatherInstructions(type, severity),
        contactInfo: {
          helplineNumber: '1077', // NDMA Disaster Helpline
          emergencyContacts: ['112'] // Emergency number
        },
        rawData: alertData,
        isActive: true
      };

      const savedAlert = await Alert.create(alertDoc);
      console.log(`Weather alert created: ${savedAlert.title}`);
      return savedAlert;

    } catch (error) {
      console.error('Error processing weather alert:', error);
      return null;
    }
  }

  // Map weather event to alert type
  mapWeatherEventType(event) {
    const eventLower = event.toLowerCase();
    
    if (eventLower.includes('thunderstorm') || eventLower.includes('lightning')) {
      return 'thunderstorm';
    } else if (eventLower.includes('rain') || eventLower.includes('precipitation')) {
      return 'heavy_rain';
    } else if (eventLower.includes('heat') || eventLower.includes('hot')) {
      return 'heat_wave';
    } else if (eventLower.includes('cold') || eventLower.includes('freeze')) {
      return 'cold_wave';
    } else if (eventLower.includes('cyclone') || eventLower.includes('hurricane')) {
      return 'cyclone';
    } else if (eventLower.includes('flood')) {
      return 'flood';
    } else {
      return 'weather_warning';
    }
  }

  // Map weather severity
  mapWeatherSeverity(event, description) {
    const text = `${event} ${description}`.toLowerCase();
    
    if (text.includes('extreme') || text.includes('severe') || text.includes('dangerous')) {
      return 'Extreme';
    } else if (text.includes('moderate') || text.includes('significant')) {
      return 'Severe';
    } else if (text.includes('minor') || text.includes('slight')) {
      return 'Moderate';
    } else {
      return 'Low';
    }
  }

  // Generate safety instructions based on alert type and severity
  generateWeatherInstructions(type, severity) {
    const instructions = [];
    
    switch (type) {
      case 'thunderstorm':
        instructions.push('Stay indoors and avoid open areas');
        instructions.push('Unplug electrical appliances');
        instructions.push('Avoid using landline phones');
        instructions.push('Stay away from windows and doors');
        if (severity === 'Extreme' || severity === 'Severe') {
          instructions.push('Seek immediate shelter in a sturdy building');
        }
        break;
        
      case 'heavy_rain':
        instructions.push('Avoid unnecessary travel');
        instructions.push('Stay away from flooded roads');
        instructions.push('Keep emergency supplies ready');
        if (severity === 'Extreme') {
          instructions.push('Move to higher ground if in low-lying areas');
        }
        break;
        
      case 'heat_wave':
        instructions.push('Stay hydrated and drink plenty of water');
        instructions.push('Avoid direct sunlight between 10 AM - 4 PM');
        instructions.push('Wear light-colored, loose-fitting clothes');
        instructions.push('Use ORS if feeling dehydrated');
        break;
        
      case 'cold_wave':
        instructions.push('Wear warm clothes in layers');
        instructions.push('Cover your head, hands, and feet');
        instructions.push('Avoid prolonged exposure to cold');
        instructions.push('Check on elderly and children regularly');
        break;
        
      case 'cyclone':
        instructions.push('Move to a safe shelter immediately');
        instructions.push('Stock up on essential supplies');
        instructions.push('Secure loose objects that could become projectiles');
        instructions.push('Follow evacuation orders if issued');
        break;
        
      default:
        instructions.push('Follow local weather advisories');
        instructions.push('Stay informed through official channels');
        instructions.push('Take necessary precautions');
    }
    
    return instructions;
  }

  // Process daily forecast from 5-day/3-hour data
  processDailyForecast(forecastList) {
    const dailyData = {};
    
    // Group by date
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          temps: [],
          descriptions: [],
          icons: [],
          humidity: [],
          windSpeed: [],
          precipitation: []
        };
      }
      
      dailyData[date].temps.push(item.main.temp);
      dailyData[date].descriptions.push(item.weather[0].description);
      dailyData[date].icons.push(item.weather[0].icon);
      dailyData[date].humidity.push(item.main.humidity);
      dailyData[date].windSpeed.push(item.wind?.speed || 0);
      dailyData[date].precipitation.push((item.pop || 0) * 100);
    });
    
    // Convert to daily format
    return Object.keys(dailyData).slice(0, 5).map(dateStr => {
      const data = dailyData[dateStr];
      return {
        date: new Date(dateStr),
        tempMax: Math.max(...data.temps),
        tempMin: Math.min(...data.temps),
        description: data.descriptions[0], // Use first description of the day
        icon: data.icons[0],
        precipitation: Math.max(...data.precipitation),
        humidity: Math.round(data.humidity.reduce((a, b) => a + b) / data.humidity.length),
        windSpeed: Math.round(data.windSpeed.reduce((a, b) => a + b) / data.windSpeed.length * 10) / 10
      };
    });
  }

  // Generate sample weather alerts based on current conditions
  async generateSampleWeatherAlerts(currentWeather, latitude, longitude) {
    const alerts = [];
    
    try {
      // Heat wave alert
      if (currentWeather.temperature > 40) {
        const alertId = `weather_heat_${Date.now()}`;
        const existingAlert = await Alert.findOne({ alertId });
        
        if (!existingAlert) {
          const alertDoc = {
            alertId,
            source: 'OpenWeatherMap',
            type: 'heat_wave',
            severity: currentWeather.temperature > 45 ? 'Extreme' : 'Severe',
            title: `Heat Wave Warning`,
            description: `Extreme heat conditions with temperature reaching ${Math.round(currentWeather.temperature)}°C. Take precautions to avoid heat-related illness.`,
            location: {
              coordinates: { latitude, longitude }
            },
            startTime: new Date(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            instructions: this.generateWeatherInstructions('heat_wave', currentWeather.temperature > 45 ? 'Extreme' : 'Severe'),
            contactInfo: {
              helplineNumber: '1077',
              emergencyContacts: ['112']
            },
            isActive: true
          };
          
          const savedAlert = await Alert.create(alertDoc);
          alerts.push(savedAlert);
        }
      }
      
      // Thunderstorm alert
      if (currentWeather.description.toLowerCase().includes('thunderstorm')) {
        const alertId = `weather_thunder_${Date.now()}`;
        const existingAlert = await Alert.findOne({ alertId });
        
        if (!existingAlert) {
          const alertDoc = {
            alertId,
            source: 'OpenWeatherMap',
            type: 'thunderstorm',
            severity: 'Moderate',
            title: `Thunderstorm Warning`,
            description: `Thunderstorm activity detected in your area. Lightning and heavy rain expected.`,
            location: {
              coordinates: { latitude, longitude }
            },
            startTime: new Date(),
            endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
            instructions: this.generateWeatherInstructions('thunderstorm', 'Moderate'),
            contactInfo: {
              helplineNumber: '1077',
              emergencyContacts: ['112']
            },
            isActive: true
          };
          
          const savedAlert = await Alert.create(alertDoc);
          alerts.push(savedAlert);
        }
      }
      
      // High wind alert
      if (currentWeather.windSpeed > 15) {
        const alertId = `weather_wind_${Date.now()}`;
        const existingAlert = await Alert.findOne({ alertId });
        
        if (!existingAlert) {
          const alertDoc = {
            alertId,
            source: 'OpenWeatherMap',
            type: 'weather_warning',
            severity: currentWeather.windSpeed > 25 ? 'Severe' : 'Moderate',
            title: `High Wind Warning`,
            description: `Strong winds detected with speeds up to ${Math.round(currentWeather.windSpeed)} m/s. Secure loose objects.`,
            location: {
              coordinates: { latitude, longitude }
            },
            startTime: new Date(),
            endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
            instructions: [
              'Secure loose outdoor objects',
              'Avoid driving high-profile vehicles',
              'Stay indoors if possible',
              'Be cautious of falling trees or debris'
            ],
            contactInfo: {
              helplineNumber: '1077',
              emergencyContacts: ['112']
            },
            isActive: true
          };
          
          const savedAlert = await Alert.create(alertDoc);
          alerts.push(savedAlert);
        }
      }
      
    } catch (error) {
      console.error('Error generating sample weather alerts:', error);
    }
    
    return alerts;
  }

  // Get location-based weather data for multiple cities (for dashboard)
  async getMultipleLocationWeather(locations) {
    const promises = locations.map(location => 
      this.getCurrentWeather(location.latitude, location.longitude)
        .catch(error => ({ error: error.message, location }))
    );

    return await Promise.all(promises);
  }
}

module.exports = new WeatherService();
