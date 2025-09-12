const mongoose = require('mongoose');
require('dotenv').config();
require('./models');
const Quiz = require('./models/Quiz');
const Module = require('./models/Module');

async function createEarthquakeQuizSpecific() {
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
        
        // Delete any existing earthquake quiz for this module to avoid duplicates
        const existingQuiz = await Quiz.findOne({ 
            title: "Earthquake Preparedness",
            moduleId: moduleId 
        });
        
        if (existingQuiz) {
            console.log('🗑️ Removing existing Earthquake Preparedness quiz...');
            await Quiz.findByIdAndDelete(existingQuiz._id);
        }
        
        // Transform the quiz data to match the backend schema
        const quizData = {
            title: "Earthquake Preparedness",
            description: "Understand earthquake safety measures and emergency response during seismic events.",
            moduleId: new mongoose.Types.ObjectId(moduleId), // Ensure proper ObjectId format
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
                    explanation: "Drop, Cover, and Hold is the internationally recommended response during earthquakes as per NDMA guidelines.",
                    timeLimit: 60, // 1 minute in seconds
                    points: 1,
                    hints: [{ text: "Follow NDMA guidelines.", penalty: 0.1 }]
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
                    explanation: "Windows can shatter during earthquakes and heavy objects can fall, causing serious injuries.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Windows can shatter.", penalty: 0.1 }]
                },
                {
                    question: "Which area in India is most prone to earthquakes?",
                    options: [
                        { text: "Himalayan region", isCorrect: true },
                        { text: "Thar Desert", isCorrect: false },
                        { text: "Kerala coast", isCorrect: false },
                        { text: "Rajasthan plains", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "The Himalayan region is in a high seismic zone due to the collision of Indian and Eurasian tectonic plates.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "High seismic zone.", penalty: 0.1 }]
                },
                {
                    question: "During an earthquake, it is safer to:",
                    options: [
                        { text: "Stand under a table", isCorrect: false },
                        { text: "Stand in open ground", isCorrect: true },
                        { text: "Sit near a window", isCorrect: false },
                        { text: "Run upstairs", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Open ground is safest as there are no falling objects or debris that could cause harm.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Avoid falling debris.", penalty: 0.1 }]
                },
                {
                    question: "What is a safe place indoors during an earthquake?",
                    options: [
                        { text: "Near shelves", isCorrect: false },
                        { text: "Under sturdy furniture", isCorrect: true },
                        { text: "Near hanging lights", isCorrect: false },
                        { text: "In a crowded corridor", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Sturdy furniture like heavy desks or tables can protect your head and body from falling debris.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Protects head and body.", penalty: 0.1 }]
                },
                {
                    question: "What should you do after shaking stops?",
                    options: [
                        { text: "Resume class immediately", isCorrect: false },
                        { text: "Evacuate safely if needed", isCorrect: true },
                        { text: "Turn on electrical appliances", isCorrect: false },
                        { text: "Jump from building", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "After shaking stops, assess safety and evacuate if the building is damaged or unsafe.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Check safety first.", penalty: 0.15 }]
                },
                {
                    question: "What is the first step in earthquake preparedness?",
                    options: [
                        { text: "Prepare emergency kit", isCorrect: true },
                        { text: "Start running outside", isCorrect: false },
                        { text: "Ignore minor tremors", isCorrect: false },
                        { text: "Play in open ground", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "Having an emergency kit with essential supplies ready is the foundation of earthquake preparedness.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Essential supplies.", penalty: 0.15 }]
                },
                {
                    question: "After an earthquake, what should you check first?",
                    options: [
                        { text: "Water and electricity lines", isCorrect: true },
                        { text: "Social media", isCorrect: false },
                        { text: "Homework", isCorrect: false },
                        { text: "Toys", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "Checking utilities first helps prevent further accidents like fires, floods, or electrical hazards.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Prevent further accidents.", penalty: 0.15 }]
                },
                {
                    question: "Why is it dangerous to stand near bookshelves or heavy furniture during an earthquake?",
                    options: [
                        { text: "They can topple and injure you", isCorrect: true },
                        { text: "They block your view", isCorrect: false },
                        { text: "They are dusty", isCorrect: false },
                        { text: "Nothing happens", isCorrect: false }
                    ],
                    difficulty: "hard",
                    explanation: "Heavy furniture and bookshelves can become unstable during earthquakes and fall, causing serious injuries.",
                    timeLimit: 60,
                    points: 3,
                    hints: [{ text: "Falling objects are dangerous.", penalty: 0.2 }]
                },
                {
                    question: "During a major earthquake, why should people avoid using elevators?",
                    options: [
                        { text: "They can get stuck or malfunction", isCorrect: true },
                        { text: "They move too slowly", isCorrect: false },
                        { text: "They are crowded", isCorrect: false },
                        { text: "They are expensive to maintain", isCorrect: false }
                    ],
                    difficulty: "hard",
                    explanation: "Elevators can lose power, get stuck between floors, or malfunction during earthquakes, trapping people inside.",
                    timeLimit: 60,
                    points: 3,
                    hints: [{ text: "Elevators may fail in tremors.", penalty: 0.2 }]
                }
            ],
            settings: {
                timeLimit: 15, // Total 15 minutes for 10 questions (1.5 min per question on average)
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
        
        console.log('\n🎯 Earthquake Preparedness Quiz Created Successfully!');
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

createEarthquakeQuizSpecific();