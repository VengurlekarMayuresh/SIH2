const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
  console.log('🔍 Testing API server...\n');
  
  try {
    // Test if server is running
    const healthCheck = await axios.get('http://localhost:5001/');
    console.log('✅ Server is running:', healthCheck.data.message);
    
    // Test if we can get modules
    const modulesResponse = await axios.get(`${API_BASE_URL}/modules`);
    console.log('✅ Modules endpoint working, found:', modulesResponse.data.length, 'modules');
    
    console.log('\n📚 Available modules:');
    modulesResponse.data.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (ID: ${module._id})`);
    });
    
    if (modulesResponse.data.length > 0) {
      const firstModule = modulesResponse.data[0];
      console.log(`\n🎯 We can use module "${firstModule.title}" for creating quizzes`);
      console.log(`Module ID: ${firstModule._id}`);
      
      // Show the complete quiz creation data format
      console.log('\n📝 COMPLETE QUIZ CREATION FORMAT:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const sampleQuizData = {
        title: "Earthquake Safety Quiz",
        description: "Test your knowledge about earthquake safety and preparedness measures.",
        moduleId: firstModule._id,
        questions: [
          {
            question: "What is the safest action during an earthquake?",
            options: [
              { text: "Run outside immediately", isCorrect: false },
              { text: "Drop, Cover, Hold", isCorrect: true },
              { text: "Stand near a window", isCorrect: false },
              { text: "Climb a tree", isCorrect: false }
            ],
            difficulty: "easy",
            explanation: "Follow NDMA guidelines. The correct answer is: Drop, Cover, Hold",
            points: 1,
            hints: [{
              text: "Follow NDMA guidelines.",
              penalty: 0.1
            }]
          },
          {
            question: "Where should you avoid standing during an earthquake?",
            options: [
              { text: "Under furniture", isCorrect: false },
              { text: "Near windows or heavy objects", isCorrect: true },
              { text: "In a doorway", isCorrect: false },
              { text: "On a carpet", isCorrect: false }
            ],
            difficulty: "easy",
            explanation: "Windows can shatter. The correct answer is: Near windows or heavy objects",
            points: 1,
            hints: [{
              text: "Windows can shatter.",
              penalty: 0.1
            }]
          }
        ],
        settings: {
          timeLimit: 10,
          passingScore: 70,
          maxAttempts: 3,
          randomizeQuestions: false,
          randomizeOptions: true,
          showCorrectAnswers: true,
          allowRetake: true,
          retakeDelay: 0
        },
        status: 'published'
      };
      
      console.log('POST /api/institution/quizzes');
      console.log('Authorization: Bearer <institution_token>');
      console.log('Content-Type: application/json');
      console.log('\nRequest Body:');
      console.log(JSON.stringify(sampleQuizData, null, 2));
      
      console.log('\n🔑 TO CREATE QUIZZES, YOU NEED:');
      console.log('1. Institution Token (from login)');
      console.log('2. Module ID (shown above)');
      console.log('3. Quiz data in the format shown above');
      
      console.log('\n📋 STEPS TO CREATE AND TEST QUIZZES:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('1. Register/Login Institution:');
      console.log('   POST /api/institution/register or POST /api/institution/login');
      console.log('   Get the token from response');
      console.log('');
      console.log('2. Create Quiz:');
      console.log('   POST /api/institution/quizzes');
      console.log('   Headers: Authorization: Bearer <institution_token>');
      console.log('   Body: Quiz data (format shown above)');
      console.log('');
      console.log('3. Register/Login Student:');
      console.log('   POST /api/student/register or POST /api/student/login');
      console.log('   Get student token');
      console.log('');
      console.log('4. Get Available Quizzes (as student):');
      console.log('   GET /api/student/quizzes');
      console.log('   Headers: Authorization: Bearer <student_token>');
      console.log('');
      console.log('5. Start Quiz Attempt:');
      console.log('   POST /api/student/quiz/start');
      console.log('   Body: {"quizId": "quiz_id_from_step_4"}');
      console.log('   Headers: Authorization: Bearer <student_token>');
      console.log('');
      console.log('6. Submit Quiz Answers:');
      console.log('   POST /api/student/quiz/submit');
      console.log('   Body: {"attemptId": "from_step_5", "answers": [...]}');
      console.log('   Headers: Authorization: Bearer <student_token>');
      
    } else {
      console.log('\n❌ No modules found. You need to create modules first.');
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Server not responding. Make sure the server is running on port 5001');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAPI();
