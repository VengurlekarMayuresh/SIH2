const mongoose = require('mongoose');
require('dotenv').config();
require('./models');
const Quiz = require('./models/Quiz');
const Module = require('./models/Module');

async function createPandemicQuiz() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safeed');
        console.log('🔗 Connected to database');
        
        // Use the specific module ID provided
        const moduleId = '68c0873663edbe8c292578ca';
        
        // Verify the module exists
        const module = await Module.findById(moduleId);
        if (!module) {
            console.error(`❌ Module with ID ${moduleId} not found!`);
            mongoose.disconnect();
            return;
        }
        
        console.log(`✅ Using module: ${module.title} (ID: ${moduleId})`);
        
        // Delete any existing pandemic quiz for this module to avoid duplicates
        const existingQuiz = await Quiz.findOne({ 
            title: "Pandemic and Epidemic Preparedness",
            moduleId: moduleId 
        });
        
        if (existingQuiz) {
            console.log('🗑️ Removing existing Pandemic/Epidemic quiz...');
            await Quiz.findByIdAndDelete(existingQuiz._id);
        }
        
        // Transform the quiz data to match the backend schema
        const quizData = {
            title: "Pandemic and Epidemic Preparedness",
            description: "Learn essential knowledge about pandemic prevention, health safety measures, and emergency response during infectious disease outbreaks.",
            moduleId: new mongoose.Types.ObjectId(moduleId), // Ensure proper ObjectId format
            questions: [
                {
                    question: "Which of the following is an epidemic that affected India in 2020?",
                    options: [
                        { text: "COVID-19", isCorrect: true },
                        { text: "Dengue", isCorrect: false },
                        { text: "Typhoon", isCorrect: false },
                        { text: "Earthquake", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "COVID-19, caused by the SARS-CoV-2 virus, was declared a pandemic by WHO in March 2020 and significantly impacted India and the world.",
                    timeLimit: 60, // 1 minute in seconds
                    points: 1,
                    hints: [{ text: "A respiratory disease caused by a new virus.", penalty: 0.1 }]
                },
                {
                    question: "What is a key method to prevent the spread of infectious diseases?",
                    options: [
                        { text: "Vaccination", isCorrect: true },
                        { text: "Watching TV", isCorrect: false },
                        { text: "Traveling", isCorrect: false },
                        { text: "Ignoring symptoms", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Vaccination helps the body build immunity against specific pathogens, providing protection and reducing disease transmission in communities.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Helps the body build immunity.", penalty: 0.1 }]
                },
                {
                    question: "Which hygiene practice is important during a pandemic?",
                    options: [
                        { text: "Handwashing", isCorrect: true },
                        { text: "Skipping meals", isCorrect: false },
                        { text: "Sleeping less", isCorrect: false },
                        { text: "Running outdoors", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Regular handwashing with soap and water for at least 20 seconds effectively removes germs and viruses, preventing transmission.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Removes germs from hands.", penalty: 0.1 }]
                },
                {
                    question: "During an epidemic, what is advised if you have symptoms?",
                    options: [
                        { text: "Isolate yourself", isCorrect: true },
                        { text: "Go to crowded places", isCorrect: false },
                        { text: "Ignore it", isCorrect: false },
                        { text: "Exercise in group", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Self-isolation when experiencing symptoms prevents spreading the disease to others and allows for proper medical consultation and treatment.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Prevents spreading disease to others.", penalty: 0.1 }]
                },
                {
                    question: "Social distancing helps by:",
                    options: [
                        { text: "Reducing contact", isCorrect: true },
                        { text: "Increasing social media usage", isCorrect: false },
                        { text: "Encouraging crowding", isCorrect: false },
                        { text: "Boosting parties", isCorrect: false }
                    ],
                    difficulty: "easy",
                    explanation: "Social distancing reduces physical contact between people, limiting the transmission of infectious diseases through respiratory droplets and close contact.",
                    timeLimit: 60,
                    points: 1,
                    hints: [{ text: "Keeps people safe from transmission.", penalty: 0.1 }]
                },
                {
                    question: "Mask usage is important because:",
                    options: [
                        { text: "It reduces inhalation of virus droplets", isCorrect: true },
                        { text: "It is fashionable", isCorrect: false },
                        { text: "It helps sleep", isCorrect: false },
                        { text: "It increases oxygen intake", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "Masks act as a barrier that filters respiratory droplets containing viruses, protecting both the wearer and others from infection transmission.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Protects your nose and mouth.", penalty: 0.15 }]
                },
                {
                    question: "Quarantine period usually lasts:",
                    options: [
                        { text: "10–14 days", isCorrect: true },
                        { text: "1 day", isCorrect: false },
                        { text: "6 months", isCorrect: false },
                        { text: "1 hour", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "The 10-14 day quarantine period covers the typical incubation period of most viruses, ensuring infected individuals don't spread the disease during the contagious phase.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Covers incubation period of most viruses.", penalty: 0.15 }]
                },
                {
                    question: "Contact tracing helps in a pandemic by:",
                    options: [
                        { text: "Identifying infected people and their contacts", isCorrect: true },
                        { text: "Cooking meals", isCorrect: false },
                        { text: "Watching movies", isCorrect: false },
                        { text: "Improving fitness", isCorrect: false }
                    ],
                    difficulty: "medium",
                    explanation: "Contact tracing identifies and monitors people who may have been exposed to infected individuals, helping to break transmission chains and control outbreaks.",
                    timeLimit: 60,
                    points: 2,
                    hints: [{ text: "Stops further transmission.", penalty: 0.15 }]
                },
                {
                    question: "Why should antibiotics not be used for viral pandemics?",
                    options: [
                        { text: "They do not kill viruses", isCorrect: true },
                        { text: "They are expensive", isCorrect: false },
                        { text: "They cure viruses faster", isCorrect: false },
                        { text: "They are addictive", isCorrect: false }
                    ],
                    difficulty: "hard",
                    explanation: "Antibiotics are designed to kill bacteria, not viruses. Using them inappropriately can lead to antibiotic resistance and doesn't treat viral infections like COVID-19.",
                    timeLimit: 60,
                    points: 3,
                    hints: [{ text: "Antibiotics only work on bacteria.", penalty: 0.2 }]
                },
                {
                    question: "Which factor increases pandemic severity?",
                    options: [
                        { text: "High population density", isCorrect: true },
                        { text: "Low humidity alone", isCorrect: false },
                        { text: "Wearing masks", isCorrect: false },
                        { text: "Proper hygiene", isCorrect: false }
                    ],
                    difficulty: "hard",
                    explanation: "High population density increases pandemic severity because crowded areas facilitate faster virus transmission through increased person-to-person contact and shared spaces.",
                    timeLimit: 60,
                    points: 3,
                    hints: [{ text: "Crowded areas allow faster virus spread.", penalty: 0.2 }]
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
        
        console.log('\n🦠 Pandemic and Epidemic Preparedness Quiz Created Successfully!');
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

createPandemicQuiz();