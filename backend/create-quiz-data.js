const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Quiz = require('./models/Quiz');

const createComprehensiveQuizData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Create comprehensive modules for all disaster types
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
                                body: 'Earthquakes are sudden movements of the Earth\'s crust that can cause severe damage and loss of life. India\'s Himalayan region is particularly vulnerable to seismic activity.'
                            }
                        ]
                    },
                    {
                        title: 'Earthquake Preparedness',
                        contents: [
                            {
                                type: 'text',
                                body: 'Follow the Drop, Cover, and Hold On protocol. Preparation is key to surviving earthquakes - create an emergency kit and plan escape routes.'
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
                                body: 'Floods can be caused by heavy rainfall, dam failures, or storm surges. Monsoon season brings significant flood risks to many Indian states.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Cyclone and Storm Safety',
                description: 'Cyclone preparedness and response strategies for coastal regions.',
                thumbnail: '/images/cyclone-thumb.jpg',
                chapters: [
                    {
                        title: 'Understanding Cyclones',
                        contents: [
                            {
                                type: 'text',
                                body: 'Cyclones primarily affect India\'s coastal regions, especially the eastern coast. They occur mainly from May to November.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Fire Safety',
                description: 'Fire prevention, detection systems, and evacuation procedures.',
                thumbnail: '/images/fire-thumb.jpg',
                chapters: [
                    {
                        title: 'Fire Prevention and Response',
                        contents: [
                            {
                                type: 'text',
                                body: 'Fire safety involves prevention, early detection, and proper evacuation. Remember: Stop, Drop, and Roll if clothes catch fire.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Crowd Safety and Stampede Prevention',
                description: 'Managing crowds and preventing stampede situations.',
                thumbnail: '/images/crowd-thumb.jpg',
                chapters: [
                    {
                        title: 'Crowd Management',
                        contents: [
                            {
                                type: 'text',
                                body: 'Stampedes can occur in crowded situations. Stay calm, protect vital organs, and move with the crowd flow.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Pandemic and Health Emergency Preparedness',
                description: 'Understanding pandemics, prevention, and response measures.',
                thumbnail: '/images/pandemic-thumb.jpg',
                chapters: [
                    {
                        title: 'Pandemic Response',
                        contents: [
                            {
                                type: 'text',
                                body: 'Pandemics like COVID-19 require hygiene practices, vaccination, social distancing, and isolation when symptomatic.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Cold Weather and Snow Safety',
                description: 'Dealing with cold waves, snow, and avalanche risks.',
                thumbnail: '/images/snow-thumb.jpg',
                chapters: [
                    {
                        title: 'Cold Weather Safety',
                        contents: [
                            {
                                type: 'text',
                                body: 'Cold waves affect northern India. Kashmir and Himalayan regions face snow and avalanche risks during winter months.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Road Safety',
                description: 'Preventing road accidents and emergency response.',
                thumbnail: '/images/road-thumb.jpg',
                chapters: [
                    {
                        title: 'Road Accident Prevention',
                        contents: [
                            {
                                type: 'text',
                                body: 'Road safety involves following traffic rules, wearing safety gear, and avoiding distractions while driving.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Landslide Safety',
                description: 'Understanding landslide risks and prevention in hilly areas.',
                thumbnail: '/images/landslide-thumb.jpg',
                chapters: [
                    {
                        title: 'Landslide Prevention',
                        contents: [
                            {
                                type: 'text',
                                body: 'Landslides occur on slopes, especially during monsoons. Warning signs include cracks in soil and rocks.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Lightning and Thunderstorm Safety',
                description: 'Protection from lightning strikes and thunderstorm hazards.',
                thumbnail: '/images/lightning-thumb.jpg',
                chapters: [
                    {
                        title: 'Lightning Safety',
                        contents: [
                            {
                                type: 'text',
                                body: 'Lightning strikes tall objects and open areas. Stay indoors during thunderstorms and avoid water bodies.'
                            }
                        ]
                    }
                ]
            }
        ];

        console.log('📚 Creating comprehensive modules...');
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

        // Create comprehensive quizzes for all disaster types
        const quizzes = [
            // Earthquake Quiz
            {
                title: 'Earthquake Safety Quiz',
                description: 'Test your knowledge about earthquake safety and preparedness.',
                moduleId: createdModules[0]._id,
                difficulty: 'medium',
                status: 'published',
                questions: [
                    {
                        question: 'What is the safest action during an earthquake?',
                        options: [
                            { text: 'Run outside immediately', isCorrect: false },
                            { text: 'Drop, Cover, Hold', isCorrect: true },
                            { text: 'Stand near a window', isCorrect: false },
                            { text: 'Climb a tree', isCorrect: false }
                        ],
                        explanation: 'Follow NDMA guidelines: Drop to hands and knees, take Cover under sturdy furniture, and Hold On.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Where should you avoid standing during an earthquake?',
                        options: [
                            { text: 'Under furniture', isCorrect: false },
                            { text: 'Near windows or heavy objects', isCorrect: true },
                            { text: 'In a doorway', isCorrect: false },
                            { text: 'On a carpet', isCorrect: false }
                        ],
                        explanation: 'Windows can shatter and heavy objects can fall during earthquakes.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Which area in India is most prone to earthquakes?',
                        options: [
                            { text: 'Himalayan region', isCorrect: true },
                            { text: 'Thar Desert', isCorrect: false },
                            { text: 'Kerala coast', isCorrect: false },
                            { text: 'Rajasthan plains', isCorrect: false }
                        ],
                        explanation: 'The Himalayan region is in a high seismic zone due to tectonic plate movement.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'What should you do after shaking stops?',
                        options: [
                            { text: 'Resume class immediately', isCorrect: false },
                            { text: 'Evacuate safely if needed', isCorrect: true },
                            { text: 'Turn on electrical appliances', isCorrect: false },
                            { text: 'Jump from building', isCorrect: false }
                        ],
                        explanation: 'Check safety first and evacuate only if the building is damaged or unsafe.',
                        difficulty: 'medium',
                        points: 3
                    },
                    {
                        question: 'Why is it dangerous to stand near bookshelves during an earthquake?',
                        options: [
                            { text: 'They can topple and injure you', isCorrect: true },
                            { text: 'They block your view', isCorrect: false },
                            { text: 'They are dusty', isCorrect: false },
                            { text: 'Nothing happens', isCorrect: false }
                        ],
                        explanation: 'Falling objects like bookshelves are a major cause of earthquake injuries.',
                        difficulty: 'hard',
                        points: 4
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
            // Flood Quiz
            {
                title: 'Flood Safety Quiz',
                description: 'Learn about flood preparedness and emergency response.',
                moduleId: createdModules[1]._id,
                difficulty: 'medium',
                status: 'published',
                questions: [
                    {
                        question: 'What should you do during a flood?',
                        options: [
                            { text: 'Move to higher ground', isCorrect: true },
                            { text: 'Play in water', isCorrect: false },
                            { text: 'Walk through deep water', isCorrect: false },
                            { text: 'Stay near electrical lines', isCorrect: false }
                        ],
                        explanation: 'Moving to higher ground keeps you safe from rising water levels.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Which season in India is flood-prone?',
                        options: [
                            { text: 'Monsoon', isCorrect: true },
                            { text: 'Winter', isCorrect: false },
                            { text: 'Summer', isCorrect: false },
                            { text: 'Spring', isCorrect: false }
                        ],
                        explanation: 'Heavy rains during monsoon season cause most floods in India.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Which Indian states are highly affected by floods?',
                        options: [
                            { text: 'Assam, Bihar, Kerala', isCorrect: true },
                            { text: 'Rajasthan, Gujarat, Haryana', isCorrect: false },
                            { text: 'Punjab, Himachal', isCorrect: false },
                            { text: 'Tamil Nadu, Karnataka, Goa', isCorrect: false }
                        ],
                        explanation: 'These are low-lying, riverine states that experience frequent flooding.',
                        difficulty: 'medium',
                        points: 3
                    },
                    {
                        question: 'Why should you avoid swimming in floodwater?',
                        options: [
                            { text: 'It may contain debris or pathogens', isCorrect: true },
                            { text: 'It\'s boring', isCorrect: false },
                            { text: 'It helps you exercise', isCorrect: false },
                            { text: 'It\'s fun', isCorrect: false }
                        ],
                        explanation: 'Floodwater is contaminated with sewage, chemicals, and dangerous debris.',
                        difficulty: 'hard',
                        points: 4
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
            // Cyclone Quiz
            {
                title: 'Cyclone and Storm Safety Quiz',
                description: 'Understanding cyclone preparedness and response.',
                moduleId: createdModules[2]._id,
                difficulty: 'medium',
                status: 'published',
                questions: [
                    {
                        question: 'Where do cyclones mostly hit in India?',
                        options: [
                            { text: 'Coastal regions', isCorrect: true },
                            { text: 'Deserts', isCorrect: false },
                            { text: 'Himalayas', isCorrect: false },
                            { text: 'Central plains', isCorrect: false }
                        ],
                        explanation: 'Tropical storms affect coastal areas where they form over warm ocean waters.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Cyclones in India commonly occur in which months?',
                        options: [
                            { text: 'May–November', isCorrect: true },
                            { text: 'December–February', isCorrect: false },
                            { text: 'March–April', isCorrect: false },
                            { text: 'All year equally', isCorrect: false }
                        ],
                        explanation: 'Pre-monsoon and monsoon months have favorable conditions for cyclone formation.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Cyclone warnings are issued by:',
                        options: [
                            { text: 'IMD', isCorrect: true },
                            { text: 'NDMA', isCorrect: false },
                            { text: 'ISRO', isCorrect: false },
                            { text: 'NASA', isCorrect: false }
                        ],
                        explanation: 'India Meteorological Department (IMD) is responsible for weather warnings.',
                        difficulty: 'medium',
                        points: 3
                    },
                    {
                        question: 'Why should you avoid taking shelter under trees during a cyclone?',
                        options: [
                            { text: 'Trees can fall or break branches', isCorrect: true },
                            { text: 'Trees are shady', isCorrect: false },
                            { text: 'Trees attract birds', isCorrect: false },
                            { text: 'Trees provide oxygen', isCorrect: false }
                        ],
                        explanation: 'Strong winds can uproot trees or break large branches that can cause injury.',
                        difficulty: 'hard',
                        points: 4
                    }
                ],
                settings: {
                    timeLimit: 10,
                    passingScore: 75,
                    maxAttempts: 3,
                    randomizeQuestions: true,
                    showCorrectAnswers: true
                }
            },
            // Fire Safety Quiz
            {
                title: 'Fire Safety Quiz',
                description: 'Fire prevention and emergency response procedures.',
                moduleId: createdModules[3]._id,
                difficulty: 'easy',
                status: 'published',
                questions: [
                    {
                        question: 'What should you do first during a fire?',
                        options: [
                            { text: 'Raise alarm', isCorrect: true },
                            { text: 'Hide under desk', isCorrect: false },
                            { text: 'Use water on electrical fire', isCorrect: false },
                            { text: 'Ignore it', isCorrect: false }
                        ],
                        explanation: 'Alert others immediately so everyone can evacuate safely.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'What is \'Stop, Drop, Roll\' used for?',
                        options: [
                            { text: 'If clothes catch fire', isCorrect: true },
                            { text: 'During earthquake', isCorrect: false },
                            { text: 'During flood', isCorrect: false },
                            { text: 'During cyclone', isCorrect: false }
                        ],
                        explanation: 'This technique helps extinguish fire on clothing by cutting off oxygen supply.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Which fire extinguisher should be used on electrical fires?',
                        options: [
                            { text: 'CO2 extinguisher', isCorrect: true },
                            { text: 'Water extinguisher', isCorrect: false },
                            { text: 'Foam extinguisher', isCorrect: false },
                            { text: 'Sand', isCorrect: false }
                        ],
                        explanation: 'CO2 is non-conductive and safe to use on electrical equipment.',
                        difficulty: 'medium',
                        points: 3
                    },
                    {
                        question: 'Why should you never use elevators during a fire?',
                        options: [
                            { text: 'They may trap you', isCorrect: true },
                            { text: 'They move too slowly', isCorrect: false },
                            { text: 'They are crowded', isCorrect: false },
                            { text: 'They are expensive', isCorrect: false }
                        ],
                        explanation: 'Elevators can fail during fires, trapping people inside.',
                        difficulty: 'hard',
                        points: 4
                    }
                ],
                settings: {
                    timeLimit: 8,
                    passingScore: 70,
                    maxAttempts: 5,
                    randomizeQuestions: false,
                    showCorrectAnswers: true
                }
            },
            // Continue with other disaster quizzes...
            // Stampede/Crowd Safety Quiz
            {
                title: 'Crowd Safety and Stampede Prevention',
                description: 'Managing crowd situations and preventing stampedes.',
                moduleId: createdModules[4]._id,
                difficulty: 'medium',
                status: 'published',
                questions: [
                    {
                        question: 'During a stampede, you should:',
                        options: [
                            { text: 'Move calmly with the crowd', isCorrect: true },
                            { text: 'Push people', isCorrect: false },
                            { text: 'Run randomly', isCorrect: false },
                            { text: 'Stand still', isCorrect: false }
                        ],
                        explanation: 'Moving with the crowd flow while staying calm prevents additional panic.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Which part of the body should you protect during crowd panic?',
                        options: [
                            { text: 'Chest and head', isCorrect: true },
                            { text: 'Feet only', isCorrect: false },
                            { text: 'Hands only', isCorrect: false },
                            { text: 'Back only', isCorrect: false }
                        ],
                        explanation: 'Protecting vital organs like chest and head is crucial for survival.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Which measure helps prevent stampedes in schools?',
                        options: [
                            { text: 'Controlled entry and exit points', isCorrect: true },
                            { text: 'Ignore safety rules', isCorrect: false },
                            { text: 'Overcrowding', isCorrect: false },
                            { text: 'Lock exits', isCorrect: false }
                        ],
                        explanation: 'Managing crowd flow prevents bottlenecks that lead to stampedes.',
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
            // Add remaining quizzes for Pandemic, Snow/Cold, Road Safety, Landslide, and Lightning...
        ];

        console.log('\n🧩 Creating comprehensive quizzes...');
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

        console.log('\n✨ Comprehensive quiz data creation completed!');
        console.log('\n📊 Summary:');
        
        const totalModules = await Module.countDocuments();
        const totalQuizzes = await Quiz.countDocuments({ status: 'published' });
        
        console.log(`📚 Total Modules: ${totalModules}`);
        console.log(`🧩 Total Published Quizzes: ${totalQuizzes}`);

    } catch (error) {
        console.error('❌ Error creating comprehensive quiz data:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createComprehensiveQuizData();