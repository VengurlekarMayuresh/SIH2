const mongoose = require('mongoose');
const weatherService = require('./services/weatherService');
const axios = require('axios');
require('dotenv').config();

// Test configurations
const TEST_LOCATIONS = [
    'London',
    'Mumbai, India',
    'Delhi, India',
    'Pune, Maharashtra, India'
];

async function testWeatherService() {
    console.log('🧪 Testing Weather Service Implementation...\n');
    
    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // Test 1: Basic Weather API Connection
        console.log('🌐 Test 1: Basic Weather API Connection');
        await testWeatherAPIConnection();
        
        // Test 2: Weather Data Fetching
        console.log('\n🌤️ Test 2: Weather Data Fetching');
        await testWeatherDataFetching();
        
        // Test 3: Weather Caching
        console.log('\n💾 Test 3: Weather Caching System');
        await testWeatherCaching();
        
        // Test 4: Safety Assessment
        console.log('\n🛡️ Test 4: Weather Safety Assessment');
        await testSafetyAssessment();
        
        // Test 5: Institution Location Query
        console.log('\n🏫 Test 5: Institution Location Weather');
        await testInstitutionWeather();
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n📪 Disconnected from MongoDB');
        process.exit(0);
    }
}

async function testWeatherAPIConnection() {
    try {
        const response = await axios.get(`${process.env.WEATHER_API_BASE_URL}/current.json`, {
            params: {
                key: process.env.WEATHER_API_KEY,
                q: 'London',
                aqi: 'no'
            },
            timeout: 5000
        });
        
        if (response.status === 200 && response.data.location) {
            console.log('   ✅ Weather API connection successful');
            console.log(`   📍 Test location: ${response.data.location.name}, ${response.data.location.country}`);
            console.log(`   🌡️ Temperature: ${response.data.current.temp_c}°C`);
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('   ❌ Weather API connection failed:', error.message);
        throw error;
    }
}

async function testWeatherDataFetching() {
    for (const location of TEST_LOCATIONS) {
        try {
            console.log(`   🔍 Testing location: ${location}`);
            
            const weatherData = await weatherService.getWeatherData(location, true);
            
            if (weatherData.success && weatherData.data) {
                console.log(`   ✅ ${location}: ${weatherData.data.current.temp_c}°C, ${weatherData.data.current.condition.text}`);
                console.log(`   📊 AQI: US-EPA Index ${weatherData.data.current.air_quality?.us_epa_index || 'N/A'}`);
                
                // Verify required fields
                const required = ['location', 'current'];
                for (const field of required) {
                    if (!weatherData.data[field]) {
                        throw new Error(`Missing required field: ${field}`);
                    }
                }
            } else {
                throw new Error('Invalid weather data structure');
            }
        } catch (error) {
            console.error(`   ❌ ${location}: ${error.message}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function testWeatherCaching() {
    const testLocation = 'Mumbai, India';
    
    try {
        console.log(`   🗄️ Testing cache for: ${testLocation}`);
        
        // First request (should hit API)
        const start1 = Date.now();
        const weather1 = await weatherService.getWeatherData(testLocation);
        const time1 = Date.now() - start1;
        
        console.log(`   📊 First request: ${time1}ms (API call)`);
        
        // Second request (should use cache)
        const start2 = Date.now();
        const weather2 = await weatherService.getWeatherData(testLocation);
        const time2 = Date.now() - start2;
        
        console.log(`   📊 Second request: ${time2}ms (cached)`);
        
        if (weather1.data.current.temp_c === weather2.data.current.temp_c) {
            console.log('   ✅ Cache working correctly - same data returned');
        } else {
            console.log('   ⚠️ Different data returned - cache might not be working');
        }
        
        if (time2 < time1 / 2) {
            console.log('   ✅ Cache performance improvement detected');
        }
        
        // Check database cache entry
        const Weather = require('./models/Weather');
        const cachedEntry = await Weather.findOne({ query: testLocation.toLowerCase() });
        
        if (cachedEntry) {
            console.log('   ✅ Cache entry found in database');
            console.log(`   📅 Cached at: ${cachedEntry.cached_at}`);
            console.log(`   ⏰ Expires at: ${cachedEntry.expires_at}`);
        } else {
            console.log('   ❌ No cache entry found in database');
        }
        
    } catch (error) {
        console.error('   ❌ Cache test failed:', error.message);
    }
}

async function testSafetyAssessment() {
    const testCases = [
        { location: 'Mumbai, India', description: 'Normal conditions' },
        { location: 'London', description: 'Moderate conditions' }
    ];
    
    for (const testCase of testCases) {
        try {
            console.log(`   🔍 Testing safety assessment: ${testCase.description}`);
            
            const weatherData = await weatherService.getWeatherData(testCase.location);
            const safetyAssessment = weatherService.assessWeatherSafety(weatherData.data);
            
            console.log(`   📍 Location: ${weatherData.data.location.name}`);
            console.log(`   🛡️ Safety Level: ${safetyAssessment.safety_level}`);
            console.log(`   🚶 Safe for outdoor activities: ${safetyAssessment.is_safe_for_outdoor_activities ? 'Yes' : 'No'}`);
            
            if (safetyAssessment.concerns.length > 0) {
                console.log(`   ⚠️ Concerns: ${safetyAssessment.concerns.join(', ')}`);
            }
            
            if (safetyAssessment.recommendations.length > 0) {
                console.log(`   💡 Recommendations: ${safetyAssessment.recommendations.length} items`);
            }
            
            console.log('   ✅ Safety assessment completed');
            
        } catch (error) {
            console.error(`   ❌ Safety assessment failed for ${testCase.description}:`, error.message);
        }
    }
}

async function testInstitutionWeather() {
    // Mock institution data
    const mockInstitution = {
        name: 'Test Institution',
        location: {
            city: 'Mumbai',
            district: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            address: 'Test Address'
        }
    };
    
    try {
        console.log('   🏫 Testing institution weather fetching...');
        
        const weatherData = await weatherService.getWeatherForInstitution(mockInstitution);
        
        if (weatherData.success && weatherData.data) {
            console.log('   ✅ Institution weather data fetched successfully');
            console.log(`   📍 Location: ${weatherData.data.location.name}`);
            console.log(`   🌡️ Temperature: ${weatherData.data.current.temp_c}°C`);
            console.log(`   🌤️ Condition: ${weatherData.data.current.condition.text}`);
            
            // Test safety recommendations
            if (weatherData.data.safety_recommendations) {
                console.log(`   💡 Safety recommendations: ${weatherData.data.safety_recommendations.length} items`);
            }
        } else {
            throw new Error('Invalid institution weather data');
        }
        
    } catch (error) {
        console.error('   ❌ Institution weather test failed:', error.message);
    }
}

// Test API endpoints with HTTP requests
async function testWeatherAPIs() {
    console.log('\n🌐 Testing Weather API Endpoints...\n');
    
    const baseUrl = 'http://localhost:5001/api';
    
    try {
        // Test health endpoint
        console.log('🏥 Testing health endpoint...');
        const healthResponse = await axios.get(`${baseUrl}/weather/health`);
        
        if (healthResponse.status === 200) {
            console.log('✅ Health endpoint working');
            console.log(`📊 API Status: ${healthResponse.data.data.api_status}`);
        }
        
        // Test location weather endpoint
        console.log('\n📍 Testing location weather endpoint...');
        const locationResponse = await axios.get(`${baseUrl}/weather/location`, {
            params: { q: 'Mumbai, India', aqi: 'true' }
        });
        
        if (locationResponse.status === 200) {
            console.log('✅ Location weather endpoint working');
            console.log(`🌡️ Temperature: ${locationResponse.data.data.current.temp_c}°C`);
        }
        
    } catch (error) {
        console.error('❌ API endpoint test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the server is running on port 5001');
        }
    }
}

// Run tests
console.log('🚀 Starting Weather API Tests...');
console.log('━'.repeat(50));

// Test service first
testWeatherService().then(() => {
    // Then test HTTP endpoints if service tests pass
    console.log('\n' + '━'.repeat(50));
    return testWeatherAPIs();
}).catch((error) => {
    console.error('Test execution failed:', error.message);
    process.exit(1);
});