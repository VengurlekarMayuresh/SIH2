const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

const testProgressDashboard = async () => {
    try {
        console.log('🔑 Testing student login...');
        
        // Login as student
        const loginResponse = await axios.post(`${API_BASE_URL}/student/login`, {
            email: 'alice@student.test',
            password: 'testpass123'
        });
        
        console.log('✅ Student login successful');
        const token = loginResponse.data.token;
        const student = loginResponse.data.student;
        
        console.log('Student:', student.name, '- Email:', student.email);
        
        // Test progress dashboard endpoint
        console.log('\n📊 Testing progress dashboard endpoint...');
        const progressResponse = await axios.get(`${API_BASE_URL}/student/progress-dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Progress dashboard data received');
        const data = progressResponse.data;
        
        console.log('\n📈 Progress Statistics:');
        console.log('- Completed Modules:', data.stats.completedModules, '/', data.stats.totalModules);
        console.log('- Latest Quiz Score:', Math.round(data.stats.latestQuizScore) + '%');
        console.log('- Earned Badges:', data.stats.earnedBadges);
        console.log('- Overall Progress:', data.stats.overallProgress + '%');
        
        console.log('\n🎯 Quiz Score Trends:', data.quizScoreData.length, 'data points');
        console.log('\n📚 Module Progress:', data.moduleProgressData.length, 'modules');
        if (data.moduleProgressData.length > 0) {
            data.moduleProgressData.forEach(module => {
                console.log(`- ${module.module}: ${module.progress}%`);
            });
        }
        
        console.log('\n🏆 Badges Available:', data.badges.length);
        const earnedBadges = data.badges.filter(b => b.earned);
        console.log('- Earned:', earnedBadges.length);
        if (earnedBadges.length > 0) {
            earnedBadges.forEach(badge => {
                console.log(`  • ${badge.title} (${badge.icon})`);
            });
        }
        
        console.log('\n🎉 Progress dashboard API working correctly!');
        
    } catch (error) {
        console.error('❌ Error testing progress dashboard:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
};

testProgressDashboard();
