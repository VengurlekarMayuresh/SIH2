const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

const testDashboardAPI = async () => {
    try {
        console.log('🔗 Testing API connection...');
        
        // First, test if the API is running
        const healthCheck = await axios.get('http://localhost:5001');
        console.log('✅ API is running:', healthCheck.data.message);
        
        console.log('\n🔑 Testing student login...');
        
        // Try to login with a test student
        const loginResponse = await axios.post(`${API_BASE_URL}/student/login`, {
            email: 'alice@student.test', // Change this if needed
            password: 'testpass123'       // Change this if needed
        });
        
        console.log('✅ Student login successful');
        const token = loginResponse.data.token;
        const student = loginResponse.data.student;
        
        console.log('Student:', student.name, '- ID:', student.id);
        
        // Test the dashboard-data endpoint specifically  
        console.log('\n📊 Testing /student/dashboard-data endpoint...');
        const dashboardResponse = await axios.get(`${API_BASE_URL}/student/dashboard-data`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Dashboard data received successfully!');
        const data = dashboardResponse.data;
        
        console.log('\n📈 Dashboard Data Structure:');
        console.log('- Streak:', data.streak || 'N/A');
        console.log('- Recent Activity Count:', data.recentActivity?.length || 0);
        console.log('- Today\'s Progress:', {
            completed: data.todayProgress?.completed || 0,
            goal: data.todayProgress?.goal || 0,
            percentage: data.todayProgress?.percentage || 0
        });
        console.log('- Next Badge:', data.nextBadge?.name || 'None available');
        
        console.log('\n🎉 Dashboard API is working correctly!');
        
    } catch (error) {
        console.error('❌ Error testing dashboard API:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Status Text:', error.response.statusText);
            console.error('Error Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request made but no response received');
            console.error('Request:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        console.error('Full error:', error.code);
    }
};

testDashboardAPI();