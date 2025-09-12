const mongoose = require('mongoose');
require('dotenv').config();
require('./models');
const Quiz = require('./models/Quiz');
const Module = require('./models/Module');

async function createFloodQuiz() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safeed');
        console.log('🔗 Connected to database');
        
        // Use the specific module ID provided
        const moduleId = '68c0873663edbe8c292578b0';
        
        // Verify the module exists
        const module = await Module.findById(moduleId);
        if (!module) {
            console.error(`❌ Module with ID ${moduleId} not found!`);
            mongoose.disconnect();
            return;
        }
        
        console.log(`✅ Using module: ${module.title} (ID: ${moduleId})`);
        
        // Delete any existing flood quiz for this module to avoid duplicates
        const existingQuiz = await Quiz.findOne({ 
            title: "Flood Preparedness",
            moduleId: moduleId 
        });
        
        if (existingQuiz) {
            console.log('🗑️ Removing existing Flood Preparedness quiz...');
            await Quiz.findByIdAndDelete(existingQuiz._id);
        }
        
        // Transform the quiz data to match the backend schema
        const quizData = {
            title: "Flood Preparedness",
            description: "Learn essential flood safety measures, evacuation procedures, and emergency response during flood situations.",
            moduleId: new mongoose.Types.ObjectId(moduleId), // Ensure proper ObjectId format
            questions: [
                {
                    question: "What should you do during a flood?",
                    options: [
                        { text: "Move to higher ground", isCorrect: true },
                        { text: "Play in water", isCorrect: false },
                        { text: "Walk through deep water", isCorrect: false },
                        { text: "Stay near electrical lines", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Moving to higher ground is the safest action during floods as it protects you from rising water levels.",
                    timeLimit: 60, // 1 minute in seconds
                    points: 1,
                    hints: [{ text: "Avoid rising water.", penalty: 0.1 }]
                },
                {
                    question: "Which items should you avoid during a flood?",
                    options: [
                        { text: "Water and food", isCorrect: false },
                        { text: "Electrical wires and outlets", isCorrect: true },
                        { text: "Life jackets", isCorrect: false },
                        { text: "Boats", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Electrical wires and outlets are extremely dangerous during floods as they can cause fatal electrical shocks when in contact with water.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Electricity and water are dangerous.", penalty: 0.1 }]
                },
                {
                    question: "Which season in India is flood-prone?",
                    options: [
                        { text: "Monsoon", isCorrect: true },
                        { text: "Winter", isCorrect: false },
                        { text: "Summer", isCorrect: false },
                        { text: "Spring", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Monsoon season brings heavy rainfall across India, leading to increased flood risks in many regions.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Heavy rains occur then.", penalty: 0.1 }]
                },
                {
                    question: "During a flood, how should you evacuate?",
                    options: [
                        { text: "Use boats or safe routes", isCorrect: true },
                        { text: "Walk through deep water", isCorrect: false },
                        { text: "Drive through flooded roads", isCorrect: false },
                        { text: "Climb trees immediately", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Using boats or following designated safe evacuation routes ensures your safety during flood evacuation.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Follow safe paths.", penalty: 0.1 }]
                },
                {
                    question: "After a flood, it is important to:",
                    options: [
                        { text: "Drink only safe water", isCorrect: true },
                        { text: "Eat anything found", isCorrect: false },
                        { text: "Enter damaged buildings", isCorrect: false },
                        { text: "Use electricity immediately", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Drinking only safe, treated water after floods prevents waterborne diseases caused by contaminated water sources.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Avoid waterborne diseases.", penalty: 0.1 }]
                },
                {
                    question: "What is the first step in flood preparedness?",
                    options: [
                        { text: "Stock emergency kit", isCorrect: true },
                        { text: "Swim in rivers", isCorrect: false },
                        { text: "Ignore warnings", isCorrect: false },
                        { text: "Build sandcastles", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "Stocking an emergency kit with essential supplies is the foundation of flood preparedness planning.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Prepare essentials.", penalty: 0.15 }]
                },
                {
                    question: "During floods, what should be avoided?",
                    options: [
                        { text: "Staying indoors", isCorrect: false },
                        { text: "Using electrical appliances", isCorrect: true },
                        { text: "Following evacuation instructions", isCorrect: false },
                        { text: "Helping neighbors", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "Using electrical appliances during floods poses serious risk of electrical shock and should be avoided.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Electrical shock risk.", penalty: 0.15 }]
                },
                {
                    question: "Which Indian states are highly affected by floods?",
                    options: [
                        { text: "Assam, Bihar, Kerala", isCorrect: true },
                        { text: "Rajasthan, Gujarat, Haryana", isCorrect: false },
                        { text: "Punjab, Himachal", isCorrect: false },
                        { text: "Tamil Nadu, Karnataka, Goa", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "Assam, Bihar, and Kerala are low-lying, riverine states that experience frequent flooding due to heavy monsoons and river overflows.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Low-lying, riverine states.", penalty: 0.15 }]
                },
                {
                    question: "Why should you avoid swimming in floodwater?",
                    options: [
                        { text: "It may contain debris or pathogens", isCorrect: true },
                        { text: "It's boring", isCorrect: false },
                        { text: "It helps you exercise", isCorrect: false },
                        { text: "It's fun", isCorrect: false }
                    ],
                    difficulty: "hard",
                    explanation: "Floodwater is highly contaminated with debris, sewage, chemicals, and disease-causing pathogens that can cause serious infections.",
                    timeLimit: 60,
                    points: 3,
                    hints: [{ text: "Water is contaminated.", penalty: 0.2 }]
                },
                {
                    question: "Why is moving to higher ground important during a flood?",
                    options: [
                        { text: "Avoids fast-rising water", isCorrect: true },
                        { text: "Better view", isCorrect: false },
                        { text: "Good for photos", isCorrect: false },
                        { text: "To exercise", isCorrect: false }
                    ],
                    difficulty: "hard",
                    explanation: "Moving to higher ground prevents drowning by avoiding fast-rising floodwater that can quickly become life-threatening.",
                    timeLimit: 60,
                    points: 3,
                    hints: [{ text: "Prevents drowning.", penalty: 0.2 }]
                }
            ],
            settings: {
                timeLimit: 15, // Total 15 minutes for 10 questions
                passingScore: 70,
                maxAttempts: 3,
                randomizeQuestions: false,
                randomizeOptions: true,
                showCorrectAnswers: true,
                allowRetake: true,
                retakeDelay: 0
            },
            status: "published" // Ready to use
        };
        
        // Create the quiz
        const newQuiz = new Quiz(quizData);
        await newQuiz.save();
        
        console.log('\n🌊 Flood Preparedness Quiz Created Successfully!');
        console.log(`📝 Quiz ID: ${newQuiz._id}`);
        console.log(`📚 Module: ${module.title} (${moduleId})`);
        console.log(`❓ Questions: ${newQuiz.questions.length}`);
        console.log(`⏱️  Total Time: ${newQuiz.settings.timeLimit} minutes`);
        console.log(`🎯 Passing Score: ${newQuiz.settings.passingScore}%`);
        console.log(`📊 Total Points: ${newQuiz.getTotalPoints()}`);
        console.log(`🔖 Status: ${newQuiz.status}`);
        
        console.log('\n📋 Quiz Details:');
        console.log(`Title: ${newQuiz.title}`);
        console.log(`Description: ${newQuiz.description}`);
        
        console.log('\n❓ Questions Summary:');
        newQuiz.questions.forEach((q, index) => {
            const correctAnswer = q.options.find(opt => opt.isCorrect);
            console.log(`${index + 1}. ${q.question}`);
            console.log(`   ✅ Answer: ${correctAnswer.text}`);
            console.log(`   📊 Difficulty: ${q.difficulty} (${q.points} points)`);
            console.log(`   💡 Hint: ${q.hints[0]?.text}`);
            console.log('');
        });
        
        console.log('🚀 Quiz is now ready for students to take!');
        console.log(`📱 API Endpoint: GET /api/quizzes/${newQuiz._id}`);
        console.log(`🔗 Module Reference: ${moduleId}`);
        
        // Verify the quiz was created with correct module reference
        const createdQuiz = await Quiz.findById(newQuiz._id).populate('moduleId', 'title');
        console.log(`\n✅ Verification: Quiz linked to module "${createdQuiz.moduleId.title}"`);
        
        mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error creating quiz:', error.message);
        console.error('Full error:', error);
        mongoose.disconnect();
    }
}

createFloodQuiz();