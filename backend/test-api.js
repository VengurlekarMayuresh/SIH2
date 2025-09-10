const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

const testInstitutionDashboard = async () => {
    try {
        console.log('🔑 Testing institution login...');
        
        // Login as institution
        const loginResponse = await axios.post(`${API_BASE_URL}/institution/login`, {
            email: 'admin@freshtest.edu',
            password: 'testpass123'
        });
        
        console.log('✅ Institution login successful');
        const token = loginResponse.data.token;
        const institution = loginResponse.data.institution;
        
        console.log('Institution:', institution.name, '- Code:', institution.institutionId);
        
        // Test analytics endpoint
        console.log('\n📊 Testing analytics endpoint...');
        const analyticsResponse = await axios.get(`${API_BASE_URL}/institution/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Analytics data:', analyticsResponse.data.analytics);
        
        // Test students with progress endpoint
        console.log('\n👥 Testing students progress endpoint...');
        const studentsResponse = await axios.get(`${API_BASE_URL}/institution/students-progress`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Students data:');
        studentsResponse.data.students.forEach(student => {
            console.log(`- ${student.name} (${student.class}-${student.division}) - ${student.progress.averageScore}% avg`);
        });
        
        console.log('\n🎉 All institution dashboard APIs working correctly!');
        
    } catch (error) {
        console.error('❌ Error testing APIs:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
};

testInstitutionDashboard();
