#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script helps verify that your deployment is configured correctly
 * by testing API connectivity and environment variable setup.
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  // Update these with your deployed URLs
  FRONTEND_URL: process.argv[2] || 'https://your-frontend-domain.com',
  API_URL: process.argv[3] || 'https://your-api-domain.com/api',
  timeout: 10000
};

console.log('🚀 SafeEd Deployment Verification');
console.log('=====================================');
console.log(`Frontend URL: ${config.FRONTEND_URL}`);
console.log(`API URL: ${config.API_URL}`);
console.log('');

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: config.timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Test API endpoint
 */
async function testAPI() {
  console.log('🔍 Testing API endpoint...');
  
  try {
    const response = await makeRequest(config.API_URL.replace('/api', ''));
    
    if (response.statusCode === 200) {
      console.log('✅ API is reachable');
      
      try {
        const data = JSON.parse(response.data);
        if (data.message && data.message.includes('SafeEd')) {
          console.log('✅ API is responding correctly');
          console.log(`   Message: ${data.message}`);
        } else {
          console.log('⚠️  API responded but message format unexpected');
        }
      } catch (e) {
        console.log('⚠️  API responded but not with expected JSON');
      }
    } else {
      console.log(`❌ API returned status code: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ API test failed: ${error.message}`);
  }
}

/**
 * Test API health endpoint
 */
async function testAPIHealth() {
  console.log('🔍 Testing API health endpoint...');
  
  try {
    const response = await makeRequest(`${config.API_URL}/health`);
    
    if (response.statusCode === 200 || response.statusCode === 404) {
      console.log('✅ API server is running');
    } else {
      console.log(`⚠️  API health check returned: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ API health check failed: ${error.message}`);
  }
}

/**
 * Test CORS configuration
 */
async function testCORS() {
  console.log('🔍 Testing CORS configuration...');
  
  try {
    const response = await makeRequest(config.API_URL);
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
      'access-control-allow-methods': response.headers['access-control-allow-methods']
    };
    
    if (corsHeaders['access-control-allow-origin']) {
      console.log('✅ CORS headers present');
      console.log(`   Allowed Origin: ${corsHeaders['access-control-allow-origin']}`);
      
      if (corsHeaders['access-control-allow-origin'] === config.FRONTEND_URL || 
          corsHeaders['access-control-allow-origin'] === '*') {
        console.log('✅ CORS configured correctly');
      } else {
        console.log('⚠️  CORS origin might not match frontend URL');
      }
    } else {
      console.log('⚠️  No CORS headers found - might cause issues');
    }
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
  }
}

/**
 * Test frontend availability
 */
async function testFrontend() {
  console.log('🔍 Testing frontend availability...');
  
  try {
    const response = await makeRequest(config.FRONTEND_URL);
    
    if (response.statusCode === 200) {
      console.log('✅ Frontend is accessible');
      
      // Check if it contains expected content
      if (response.data.includes('SafeEd') || response.data.includes('vite') || response.data.includes('react')) {
        console.log('✅ Frontend appears to be the correct application');
      }
    } else {
      console.log(`❌ Frontend returned status code: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Frontend test failed: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('Starting deployment verification tests...\n');
  
  await testAPI();
  console.log('');
  
  await testAPIHealth();
  console.log('');
  
  await testCORS();
  console.log('');
  
  await testFrontend();
  console.log('');
  
  console.log('=====================================');
  console.log('🎉 Deployment verification complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. If all tests passed ✅ - Your deployment is ready!');
  console.log('2. If any tests failed ❌ - Check the deployment guide');
  console.log('3. Test the app manually in your browser');
  console.log('4. Check browser console for any errors');
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node test-deployment.js [FRONTEND_URL] [API_URL]');
  console.log('');
  console.log('Examples:');
  console.log('  node test-deployment.js https://safeed.netlify.app https://safeed-api.railway.app/api');
  console.log('  node test-deployment.js https://safeed.vercel.app https://safeed-api.herokuapp.com/api');
  console.log('');
  process.exit(0);
}

// Run tests
runTests().catch(console.error);