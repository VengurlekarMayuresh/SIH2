const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const { authMiddleware, institutionOnly } = require('../middleware');
const Institution = require('../models/Institution');

// Get current weather for institution's location
router.get('/weather/current', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const institution = req.user;
        const weatherData = await weatherService.getWeatherForInstitution(institution);
        
        // Add safety assessment
        const safetyAssessment = weatherService.assessWeatherSafety(weatherData.data);
        
        res.json({
            success: true,
            data: {
                ...weatherData.data,
                safety_assessment: safetyAssessment
            },
            meta: weatherData.meta
        });
    } catch (error) {
        console.error('Weather fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data',
            error: error.message
        });
    }
});

// Get weather for specific location (query)
router.get('/weather/location', authMiddleware, async (req, res) => {
    try {
        const { q: query, aqi } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Location query parameter "q" is required'
            });
        }
        
        const includeAqi = aqi === 'true' || aqi === '1' || aqi === 'yes';
        const weatherData = await weatherService.getWeatherData(query, includeAqi);
        
        // Add safety assessment
        const safetyAssessment = weatherService.assessWeatherSafety(weatherData.data);
        
        res.json({
            success: true,
            data: {
                ...weatherData.data,
                safety_assessment: safetyAssessment
            },
            meta: weatherData.meta
        });
    } catch (error) {
        console.error('Weather location fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data for location',
            error: error.message
        });
    }
});

// Get weather forecast for institution's location
router.get('/weather/forecast', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const institution = req.user;
        const { days = 3 } = req.query;
        
        if (!institution.location) {
            return res.status(400).json({
                success: false,
                message: 'Institution location data is required'
            });
        }

        const { city, state } = institution.location;
        const query = `${city}, ${state}, India`;
        
        const forecastData = await weatherService.getWeatherForecast(query, parseInt(days));
        
        res.json(forecastData);
    } catch (error) {
        console.error('Weather forecast error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather forecast',
            error: error.message
        });
    }
});

// Get weather forecast for specific location
router.get('/weather/forecast/location', authMiddleware, async (req, res) => {
    try {
        const { q: query, days = 3 } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Location query parameter "q" is required'
            });
        }
        
        const forecastData = await weatherService.getWeatherForecast(query, parseInt(days));
        
        res.json(forecastData);
    } catch (error) {
        console.error('Weather forecast location error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather forecast for location',
            error: error.message
        });
    }
});

// Get weather alerts for institution's location
router.get('/weather/alerts', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const institution = req.user;
        
        if (!institution.location) {
            return res.status(400).json({
                success: false,
                message: 'Institution location data is required'
            });
        }

        const { city, state } = institution.location;
        const query = `${city}, ${state}, India`;
        
        const alerts = await weatherService.getWeatherAlerts(query);
        
        res.json({
            success: true,
            data: {
                alerts,
                location: {
                    query,
                    city: institution.location.city,
                    state: institution.location.state
                }
            }
        });
    } catch (error) {
        console.error('Weather alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather alerts',
            error: error.message
        });
    }
});

// Get weather alerts for specific location
router.get('/weather/alerts/location', authMiddleware, async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Location query parameter "q" is required'
            });
        }
        
        const alerts = await weatherService.getWeatherAlerts(query);
        
        res.json({
            success: true,
            data: {
                alerts,
                location: { query }
            }
        });
    } catch (error) {
        console.error('Weather alerts location error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather alerts for location',
            error: error.message
        });
    }
});

// Get comprehensive weather dashboard for institution
router.get('/weather/dashboard', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const institution = req.user;
        
        if (!institution.location) {
            return res.status(400).json({
                success: false,
                message: 'Institution location data is required'
            });
        }

        const { city, state } = institution.location;
        const query = `${city}, ${state}, India`;
        
        // Fetch current weather, forecast, and alerts in parallel
        const [currentWeather, forecast, alerts] = await Promise.allSettled([
            weatherService.getWeatherForInstitution(institution),
            weatherService.getWeatherForecast(query, 3),
            weatherService.getWeatherAlerts(query)
        ]);

        const dashboard = {
            success: true,
            data: {
                institution: {
                    name: institution.name,
                    location: institution.location
                },
                current_weather: currentWeather.status === 'fulfilled' ? {
                    ...currentWeather.value.data,
                    safety_assessment: weatherService.assessWeatherSafety(currentWeather.value.data)
                } : null,
                forecast: forecast.status === 'fulfilled' ? forecast.value.data : null,
                alerts: alerts.status === 'fulfilled' ? alerts.value : [],
                last_updated: new Date().toISOString(),
                errors: []
            }
        };

        // Collect any errors
        if (currentWeather.status === 'rejected') {
            dashboard.data.errors.push({ type: 'current_weather', message: currentWeather.reason.message });
        }
        if (forecast.status === 'rejected') {
            dashboard.data.errors.push({ type: 'forecast', message: forecast.reason.message });
        }
        if (alerts.status === 'rejected') {
            dashboard.data.errors.push({ type: 'alerts', message: alerts.reason.message });
        }

        res.json(dashboard);
    } catch (error) {
        console.error('Weather dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather dashboard',
            error: error.message
        });
    }
});

// Get disaster alerts for institution's location
router.get('/disaster/alerts', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const institution = req.user;
        
        if (!institution.location) {
            return res.status(400).json({
                success: false,
                message: 'Institution location data is required'
            });
        }

        const { city, state } = institution.location;
        const query = `${city}, ${state}, India`;
        
        const alertData = await weatherService.getDisasterAlerts(query);
        
        res.json(alertData);
    } catch (error) {
        console.error('Disaster alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch disaster alerts',
            error: error.message
        });
    }
});

// Get disaster alerts for specific location
router.get('/disaster/alerts/location', authMiddleware, async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Location query parameter "q" is required'
            });
        }
        
        const alertData = await weatherService.getDisasterAlerts(query);
        
        res.json(alertData);
    } catch (error) {
        console.error('Disaster alerts location error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch disaster alerts for location',
            error: error.message
        });
    }
});

// Get comprehensive disaster assessment
router.get('/disaster/assessment', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const institution = req.user;
        
        if (!institution.location) {
            return res.status(400).json({
                success: false,
                message: 'Institution location data is required'
            });
        }

        const { city, state } = institution.location;
        const query = `${city}, ${state}, India`;
        
        const assessment = await weatherService.getDisasterAssessment(query);
        
        res.json(assessment);
    } catch (error) {
        console.error('Disaster assessment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get disaster assessment',
            error: error.message
        });
    }
});

// Get disaster assessment for specific location
router.get('/disaster/assessment/location', authMiddleware, async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Location query parameter "q" is required'
            });
        }
        
        const assessment = await weatherService.getDisasterAssessment(query);
        
        res.json(assessment);
    } catch (error) {
        console.error('Disaster assessment location error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get disaster assessment for location',
            error: error.message
        });
    }
});

// Get disaster forecast (upcoming risks)
router.get('/disaster/forecast', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const institution = req.user;
        const { days = 3 } = req.query;
        
        if (!institution.location) {
            return res.status(400).json({
                success: false,
                message: 'Institution location data is required'
            });
        }

        const { city, state } = institution.location;
        const query = `${city}, ${state}, India`;
        
        const forecastData = await weatherService.getWeatherForecast(query, parseInt(days));
        
        // Extract risk information from forecast
        const risks = weatherService.extractForecastRisks(forecastData.data.forecast);
        
        res.json({
            success: true,
            data: {
                location: forecastData.data.location,
                forecast_period: `${days} days`,
                upcoming_risks: risks,
                risk_summary: {
                    total_risk_days: risks.length,
                    high_risk_days: risks.filter(day => 
                        day.risks.some(risk => risk.severity === 'high')
                    ).length,
                    risk_types: [...new Set(risks.flatMap(day => 
                        day.risks.map(risk => risk.type)
                    ))]
                },
                generated_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Disaster forecast error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch disaster forecast',
            error: error.message
        });
    }
});

// Emergency alert endpoint - get critical alerts only
router.get('/disaster/emergency', authMiddleware, async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query && (!req.user.location)) {
            return res.status(400).json({
                success: false,
                message: 'Location query or institution location is required'
            });
        }
        
        const searchQuery = query || `${req.user.location.city}, ${req.user.location.state}, India`;
        const alertData = await weatherService.getDisasterAlerts(searchQuery);
        
        // Filter for only critical/emergency alerts
        const emergencyAlerts = alertData.data.alerts.filter(alert => 
            alert.severity_level === 'extreme' || 
            alert.urgency_level === 'immediate' ||
            alert.alert_type === 'hurricane' ||
            alert.alert_type === 'tornado' ||
            alert.alert_type === 'flood'
        );
        
        res.json({
            success: true,
            data: {
                location: alertData.data.location,
                emergency_alerts: emergencyAlerts,
                alert_count: emergencyAlerts.length,
                has_emergencies: emergencyAlerts.length > 0,
                highest_severity: weatherService.getHighestSeverity(emergencyAlerts),
                last_updated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Emergency alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch emergency alerts',
            error: error.message
        });
    }
});

// Health check for weather service
router.get('/weather/health', async (req, res) => {
    try {
        // Test the weather API with a simple query
        const testWeather = await weatherService.getWeatherData('London', false);
        
        res.json({
            success: true,
            message: 'Weather service is operational',
            data: {
                api_status: 'online',
                cache_status: 'operational',
                test_query: 'London',
                last_check: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Weather service is experiencing issues',
            error: error.message,
            data: {
                api_status: 'offline',
                cache_status: 'unknown',
                last_check: new Date().toISOString()
            }
        });
    }
});

module.exports = router;