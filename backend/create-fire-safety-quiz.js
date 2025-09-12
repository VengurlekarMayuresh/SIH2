const mongoose = require('mongoose');
require('dotenv').config();
require('./models');
const Quiz = require('./models/Quiz');
const Module = require('./models/Module');

async function createFireSafetyQuiz() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safeed');
        console.log('🔗 Connected to database');
        
        // Use the specific module ID provided
        const moduleId = '68c04c0b41825d403c5d7dbe';
        
        // Verify the module exists
        const module = await Module.findById(moduleId);
        if (!module) {
            console.error(`❌ Module with ID ${moduleId} not found!`);
            mongoose.disconnect();
            return;
        }
        
        console.log(`✅ Using module: ${module.title} (ID: ${moduleId})`);
        
        // Delete any existing fire safety quiz for this module to avoid duplicates
        const existingQuiz = await Quiz.findOne({ 
            title: "Fire Safety and Prevention",
            moduleId: moduleId 
        });
        
        if (existingQuiz) {
            console.log('🗑️ Removing existing Fire Safety quiz...');
            await Quiz.findByIdAndDelete(existingQuiz._id);
        }
        
        // Transform the quiz data to match the backend schema
        const quizData = {
            title: "Fire Safety and Prevention",
            description: "Master essential fire safety protocols, evacuation procedures, and emergency response techniques for fire accidents and prevention.",
            moduleId: new mongoose.Types.ObjectId(moduleId), // Ensure proper ObjectId format
            questions: [
                {
                    question: "What should you do first during a fire?",
                    options: [
                        { text: "Raise alarm", isCorrect: true },
                        { text: "Hide under desk", isCorrect: false },
                        { text: "Use water on electrical fire", isCorrect: false },
                        { text: "Ignore it", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Raising the alarm immediately alerts others to the danger and starts the emergency response process, which is crucial for everyone's safety.",
                    timeLimit: 60, // 1 minute in seconds
                    points: 1,
                    hints: [{ text: "Alert others immediately.", penalty: 0.1 }]
                },
                {
                    question: "Which method is used to escape fire safely?",
                    options: [
                        { text: "Safe exit via stairs", isCorrect: true },
                        { text: "Use elevator", isCorrect: false },
                        { text: "Jump from window", isCorrect: false },
                        { text: "Run randomly", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Using stairs for safe exit is the recommended evacuation method as elevators can malfunction during fires and become deadly traps.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Elevators are dangerous.", penalty: 0.1 }]
                },
                {
                    question: "What is 'Stop, Drop, Roll' used for?",
                    options: [
                        { text: "If clothes catch fire", isCorrect: true },
                        { text: "During earthquake", isCorrect: false },
                        { text: "During flood", isCorrect: false },
                        { text: "During cyclone", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Stop, Drop, and Roll is the technique to extinguish flames on your clothes by stopping movement, dropping to the ground, and rolling to smother the fire.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Extinguish fire on body.", penalty: 0.1 }]
                },
                {
                    question: "In schools, fire drills are conducted to:",
                    options: [
                        { text: "Practice safe evacuation", isCorrect: true },
                        { text: "Play games", isCorrect: false },
                        { text: "Test fire alarms only", isCorrect: false },
                        { text: "Decorate building", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Fire drills in schools are essential practice sessions that prepare students and staff for safe, orderly evacuation during actual fire emergencies.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Prepare students.", penalty: 0.1 }]
                },
                {
                    question: "Where should you not go during a fire?",
                    options: [
                        { text: "Near fire or smoke", isCorrect: true },
                        { text: "Safe exit", isCorrect: false },
                        { text: "Evacuation area", isCorrect: false },
                        { text: "Open space", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Never go near fire or smoke as smoke inhalation is extremely dangerous and can cause unconsciousness or death within minutes.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Smoke inhalation is dangerous.", penalty: 0.1 }]
                },
                {
                    question: "Which fire extinguisher should be used on electrical fires?",
                    options: [
                        { text: "CO2 extinguisher", isCorrect: true },
                        { text: "Water extinguisher", isCorrect: false },
                        { text: "Foam extinguisher", isCorrect: false },
                        { text: "Sand", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "CO2 extinguishers are safe for electrical fires because CO2 is non-conductive and won't cause electrical shock, unlike water-based extinguishers.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Non-conductive.", penalty: 0.15 }]
                },
                {
                    question: "How should you move during a fire in a smoke-filled area?",
                    options: [
                        { text: "Crawl low to the ground", isCorrect: true },
                        { text: "Stand upright", isCorrect: false },
                        { text: "Jump", isCorrect: false },
                        { text: "Run blindly", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "Crawling low to the ground keeps you below the smoke layer where cleaner air is available, as smoke and toxic gases rise upward.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Smoke rises, stay low.", penalty: 0.15 }]
                },
                {
                    question: "What should be checked regularly to prevent fire?",
                    options: [
                        { text: "Electrical wiring and appliances", isCorrect: true },
                        { text: "Food menu", isCorrect: false },
                        { text: "School timetable", isCorrect: false },
                        { text: "Sports schedule", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "Regular inspection of electrical wiring and appliances helps prevent electrical fires, which are one of the leading causes of fire accidents.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Prevent accidents.", penalty: 0.15 }]
                },
                {
                    question: "Why should you never use elevators during a fire?",
                    options: [
                        { text: "They may trap you", isCorrect: true },
                        { text: "They move too slowly", isCorrect: false },
                        { text: "They are crowded", isCorrect: false },
                        { text: "They are expensive", isCorrect: false }
                    ],
                    difficulty: "hard",
                    explanation: "Elevators can malfunction during fires due to power failure, heat damage, or smoke detection systems, potentially trapping people inside with no escape route.",
                    timeLimit: 60,
                    points: 3,
                    hints: [{ text: "Elevators can fail.", penalty: 0.2 }]
                },
                {
                    question: "Why is it important to stay calm during a fire?",
                    options: [
                        { text: "It helps evacuate safely", isCorrect: true },
                        { text: "You look brave", isCorrect: false },
                        { text: "It entertains others", isCorrect: false },
                        { text: "It saves furniture", isCorrect: false }
                    ],
                    difficulty: "hard",
                    explanation: "Staying calm during a fire enables clear thinking and rational decision-making, which is essential for safe evacuation and helping others escape danger.",
                    timeLimit: 60,
                    points: 3,
                    hints: [{ text: "Panic leads to accidents.", penalty: 0.2 }]
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
        
        console.log('\n🔥 Fire Safety and Prevention Quiz Created Successfully!');
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

createFireSafetyQuiz();