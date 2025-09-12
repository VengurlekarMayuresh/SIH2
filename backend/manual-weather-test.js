const axios = require('axios');
require('dotenv').config();

// Configuration
const BASE_URL = 'http://localhost:5001/api';
const TEST_LOCATION = 'Mumbai, India';

// Test token - you'll need to replace this with a real JWT token
// To get a token, login through your institution login endpoint first
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE';

const headers = {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
};

async function testWeatherEndpoints() {
    console.log('🌤️ Manual Weather API Testing\n');
    
    // Test 1: Health Check (No auth required)
    console.log('1️⃣ Testing Weather Health Check...');
    try {
        const response = await axios.get(`${BASE_URL}/weather/health`);
        console.log('✅ Health Check Status:', response.status);
        console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Health Check Failed:', error.response?.data || error.message);
    }
    
    console.log('\n' + '━'.repeat(50) + '\n');
    
    // Test 2: Location Weather (Requires auth)
    console.log('2️⃣ Testing Location Weather...');
    try {
        const response = await axios.get(`${BASE_URL}/weather/location`, {
            params: { 
                q: TEST_LOCATION,
                aqi: 'true'
            },
            headers
        });
        console.log('✅ Location Weather Status:', response.status);
        console.log('🌡️ Temperature:', response.data.data.current.temp_c + '°C');
        console.log('🌤️ Condition:', response.data.data.current.condition.text);
        console.log('🛡️ Safety Level:', response.data.data.safety_assessment?.safety_level);
    } catch (error) {
        if (error.response?.status === 401) {
            console.error('❌ Authentication required. Please set TEST_TOKEN variable.');
        } else {
            console.error('❌ Location Weather Failed:', error.response?.data || error.message);
        }
    }
    
    console.log('\n' + '━'.repeat(50) + '\n');
    
    // Test 3: Direct Weather Service Test (No server needed)
    console.log('3️⃣ Testing Weather Service Directly...');
    try {
        const weatherService = require('./services/weatherService');
        const weatherData = await weatherService.getWeatherData(TEST_LOCATION, true);
        
        if (weatherData.success) {
            console.log('✅ Direct Service Test Success');
            console.log('📍 Location:', weatherData.data.location.name);
            console.log('🌡️ Temperature:', weatherData.data.current.temp_c + '°C');
            console.log('🌤️ Condition:', weatherData.data.current.condition.text);
            console.log('💨 Wind:', weatherData.data.current.wind_kph + ' km/h');
            console.log('💧 Humidity:', weatherData.data.current.humidity + '%');
            
            if (weatherData.data.current.air_quality) {
                console.log('🌫️ Air Quality (US EPA):', weatherData.data.current.air_quality.us_epa_index);
            }
            
            // Test safety assessment
            const safetyAssessment = weatherService.assessWeatherSafety(weatherData.data);
            console.log('🛡️ Safety Assessment:');
            console.log('   Level:', safetyAssessment.safety_level);
            console.log('   Safe for outdoor activities:', safetyAssessment.is_safe_for_outdoor_activities);
            if (safetyAssessment.concerns.length > 0) {
                console.log('   Concerns:', safetyAssessment.concerns.join(', '));
            }
        }
    } catch (error) {
        console.error('❌ Direct Service Test Failed:', error.message);
    }
}

// Instructions for getting auth token
console.log('📝 SETUP INSTRUCTIONS:');
console.log('1. Make sure your server is running: node server.js');
console.log('2. To test authenticated endpoints, you need a JWT token:');
console.log('   a. Login via POST /api/institution/login');
console.log('   b. Copy the token from the response');
console.log('   c. Replace TEST_TOKEN in this file');
console.log('3. Run this test: node manual-weather-test.js\n');

// Run tests
testWeatherEndpoints().catch(console.error);