# Weather & Disaster Alert API Documentation

## Overview
Your SafeEd backend now includes comprehensive weather and disaster alert functionality using WeatherAPI.com. The system provides real-time weather data, safety assessments, and disaster alerts with intelligent risk analysis.

## API Key Setup
- **WeatherAPI Key**: `0dfb2593897249b1883121117251209`
- **Base URL**: `http://api.weatherapi.com/v1`

## Available Endpoints

### 🌤️ Weather Endpoints

#### 1. Current Weather for Institution
```
GET /api/weather/current
Headers: Authorization: Bearer <jwt_token>
Required: Institution authentication
```
Returns current weather for institution's location with safety assessment.

#### 2. Current Weather for Specific Location  
```
GET /api/weather/location?q=Mumbai,India&aqi=true
Headers: Authorization: Bearer <jwt_token>
```
Returns current weather for any location with air quality data.

#### 3. Weather Forecast
```
GET /api/weather/forecast?days=3
Headers: Authorization: Bearer <jwt_token>
Required: Institution authentication
```
Returns 3-day weather forecast for institution's location.

#### 4. Weather Forecast for Location
```
GET /api/weather/forecast/location?q=Delhi,India&days=3
Headers: Authorization: Bearer <jwt_token>
```
Returns forecast for any location.

#### 5. Weather Dashboard
```
GET /api/weather/dashboard
Headers: Authorization: Bearer <jwt_token>
Required: Institution authentication
```
Returns comprehensive weather information including current conditions, forecast, and alerts.

### 🚨 Disaster Alert Endpoints

#### 1. Disaster Alerts for Institution
```
GET /api/disaster/alerts  
Headers: Authorization: Bearer <jwt_token>
Required: Institution authentication
```
Returns active disaster alerts for institution's location.

#### 2. Disaster Alerts for Location
```
GET /api/disaster/alerts/location?q=Mumbai,India
Headers: Authorization: Bearer <jwt_token>
```
Returns disaster alerts for any location with enhanced processing.

#### 3. Comprehensive Disaster Assessment
```
GET /api/disaster/assessment
Headers: Authorization: Bearer <jwt_token>
Required: Institution authentication
```
Returns complete risk assessment including:
- Current weather conditions
- Active alerts
- Forecast risks
- Risk assessment (overall risk level)
- Safety recommendations

#### 4. Disaster Assessment for Location
```
GET /api/disaster/assessment/location?q=Chennai,India
Headers: Authorization: Bearer <jwt_token>
```
Complete disaster assessment for any location.

#### 5. Disaster Forecast
```
GET /api/disaster/forecast?days=3
Headers: Authorization: Bearer <jwt_token>
Required: Institution authentication
```
Returns upcoming weather risks and potential disasters.

#### 6. Emergency Alerts Only
```
GET /api/disaster/emergency?q=Mumbai,India
Headers: Authorization: Bearer <jwt_token>
```
Returns only critical/emergency-level alerts (extreme severity, immediate urgency, hurricanes, tornados, floods).

### 🏥 Health Check
```
GET /api/weather/health
No authentication required
```
Tests weather service functionality.

## Response Examples

### Current Weather Response
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "Mumbai",
      "region": "Maharashtra", 
      "country": "India",
      "lat": 19.07,
      "lon": 72.88,
      "localtime": "2025-09-12 17:52"
    },
    "current": {
      "temp_c": 27.4,
      "temp_f": 81.3,
      "condition": {
        "text": "Partly cloudy",
        "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png"
      },
      "wind_kph": 11.2,
      "humidity": 83,
      "air_quality": {
        "us_epa_index": 2,
        "gb_defra_index": 3
      }
    },
    "safety_assessment": {
      "safety_level": "safe",
      "concerns": [],
      "is_safe_for_outdoor_activities": true,
      "recommendations": []
    }
  },
  "meta": {
    "query": "mumbai, maharashtra, india",
    "cached": false,
    "expires_at": null
  }
}
```

### Disaster Alerts Response
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "Miami",
      "country": "United States of America"
    },
    "current_weather": {
      "temp_c": 26.1,
      "condition": {
        "text": "Partly cloudy"
      }
    },
    "alerts": [
      {
        "headline": "Coastal Flood Advisory",
        "desc": "Minor coastal flooding expected during high tide",
        "severity": "Minor",
        "severity_level": "minor",
        "alert_type": "flood",
        "urgency_level": "expected",
        "affected_areas": ["Miami-Dade County"],
        "coordinates": {
          "lat": 25.76,
          "lon": -80.19
        }
      }
    ],
    "alert_count": 1,
    "highest_severity": "minor",
    "has_active_alerts": true
  }
}
```

### Comprehensive Assessment Response
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "Miami"
    },
    "current_conditions": {
      "current": {
        "temp_c": 26.1,
        "condition": {
          "text": "Partly cloudy"
        }
      }
    },
    "active_alerts": [...],
    "forecast_alerts": [...],
    "risk_assessment": {
      "overall_risk": "medium",
      "immediate_risks": [
        {
          "type": "flood",
          "severity": "minor",
          "description": "Coastal Flood Advisory"
        }
      ],
      "upcoming_risks": [],
      "safety_recommendations": [
        "🔍 Monitor weather conditions closely",
        "🌂 Take appropriate precautions if going outside",
        "📱 Keep emergency contacts readily available",
        "🌊 Avoid low-lying areas and do not drive through flooded roads"
      ]
    },
    "last_updated": "2025-09-12T12:22:46.000Z"
  }
}
```

## Features

### ✨ Enhanced Alert Processing
- **Alert Categorization**: Automatically categorizes alerts by type (flood, hurricane, storm, heat, cold, etc.)
- **Severity Assessment**: Processes severity levels (extreme, major, minor)
- **Urgency Analysis**: Analyzes urgency levels (immediate, expected, future)

### 🎯 Risk Assessment
- **Overall Risk Calculation**: Low, Medium, High, Critical
- **Immediate vs Upcoming Risks**: Separates current dangers from forecasted risks
- **Safety Recommendations**: Context-aware safety advice

### 📊 Forecast Risk Analysis
- **Extreme Temperature Detection**: Identifies dangerous heat/cold
- **Heavy Precipitation Alerts**: Detects flood risks
- **High Wind Warnings**: Identifies dangerous wind conditions

### 💾 Smart Caching
- **10-minute cache**: Reduces API calls and improves performance
- **Stale data fallback**: Serves cached data if API fails
- **MongoDB storage**: Persistent cache with auto-expiration

### 🛡️ Safety Features
- **Emergency Filtering**: Quickly identify critical alerts
- **Institution-specific**: Location-based alerts for educational institutions
- **Air Quality Integration**: Includes air quality assessments

## Integration Example (Frontend)

```javascript
// Example: Get disaster alerts for institution
async function getDisasterAlerts() {
    const response = await fetch('/api/disaster/alerts', {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (data.success && data.data.has_active_alerts) {
        // Display alerts to users
        data.data.alerts.forEach(alert => {
            displayAlert({
                type: alert.alert_type,
                severity: alert.severity_level,
                headline: alert.headline,
                description: alert.desc
            });
        });
    }
}

// Example: Get emergency alerts only
async function getEmergencyAlerts() {
    const response = await fetch('/api/disaster/emergency', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    const data = await response.json();
    
    if (data.data.has_emergencies) {
        // Show emergency notification
        showEmergencyNotification(data.data.emergency_alerts);
    }
}
```

## Status

✅ **Fully Implemented & Tested**
- Weather service with caching
- Disaster alert processing
- Risk assessment algorithms
- Safety recommendations
- All API endpoints
- Error handling & fallbacks

The system is production-ready and handles edge cases gracefully, including API failures, missing data, and MongoDB connectivity issues.