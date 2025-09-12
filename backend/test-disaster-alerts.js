const mongoose = require('mongoose');
const weatherService = require('./services/weatherService');
const axios = require('axios');
require('dotenv').config();

// Test locations that might have active alerts or interesting weather patterns
const TEST_LOCATIONS = [
    'Mumbai, India',
    'Delhi, India', 
    'Chennai, India',
    'Kolkata, India',
    'Miami, Florida', // Hurricane prone
    'Tokyo, Japan', // Earthquake/Typhoon prone
    'London, UK' // General weather
];

async function testDisasterAlerts() {
    console.log('🚨 Testing Disaster Alert System...\n');
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // Test 1: Basic Disaster Alert Fetching
        console.log('1️⃣ Testing Basic Disaster Alert Fetching');
        await testBasicDisasterAlerts();
        
        // Test 2: Enhanced Alert Processing
        console.log('\n2️⃣ Testing Enhanced Alert Processing');
        await testEnhancedAlertProcessing();
        
        // Test 3: Disaster Assessment
        console.log('\n3️⃣ Testing Comprehensive Disaster Assessment');
        await testDisasterAssessment();
        
        // Test 4: Forecast Risk Analysis
        console.log('\n4️⃣ Testing Forecast Risk Analysis');
        await testForecastRiskAnalysis();
        
        // Test 5: Emergency Alert Filtering
        console.log('\n5️⃣ Testing Emergency Alert Filtering');
        await testEmergencyAlerts();
        
        console.log('\n✅ All disaster alert tests completed!');
        
    } catch (error) {
        console.error('❌ Disaster alert test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n📪 Disconnected from MongoDB');
    }
}

async function testBasicDisasterAlerts() {
    for (const location of TEST_LOCATIONS.slice(0, 3)) { // Test first 3 locations
        try {
            console.log(`   🔍 Testing alerts for: ${location}`);
            
            const alertData = await weatherService.getDisasterAlerts(location);
            
            if (alertData.success) {
                console.log(`   ✅ ${location}:`);
                console.log(`      📍 Location: ${alertData.data.location.name}, ${alertData.data.location.country}`);
                console.log(`      🌡️ Current: ${alertData.data.current_weather.temp_c}°C, ${alertData.data.current_weather.condition.text}`);
                console.log(`      ⚠️ Active Alerts: ${alertData.data.alert_count}`);
                console.log(`      🔥 Highest Severity: ${alertData.data.highest_severity}`);
                
                if (alertData.data.alerts.length > 0) {
                    alertData.data.alerts.forEach((alert, index) => {
                        console.log(`      📢 Alert ${index + 1}: ${alert.headline}`);
                        console.log(`         Type: ${alert.alert_type}, Severity: ${alert.severity_level}, Urgency: ${alert.urgency_level}`);
                    });
                } else {
                    console.log(`      ✅ No active alerts - area is safe`);
                }
            } else {
                console.log(`   ❌ Failed to fetch alerts for ${location}`);
            }
            
        } catch (error) {
            console.error(`   ❌ ${location}: ${error.message}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function testEnhancedAlertProcessing() {
    const testLocation = 'Mumbai, India';
    
    try {
        console.log(`   🧠 Testing enhanced processing for: ${testLocation}`);
        
        const alertData = await weatherService.getDisasterAlerts(testLocation);
        
        if (alertData.success && alertData.data.alerts.length > 0) {
            console.log('   ✅ Enhanced alert processing working:');
            
            alertData.data.alerts.forEach((alert, index) => {
                console.log(`   📊 Alert ${index + 1} Analysis:`);
                console.log(`      Original severity: ${alert.severity}`);
                console.log(`      Categorized severity: ${alert.severity_level}`);
                console.log(`      Alert type: ${alert.alert_type}`);
                console.log(`      Urgency level: ${alert.urgency_level}`);
                console.log(`      Affected areas: ${alert.affected_areas.join(', ') || 'Not specified'}`);
                console.log(`      Coordinates: ${alert.coordinates.lat}, ${alert.coordinates.lon}`);
            });
        } else {
            console.log('   ℹ️ No alerts to process enhanced features - testing categorization logic');
            
            // Test categorization methods directly
            const testSeverities = ['Severe', 'Moderate', 'Minor', 'Extreme'];
            const testEvents = ['Heavy Rain', 'Thunderstorm', 'Heat Wave', 'Flood Warning'];
            const testUrgencies = ['Immediate', 'Expected', 'Future'];
            
            console.log('   📋 Testing categorization logic:');
            testSeverities.forEach(severity => {
                console.log(`      Severity "${severity}" → "${weatherService.categorizeSeverity(severity)}"`);
            });
            
            testEvents.forEach(event => {
                console.log(`      Event "${event}" → "${weatherService.categorizeAlertType(event)}"`);
            });
            
            testUrgencies.forEach(urgency => {
                console.log(`      Urgency "${urgency}" → "${weatherService.categorizeUrgency(urgency)}"`);
            });
        }
        
    } catch (error) {
        console.error('   ❌ Enhanced processing test failed:', error.message);
    }
}

async function testDisasterAssessment() {
    const testLocation = 'Delhi, India';
    
    try {
        console.log(`   🎯 Testing comprehensive assessment for: ${testLocation}`);
        
        const assessment = await weatherService.getDisasterAssessment(testLocation);
        
        if (assessment.success) {
            console.log('   ✅ Comprehensive assessment completed:');
            console.log(`      📍 Location: ${assessment.data.location?.name || 'Unknown'}`);
            console.log(`      🌡️ Current temp: ${assessment.data.current_conditions?.current?.temp_c || 'N/A'}°C`);
            console.log(`      ⚠️ Active alerts: ${assessment.data.active_alerts.length}`);
            console.log(`      📊 Forecast risks: ${assessment.data.forecast_alerts.length} risk periods`);
            console.log(`      🔥 Overall risk: ${assessment.data.risk_assessment.overall_risk}`);
            console.log(`      🚨 Immediate risks: ${assessment.data.risk_assessment.immediate_risks.length}`);
            console.log(`      ⏳ Upcoming risks: ${assessment.data.risk_assessment.upcoming_risks.length}`);
            console.log(`      💡 Safety recommendations: ${assessment.data.risk_assessment.safety_recommendations.length}`);
            
            if (assessment.data.risk_assessment.immediate_risks.length > 0) {
                console.log('   📋 Immediate Risks:');
                assessment.data.risk_assessment.immediate_risks.forEach((risk, index) => {
                    console.log(`      ${index + 1}. ${risk.description} (${risk.severity})`);
                });
            }
            
            if (assessment.data.risk_assessment.upcoming_risks.length > 0) {
                console.log('   📅 Upcoming Risks:');
                assessment.data.risk_assessment.upcoming_risks.slice(0, 3).forEach((risk, index) => {
                    console.log(`      ${index + 1}. ${risk.description} (${risk.date})`);
                });
            }
            
        } else {
            console.log('   ❌ Assessment failed');
        }
        
    } catch (error) {
        console.error('   ❌ Assessment test failed:', error.message);
    }
}

async function testForecastRiskAnalysis() {
    const testLocation = 'Chennai, India';
    
    try {
        console.log(`   📈 Testing forecast risk analysis for: ${testLocation}`);
        
        const forecastData = await weatherService.getWeatherForecast(testLocation, 3);
        
        if (forecastData.success && forecastData.data.forecast) {
            const risks = weatherService.extractForecastRisks(forecastData.data.forecast);
            
            console.log('   ✅ Forecast risk analysis completed:');
            console.log(`      📊 Risk periods identified: ${risks.length}`);
            
            if (risks.length > 0) {
                risks.forEach((dayRisk, index) => {
                    console.log(`      📅 Day ${index + 1} (${dayRisk.date}):`);
                    dayRisk.risks.forEach(risk => {
                        console.log(`         ⚠️ ${risk.type}: ${risk.description} (${risk.severity} severity)`);
                    });
                });
                
                // Analyze risk patterns
                const riskTypes = [...new Set(risks.flatMap(day => day.risks.map(risk => risk.type)))];
                const highRiskDays = risks.filter(day => day.risks.some(risk => risk.severity === 'high')).length;
                
                console.log(`   📊 Risk Analysis Summary:`);
                console.log(`      Risk types found: ${riskTypes.join(', ')}`);
                console.log(`      High risk days: ${highRiskDays}`);
                
            } else {
                console.log('   ✅ No significant risks identified in forecast');
            }
            
        } else {
            console.log('   ❌ Forecast data not available');
        }
        
    } catch (error) {
        console.error('   ❌ Forecast risk analysis failed:', error.message);
    }
}

async function testEmergencyAlerts() {
    // Test with a location that might have severe weather
    const testLocation = 'Mumbai, India';
    
    try {
        console.log(`   🚨 Testing emergency alert filtering for: ${testLocation}`);
        
        const alertData = await weatherService.getDisasterAlerts(testLocation);
        
        if (alertData.success) {
            // Simulate emergency filtering (like in the route)
            const emergencyAlerts = alertData.data.alerts.filter(alert => 
                alert.severity_level === 'extreme' || 
                alert.urgency_level === 'immediate' ||
                alert.alert_type === 'hurricane' ||
                alert.alert_type === 'tornado' ||
                alert.alert_type === 'flood'
            );
            
            console.log('   ✅ Emergency filtering completed:');
            console.log(`      📊 Total alerts: ${alertData.data.alerts.length}`);
            console.log(`      🚨 Emergency alerts: ${emergencyAlerts.length}`);
            console.log(`      🔥 Highest severity: ${alertData.data.highest_severity}`);
            
            if (emergencyAlerts.length > 0) {
                console.log('   🚨 EMERGENCY ALERTS DETECTED:');
                emergencyAlerts.forEach((alert, index) => {
                    console.log(`      ${index + 1}. ${alert.headline}`);
                    console.log(`         Type: ${alert.alert_type}, Severity: ${alert.severity_level}`);
                    console.log(`         Urgency: ${alert.urgency_level}`);
                });
            } else {
                console.log('   ✅ No emergency-level alerts detected');
            }
            
        } else {
            console.log('   ❌ Emergency alert test failed');
        }
        
    } catch (error) {
        console.error('   ❌ Emergency alert test failed:', error.message);
    }
}

// Test HTTP endpoints if server is running
async function testDisasterAPIEndpoints() {
    console.log('\n🌐 Testing Disaster Alert API Endpoints...\n');
    
    const baseUrl = 'http://localhost:5001/api';
    
    try {
        // Test disaster alerts endpoint (public location)
        console.log('🔍 Testing disaster alerts endpoint...');
        const alertResponse = await axios.get(`${baseUrl}/disaster/alerts/location`, {
            params: { q: 'Mumbai, India' }
        });
        
        if (alertResponse.status === 200) {
            console.log('✅ Disaster alerts endpoint working');
            console.log(`📊 Alert count: ${alertResponse.data.data.alert_count}`);
            console.log(`🌡️ Current weather: ${alertResponse.data.data.current_weather?.temp_c || 'N/A'}°C`);
        }
        
        // Test disaster assessment endpoint
        console.log('\n🎯 Testing disaster assessment endpoint...');
        const assessmentResponse = await axios.get(`${baseUrl}/disaster/assessment/location`, {
            params: { q: 'Delhi, India' }
        });
        
        if (assessmentResponse.status === 200) {
            console.log('✅ Disaster assessment endpoint working');
            console.log(`🔥 Overall risk: ${assessmentResponse.data.data.risk_assessment?.overall_risk || 'N/A'}`);
            console.log(`⚠️ Immediate risks: ${assessmentResponse.data.data.risk_assessment?.immediate_risks?.length || 0}`);
        }
        
    } catch (error) {
        console.error('❌ API endpoint test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the server is running on port 5001');
        } else if (error.response?.status === 401) {
            console.log('💡 Some endpoints require authentication');
        }
    }
}

// Run tests
console.log('🚀 Starting Disaster Alert Tests...');
console.log('━'.repeat(60));

testDisasterAlerts().then(() => {
    console.log('\n' + '━'.repeat(60));
    return testDisasterAPIEndpoints();
}).catch((error) => {
    console.error('Test execution failed:', error.message);
    process.exit(1);
});