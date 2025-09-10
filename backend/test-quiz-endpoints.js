const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testQuizEndpoints() {
  console.log('🧪 Testing Quiz Endpoints...\n');
  
  try {
    // 1. Test student login to get token
    console.log('1. Testing student login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/student/login`, {
      email: 'alice@student.test',
      password: 'student123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Student login successful');
    console.log('Token:', token.substring(0, 20) + '...');
    
    // 2. Test fetching student quizzes
    console.log('\n2. Testing student quizzes endpoint...');
    const quizzesResponse = await axios.get(`${API_BASE_URL}/student/quizzes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Student quizzes fetched successfully');
    console.log('Full response:', JSON.stringify(quizzesResponse.data, null, 2));
    
    const quizzes = quizzesResponse.data.quizzes || quizzesResponse.data;
    console.log('Number of quizzes:', quizzes.length);
    
    if (quizzes.length > 0) {
      const firstQuiz = quizzes[0];
      console.log('First quiz:', {
        id: firstQuiz.id || firstQuiz._id,
        title: firstQuiz.title,
        questionsCount: firstQuiz.questionCount || firstQuiz.questions?.length || 0
      });
      
      // 3. Test fetching specific quiz details
      console.log('\n3. Testing specific quiz endpoint...');
      const quizDetailResponse = await axios.get(`${API_BASE_URL}/quizzes/${firstQuiz.id || firstQuiz._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('\u2705 Quiz details fetched successfully');
      console.log('Quiz title:', quizDetailResponse.data.title);
      console.log('Questions count:', quizDetailResponse.data.questions.length);
      
      // 4. Test starting a quiz
      console.log('\n4. Testing start quiz endpoint...');
      try {
        const startResponse = await axios.post(`${API_BASE_URL}/student/quiz/start`, {
          quizId: firstQuiz.id || firstQuiz._id
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Quiz started successfully');
        console.log('Attempt ID:', startResponse.data.attemptId);
        
        // 5. Test fetching attempts
        console.log('\n5. Testing quiz attempts endpoint...');
        const attemptsResponse = await axios.get(`${API_BASE_URL}/student/quiz/attempts?quizId=${firstQuiz.id || firstQuiz._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Quiz attempts fetched successfully');
        console.log('Number of attempts:', attemptsResponse.data.length);
        
      } catch (startError) {
        console.log('⚠️ Start quiz error (may be expected if already started):', startError.response?.data?.message || startError.message);
      }
      
    } else {
      console.log('⚠️ No quizzes found. You may need to create sample data.');
    }
    
  } catch (error) {
    console.error('❌ Error testing quiz endpoints:', error.response?.data || error.message);
  }
}

// Run the test
testQuizEndpoints();
