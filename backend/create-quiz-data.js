const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Quiz = require('./models/Quiz');

const createQuizData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Create test modules
        const modules = [
            {
                title: 'Earthquake Safety',
                description: 'Learn about earthquake preparedness, during-event safety, and post-disaster recovery.',
                thumbnail: '/images/earthquake-thumb.jpg',
                chapters: [
                    {
                        title: 'Understanding Earthquakes',
                        contents: [
                            {
                                type: 'text',
                                body: 'Earthquakes are sudden movements of the Earth\'s crust that can cause severe damage and loss of life.'
                            }
                        ]
                    },
                    {
                        title: 'Earthquake Preparedness',
                        contents: [
                            {
                                type: 'text',
                                body: 'Preparation is key to surviving earthquakes. Create an emergency kit and plan escape routes.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Flood Safety',
                description: 'Understanding flood risks, prevention measures, and emergency response procedures.',
                thumbnail: '/images/flood-thumb.jpg',
                chapters: [
                    {
                        title: 'Flood Types and Causes',
                        contents: [
                            {
                                type: 'text',
                                body: 'Floods can be caused by heavy rainfall, dam failures, or storm surges from hurricanes.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Fire Safety',
                description: 'Fire prevention, detection systems, and evacuation procedures for home and workplace safety.',
                thumbnail: '/images/fire-thumb.jpg',
                chapters: [
                    {
                        title: 'Fire Prevention',
                        contents: [
                            {
                                type: 'text',
                                body: 'Most fires can be prevented by maintaining electrical systems and safe storage of flammable materials.'
                            }
                        ]
                    }
                ]
            }
        ];

        console.log('📚 Creating modules...');
        const createdModules = [];
        for (const moduleData of modules) {
            const existingModule = await Module.findOne({ title: moduleData.title });
            if (!existingModule) {
                const module = new Module(moduleData);
                await module.save();
                createdModules.push(module);
                console.log(`✅ Created module: ${module.title}`);
            } else {
                createdModules.push(existingModule);
                console.log(`📖 Module already exists: ${existingModule.title}`);
            }
        }

        // Create test quizzes
        const quizzes = [
            {
                title: 'Earthquake Basics Quiz',
                description: 'Test your knowledge about earthquake fundamentals and safety measures.',
                moduleId: createdModules[0]._id,
                difficulty: 'easy',
                status: 'published',
                questions: [
                    {
                        question: 'What should you do immediately when you feel an earthquake?',
                        options: [
                            { text: 'Run outside immediately', isCorrect: false },
                            { text: 'Drop, Cover, and Hold On', isCorrect: true },
                            { text: 'Stand in a doorway', isCorrect: false },
                            { text: 'Hide under a bed', isCorrect: false }
                        ],
                        explanation: 'The safest immediate response is to Drop to hands and knees, take Cover under a desk or table, and Hold On until shaking stops.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Which of these items should be in your earthquake emergency kit?',
                        options: [
                            { text: 'Water for 3 days (1 gallon per person per day)', isCorrect: true },
                            { text: 'Candles for lighting', isCorrect: false },
                            { text: 'Glass containers for storage', isCorrect: false },
                            { text: 'Heavy furniture', isCorrect: false }
                        ],
                        explanation: 'Water is essential - store at least 1 gallon per person per day for 3 days. Avoid candles (fire hazard) and glass containers.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'After an earthquake stops, what should you do first?',
                        options: [
                            { text: 'Check for injuries and hazards', isCorrect: true },
                            { text: 'Turn on all lights', isCorrect: false },
                            { text: 'Use elevators to evacuate', isCorrect: false },
                            { text: 'Move heavy furniture', isCorrect: false }
                        ],
                        explanation: 'First priority is checking for injuries and immediate hazards like gas leaks or structural damage.',
                        difficulty: 'medium',
                        points: 3
                    }
                ],
                settings: {
                    timeLimit: 10,
                    passingScore: 70,
                    maxAttempts: 3,
                    randomizeQuestions: false,
                    showCorrectAnswers: true
                }
            },
            {
                title: 'Advanced Earthquake Preparedness',
                description: 'Advanced topics in earthquake preparedness and response strategies.',
                moduleId: createdModules[0]._id,
                difficulty: 'hard',
                status: 'published',
                questions: [
                    {
                        question: 'What is the recommended way to secure heavy furniture to prevent earthquake damage?',
                        options: [
                            { text: 'Use duct tape to attach to walls', isCorrect: false },
                            { text: 'Bolt or strap furniture to wall studs', isCorrect: true },
                            { text: 'Place heavy items on top', isCorrect: false },
                            { text: 'Move furniture to center of room', isCorrect: false }
                        ],
                        explanation: 'Heavy furniture should be bolted or strapped to wall studs to prevent tipping during shaking.',
                        difficulty: 'hard',
                        points: 4
                    },
                    {
                        question: 'Which magnitude earthquake is typically the threshold for significant structural damage?',
                        options: [
                            { text: 'Magnitude 3.0', isCorrect: false },
                            { text: 'Magnitude 5.0', isCorrect: false },
                            { text: 'Magnitude 6.0', isCorrect: true },
                            { text: 'Magnitude 8.0', isCorrect: false }
                        ],
                        explanation: 'Magnitude 6.0+ earthquakes can cause significant structural damage, especially in vulnerable buildings.',
                        difficulty: 'hard',
                        points: 4
                    }
                ],
                settings: {
                    timeLimit: 15,
                    passingScore: 80,
                    maxAttempts: 2,
                    randomizeQuestions: true,
                    showCorrectAnswers: true
                }
            },
            {
                title: 'Flood Safety Essentials',
                description: 'Essential knowledge about flood preparedness and response.',
                moduleId: createdModules[1]._id,
                difficulty: 'medium',
                status: 'published',
                questions: [
                    {
                        question: 'How deep does moving water need to be to knock down an adult?',
                        options: [
                            { text: '2 feet', isCorrect: false },
                            { text: '1 foot', isCorrect: false },
                            { text: '6 inches', isCorrect: true },
                            { text: '3 inches', isCorrect: false }
                        ],
                        explanation: 'Just 6 inches of moving water can knock down an adult. Never attempt to walk through moving flood water.',
                        difficulty: 'medium',
                        points: 3
                    },
                    {
                        question: 'What should you do if your car gets caught in flood water?',
                        options: [
                            { text: 'Try to drive through quickly', isCorrect: false },
                            { text: 'Stay in the car and wait', isCorrect: false },
                            { text: 'Abandon the car and move to higher ground', isCorrect: true },
                            { text: 'Open all windows', isCorrect: false }
                        ],
                        explanation: 'If your car is caught in flood water, abandon it immediately and move to higher ground. Cars can be swept away by just 2 feet of water.',
                        difficulty: 'medium',
                        points: 3
                    }
                ],
                settings: {
                    timeLimit: 8,
                    passingScore: 75,
                    maxAttempts: 3,
                    randomizeQuestions: false,
                    showCorrectAnswers: true
                }
            },
            {
                title: 'Fire Safety Fundamentals',
                description: 'Basic fire safety principles and emergency procedures.',
                moduleId: createdModules[2]._id,
                difficulty: 'easy',
                status: 'published',
                questions: [
                    {
                        question: 'What does the acronym PASS stand for when using a fire extinguisher?',
                        options: [
                            { text: 'Point, Aim, Spray, Sweep', isCorrect: false },
                            { text: 'Pull, Aim, Squeeze, Sweep', isCorrect: true },
                            { text: 'Push, Activate, Spray, Stop', isCorrect: false },
                            { text: 'Prepare, Aim, Start, Stop', isCorrect: false }
                        ],
                        explanation: 'PASS stands for Pull the pin, Aim at the base, Squeeze the handle, Sweep side to side.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'How often should smoke detector batteries be changed?',
                        options: [
                            { text: 'Every 5 years', isCorrect: false },
                            { text: 'Every 2 years', isCorrect: false },
                            { text: 'Every year', isCorrect: true },
                            { text: 'Only when they beep', isCorrect: false }
                        ],
                        explanation: 'Smoke detector batteries should be changed at least once a year, preferably when daylight saving time changes.',
                        difficulty: 'easy',
                        points: 2
                    }
                ],
                settings: {
                    timeLimit: 5,
                    passingScore: 70,
                    maxAttempts: 5,
                    randomizeQuestions: false,
                    showCorrectAnswers: true
                }
            }
        ];

        console.log('\n🧩 Creating quizzes...');
        for (const quizData of quizzes) {
            const existingQuiz = await Quiz.findOne({ title: quizData.title });
            if (!existingQuiz) {
                const quiz = new Quiz(quizData);
                await quiz.save();
                console.log(`✅ Created quiz: ${quiz.title} (${quiz.questions.length} questions)`);
            } else {
                console.log(`🧩 Quiz already exists: ${existingQuiz.title}`);
            }
        }

        console.log('\n✨ Quiz data creation completed!');
        console.log('\n📊 Summary:');
        
        const totalModules = await Module.countDocuments();
        const totalQuizzes = await Quiz.countDocuments({ status: 'published' });
        
        console.log(`📚 Total Modules: ${totalModules}`);
        console.log(`🧩 Total Published Quizzes: ${totalQuizzes}`);
        
        console.log('\n🎯 Test the quizzes by logging in as a student and visiting /quiz');

    } catch (error) {
        console.error('❌ Error creating quiz data:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createQuizData();
