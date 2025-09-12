const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safed').then(async () => {
  console.log('Connected to MongoDB');
  
  const Quiz = require('./models/Quiz');
  
  // Use the first Fire Safety module
  const moduleId = '68c04c0b41825d403c5d7dbe';
  
  // Create a quiz with 10 questions
  const quizData = {
    title: 'Riyans Fire Safety Quiz',
    description: 'A comprehensive fire safety quiz with 10 questions to test knowledge and preparedness.',
    moduleId: moduleId,
    questions: [
      {
        question: 'What is the most important action to take when you discover a fire?',
        options: [
          { text: 'Try to put out the fire yourself', isCorrect: false },
          { text: 'Alert others and call the fire department', isCorrect: true },
          { text: 'Collect your belongings first', isCorrect: false },
          { text: 'Take photos for insurance', isCorrect: false }
        ],
        difficulty: 'easy',
        explanation: 'The priority is always to ensure safety by alerting others and calling professionals.',
        timeLimit: 30,
        points: 10
      },
      {
        question: 'Which class of fire extinguisher should be used for electrical fires?',
        options: [
          { text: 'Class A', isCorrect: false },
          { text: 'Class B', isCorrect: false },
          { text: 'Class C', isCorrect: true },
          { text: 'Class D', isCorrect: false }
        ],
        difficulty: 'medium',
        explanation: 'Class C extinguishers are specifically designed for electrical fires.',
        timeLimit: 45,
        points: 15
      },
      {
        question: 'What does the acronym PASS stand for in fire extinguisher use?',
        options: [
          { text: 'Point, Aim, Squeeze, Sweep', isCorrect: false },
          { text: 'Pull, Aim, Squeeze, Sweep', isCorrect: true },
          { text: 'Push, Aim, Squeeze, Stop', isCorrect: false },
          { text: 'Pull, Alert, Squeeze, Sweep', isCorrect: false }
        ],
        difficulty: 'medium',
        explanation: 'PASS stands for Pull the pin, Aim at the base, Squeeze the handle, Sweep side to side.',
        timeLimit: 40,
        points: 15
      },
      {
        question: 'How often should smoke detector batteries be changed?',
        options: [
          { text: 'Every 3 months', isCorrect: false },
          { text: 'Every 6 months', isCorrect: true },
          { text: 'Every year', isCorrect: false },
          { text: 'Every 2 years', isCorrect: false }
        ],
        difficulty: 'easy',
        explanation: 'Smoke detector batteries should be changed every 6 months for optimal safety.',
        timeLimit: 30,
        points: 10
      },
      {
        question: 'What is the correct way to exit a building during a fire?',
        options: [
          { text: 'Use the elevator for faster exit', isCorrect: false },
          { text: 'Stay low and use stairs', isCorrect: true },
          { text: 'Wait for help in your room', isCorrect: false },
          { text: 'Break windows to escape', isCorrect: false }
        ],
        difficulty: 'easy',
        explanation: 'Stay low to avoid smoke inhalation and use stairs as elevators may malfunction.',
        timeLimit: 35,
        points: 10
      },
      {
        question: 'What temperature can cause severe burns in just 2 seconds?',
        options: [
          { text: '120°F (49°C)', isCorrect: false },
          { text: '140°F (60°C)', isCorrect: false },
          { text: '160°F (71°C)', isCorrect: true },
          { text: '180°F (82°C)', isCorrect: false }
        ],
        difficulty: 'hard',
        explanation: 'At 160°F (71°C), water can cause severe burns in just 2 seconds.',
        timeLimit: 45,
        points: 20
      },
      {
        question: 'Which of the following materials is most fire-resistant?',
        options: [
          { text: 'Cotton', isCorrect: false },
          { text: 'Polyester', isCorrect: false },
          { text: 'Wool', isCorrect: true },
          { text: 'Nylon', isCorrect: false }
        ],
        difficulty: 'medium',
        explanation: 'Wool is naturally fire-resistant and will self-extinguish when the flame source is removed.',
        timeLimit: 40,
        points: 15
      },
      {
        question: 'What should you do if your clothes catch fire?',
        options: [
          { text: 'Run to get help', isCorrect: false },
          { text: 'Pour water on yourself', isCorrect: false },
          { text: 'Stop, drop, and roll', isCorrect: true },
          { text: 'Try to remove the clothes', isCorrect: false }
        ],
        difficulty: 'easy',
        explanation: 'Stop, drop, and roll helps smother the flames by cutting off oxygen.',
        timeLimit: 30,
        points: 10
      },
      {
        question: 'How long do you typically have to escape during a house fire?',
        options: [
          { text: '1-2 minutes', isCorrect: true },
          { text: '5-10 minutes', isCorrect: false },
          { text: '10-15 minutes', isCorrect: false },
          { text: '20-30 minutes', isCorrect: false }
        ],
        difficulty: 'hard',
        explanation: 'House fires spread incredibly fast, giving you only 1-2 minutes to escape safely.',
        timeLimit: 45,
        points: 20
      },
      {
        question: 'What is the leading cause of home fire deaths?',
        options: [
          { text: 'Burns from flames', isCorrect: false },
          { text: 'Smoke inhalation', isCorrect: true },
          { text: 'Building collapse', isCorrect: false },
          { text: 'Electrical shock', isCorrect: false }
        ],
        difficulty: 'medium',
        explanation: 'Most fire deaths are caused by smoke inhalation rather than burns from flames.',
        timeLimit: 40,
        points: 15
      }
    ],
    settings: {
      timeLimit: 1800, // 30 minutes
      passingScore: 70,
      maxAttempts: 3,
      randomizeQuestions: false,
      randomizeOptions: false,
      showCorrectAnswers: true,
      allowRetake: true,
      retakeDelay: 0
    },
    status: 'published',
    createdBy: 'system'
  };
  
  try {
    console.log('Creating quiz with 10 questions...');
    const newQuiz = new Quiz(quizData);
    const savedQuiz = await newQuiz.save();
    
    console.log('✅ Quiz created successfully!');
    console.log(`Quiz ID: ${savedQuiz._id}`);
    console.log(`Quiz Title: ${savedQuiz.title}`);
    console.log(`Number of Questions: ${savedQuiz.questions.length}`);
    console.log(`Total Points: ${savedQuiz.getTotalPoints()}`);
    console.log(`Status: ${savedQuiz.status}`);
    
    // Verify the quiz by fetching it back
    const fetchedQuiz = await Quiz.findById(savedQuiz._id);
    console.log(`\n📊 Verification - Fetched quiz has ${fetchedQuiz.questions.length} questions`);
    
    fetchedQuiz.questions.forEach((q, index) => {
      console.log(`Q${index + 1}: ${q.question.substring(0, 50)}... (${q.options.length} options)`);
    });
    
  } catch (error) {
    console.error('❌ Error creating quiz:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
  }
  
  mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');
  
}).catch(err => {
  console.error('❌ Database connection error:', err.message);
  process.exit(1);
});