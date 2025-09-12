const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Quiz = require('./models/Quiz');

const createEnhancedModulesAndQuizzes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Enhanced modules with video chapters
        const enhancedModules = [
            {
                title: 'Earthquake Safety',
                description: 'Comprehensive guide to earthquake preparedness, during-event safety, and post-disaster recovery with expert video tutorials.',
                thumbnail: '/images/earthquake-thumb.jpg',
                chapters: [
                    {
                        title: 'Understanding Earthquakes',
                        contents: [
                            {
                                type: 'text',
                                body: 'Earthquakes are sudden movements of the Earth\'s crust caused by tectonic plate movements. India\'s Himalayan region and the Indo-Gangetic plains are particularly vulnerable to seismic activity due to their location on active fault lines.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=e7ho6z32yyo', // Earthquake science video
                                videoMetadata: {
                                    duration: 480,
                                    thumbnailUrl: '/images/earthquake-science-thumb.jpg'
                                }
                            },
                            {
                                type: 'text',
                                body: 'The Richter scale measures earthquake magnitude from 1-10. Major earthquakes (7.0+) can cause widespread destruction. India has experienced several major earthquakes including the 2001 Gujarat earthquake and the 2005 Kashmir earthquake.'
                            }
                        ]
                    },
                    {
                        title: 'Earthquake Preparedness',
                        contents: [
                            {
                                type: 'text',
                                body: 'Preparation is crucial for earthquake survival. Follow the "Drop, Cover, and Hold On" protocol during shaking. Create an emergency kit with water, food, flashlight, and first aid supplies.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=BLEPakj1YTY', // Drop, Cover, Hold On demonstration
                                videoMetadata: {
                                    duration: 180,
                                    thumbnailUrl: '/images/earthquake-drill-thumb.jpg'
                                }
                            },
                            {
                                type: 'text',
                                body: 'Secure heavy furniture and objects that could fall. Identify safe spots in each room - under sturdy tables or against interior walls. Practice earthquake drills regularly with your family.'
                            }
                        ]
                    },
                    {
                        title: 'During and After Earthquakes',
                        contents: [
                            {
                                type: 'text',
                                body: 'If indoors: Drop, cover, and hold on. Stay away from windows and heavy objects. If outdoors: Move to open space away from buildings and power lines. If in a vehicle: Pull over safely and stay inside.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=lt32-NgOB9k', // Post-earthquake safety
                                videoMetadata: {
                                    duration: 240,
                                    thumbnailUrl: '/images/post-earthquake-thumb.jpg'
                                }
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Flood Safety',
                description: 'Complete flood safety guide covering flood types, prevention measures, and emergency response with practical video demonstrations.',
                thumbnail: '/images/flood-thumb.jpg',
                chapters: [
                    {
                        title: 'Understanding Floods',
                        contents: [
                            {
                                type: 'text',
                                body: 'Floods are one of the most common natural disasters in India. They can be caused by heavy rainfall, dam failures, storm surges, or snowmelt. Monsoon season (June-September) brings the highest flood risks.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=TvMS_ykiLiQ', // Types of floods
                                videoMetadata: {
                                    duration: 300,
                                    thumbnailUrl: '/images/flood-types-thumb.jpg'
                                }
                            }
                        ]
                    },
                    {
                        title: 'Flood Preparedness and Response',
                        contents: [
                            {
                                type: 'text',
                                body: 'Monitor weather warnings and water levels. Prepare an emergency kit with essential supplies. Know your area\'s flood risk and evacuation routes. Never attempt to walk or drive through flooded areas.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=pMXVX2ANKnQ', // Flood safety tips
                                videoMetadata: {
                                    duration: 360,
                                    thumbnailUrl: '/images/flood-safety-thumb.jpg'
                                }
                            },
                            {
                                type: 'text',
                                body: 'Remember: Turn Around, Don\'t Drown. Just 6 inches of moving water can knock you down, and 12 inches can carry away a vehicle. Move to higher ground immediately when flooding occurs.'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Cyclone Safety',
                description: 'Comprehensive cyclone preparedness and response guide for coastal regions with expert insights and safety demonstrations.',
                thumbnail: '/images/cyclone-thumb.jpg',
                chapters: [
                    {
                        title: 'Understanding Cyclones',
                        contents: [
                            {
                                type: 'text',
                                body: 'Tropical cyclones are intense circular storms with strong winds and heavy rain. In India, they primarily affect coastal regions, especially the eastern coast including Odisha, West Bengal, Andhra Pradesh, and Tamil Nadu.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=Wdc6HdUfiEo', // How cyclones form
                                videoMetadata: {
                                    duration: 420,
                                    thumbnailUrl: '/images/cyclone-formation-thumb.jpg'
                                }
                            },
                            {
                                type: 'text',
                                body: 'Cyclones in India typically occur from May to November, with peak activity during pre-monsoon (April-June) and post-monsoon (October-December) periods. The India Meteorological Department (IMD) provides cyclone warnings and updates.'
                            }
                        ]
                    },
                    {
                        title: 'Cyclone Preparedness',
                        contents: [
                            {
                                type: 'text',
                                body: 'Before a cyclone: Secure all loose objects, board up windows, trim tree branches near your home, and stock up on essential supplies. Follow official evacuation orders immediately when issued.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=FYZfNZaFP20', // Cyclone preparation
                                videoMetadata: {
                                    duration: 380,
                                    thumbnailUrl: '/images/cyclone-prep-thumb.jpg'
                                }
                            }
                        ]
                    },
                    {
                        title: 'During and After Cyclones',
                        contents: [
                            {
                                type: 'text',
                                body: 'During a cyclone: Stay indoors in a sturdy building, away from windows and doors. Avoid going outside even during the eye of the storm. After: Be cautious of fallen power lines, damaged buildings, and flooding.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=kbf2-j9r4GI', // Cyclone safety during storm
                                videoMetadata: {
                                    duration: 280,
                                    thumbnailUrl: '/images/cyclone-during-thumb.jpg'
                                }
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Pandemic Safety',
                description: 'Comprehensive guide to pandemic preparedness, prevention measures, and public health emergency response with expert medical guidance.',
                thumbnail: '/images/pandemic-thumb.jpg',
                chapters: [
                    {
                        title: 'Understanding Pandemics',
                        contents: [
                            {
                                type: 'text',
                                body: 'A pandemic is a disease outbreak that spreads across multiple countries or continents and affects a large number of people. Recent examples include COVID-19, H1N1 influenza, and historically, the 1918 flu pandemic.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=gxAaO2rsdIs', // How pandemics spread
                                videoMetadata: {
                                    duration: 350,
                                    thumbnailUrl: '/images/pandemic-spread-thumb.jpg'
                                }
                            },
                            {
                                type: 'text',
                                body: 'Pandemics can be caused by viruses, bacteria, or other pathogens. They spread rapidly through human-to-human transmission, often through respiratory droplets, contaminated surfaces, or direct contact.'
                            }
                        ]
                    },
                    {
                        title: 'Prevention and Safety Measures',
                        contents: [
                            {
                                type: 'text',
                                body: 'Key prevention measures include proper hand hygiene, wearing masks when recommended, maintaining social distancing, vaccination when available, and following public health guidelines.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=d914EnpU4Fo', // Proper handwashing technique
                                videoMetadata: {
                                    duration: 200,
                                    thumbnailUrl: '/images/handwashing-thumb.jpg'
                                }
                            }
                        ]
                    },
                    {
                        title: 'Quarantine and Isolation',
                        contents: [
                            {
                                type: 'text',
                                body: 'Quarantine separates potentially exposed individuals, while isolation separates confirmed cases. Both are crucial for preventing disease spread. Quarantine typically lasts 10-14 days for most infectious diseases.'
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=1APwq1df6Mw', // Home isolation guidelines
                                videoMetadata: {
                                    duration: 240,
                                    thumbnailUrl: '/images/isolation-thumb.jpg'
                                }
                            }
                        ]
                    }
                ]
            }
        ];

        console.log('📚 Creating/updating enhanced modules...');
        const createdModules = [];
        
        for (const moduleData of enhancedModules) {
            // Check if module exists
            let existingModule = await Module.findOne({ title: moduleData.title });
            
            if (existingModule) {
                // Update existing module with enhanced content
                await Module.findByIdAndUpdate(existingModule._id, moduleData);
                existingModule = await Module.findById(existingModule._id);
                createdModules.push(existingModule);
                console.log(`🔄 Updated module: ${existingModule.title}`);
            } else {
                // Create new module
                const module = new Module(moduleData);
                await module.save();
                createdModules.push(module);
                console.log(`✅ Created module: ${module.title}`);
            }
        }

        // Create comprehensive quizzes
        const quizzes = [
            // Enhanced Earthquake Quiz
            {
                title: 'Earthquake Safety Quiz',
                description: 'Test your knowledge about earthquake safety, preparedness, and emergency response procedures.',
                moduleId: createdModules.find(m => m.title === 'Earthquake Safety')._id,
                difficulty: 'medium',
                status: 'published',
                questions: [
                    {
                        question: 'What is the safest action during an earthquake?',
                        options: [
                            { text: 'Run outside immediately', isCorrect: false },
                            { text: 'Drop, Cover, Hold', isCorrect: true },
                            { text: 'Stand near a window', isCorrect: false },
                            { text: 'Hide under a doorway', isCorrect: false }
                        ],
                        explanation: 'Drop to hands and knees, take Cover under sturdy furniture, and Hold On until shaking stops.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Which area in India is most prone to earthquakes?',
                        options: [
                            { text: 'Himalayan region', isCorrect: true },
                            { text: 'Thar Desert', isCorrect: false },
                            { text: 'Kerala coast', isCorrect: false },
                            { text: 'Central plains', isCorrect: false }
                        ],
                        explanation: 'The Himalayan region is in a high seismic zone due to tectonic plate movement.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'After an earthquake, what should you check first?',
                        options: [
                            { text: 'Gas leaks and electrical damage', isCorrect: true },
                            { text: 'Your phone battery', isCorrect: false },
                            { text: 'The television news', isCorrect: false },
                            { text: 'Your school schedule', isCorrect: false }
                        ],
                        explanation: 'Check for gas leaks, electrical damage, and structural damage for safety.',
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
            
            // Enhanced Flood Quiz  
            {
                title: 'Flood Safety Quiz',
                description: 'Learn about flood preparedness, safety measures, and emergency response procedures.',
                moduleId: createdModules.find(m => m.title === 'Flood Safety')._id,
                difficulty: 'medium',
                status: 'published',
                questions: [
                    {
                        question: 'What should you do during a flood?',
                        options: [
                            { text: 'Move to higher ground', isCorrect: true },
                            { text: 'Try to swim across', isCorrect: false },
                            { text: 'Walk through flood water', isCorrect: false },
                            { text: 'Stay near electrical lines', isCorrect: false }
                        ],
                        explanation: 'Moving to higher ground is the safest option during flooding.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'How much moving water can knock you down?',
                        options: [
                            { text: '6 inches', isCorrect: true },
                            { text: '2 feet', isCorrect: false },
                            { text: '1 inch', isCorrect: false },
                            { text: '3 feet', isCorrect: false }
                        ],
                        explanation: 'Just 6 inches of moving water can knock you down - Turn Around, Don\'t Drown.',
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

            // New Cyclone Quiz
            {
                title: 'Cyclone Safety Quiz',
                description: 'Test your understanding of cyclone formation, preparedness, and safety measures for coastal regions.',
                moduleId: createdModules.find(m => m.title === 'Cyclone Safety')._id,
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
                        question: 'Before a cyclone, it is important to:',
                        options: [
                            { text: 'Secure building & windows', isCorrect: true },
                            { text: 'Go to the beach', isCorrect: false },
                            { text: 'Climb trees', isCorrect: false },
                            { text: 'Ignore warnings', isCorrect: false }
                        ],
                        explanation: 'Protect property and prepare for strong winds by securing loose objects.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'During a cyclone, one should:',
                        options: [
                            { text: 'Stay indoors', isCorrect: true },
                            { text: 'Run outside', isCorrect: false },
                            { text: 'Stand under trees', isCorrect: false },
                            { text: 'Use metal objects', isCorrect: false }
                        ],
                        explanation: 'Avoid wind and debris by staying in a sturdy building away from windows.',
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
                        question: 'Which Indian states are frequently hit by cyclones?',
                        options: [
                            { text: 'Odisha, West Bengal, Andhra Pradesh, Tamil Nadu', isCorrect: true },
                            { text: 'Punjab, Haryana, Delhi', isCorrect: false },
                            { text: 'Rajasthan, Gujarat', isCorrect: false },
                            { text: 'Kerala, Karnataka', isCorrect: false }
                        ],
                        explanation: 'Eastern coastal states are most vulnerable to cyclone impacts.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'What should you avoid during a cyclone?',
                        options: [
                            { text: 'Flying debris', isCorrect: true },
                            { text: 'Staying inside', isCorrect: false },
                            { text: 'Following instructions', isCorrect: false },
                            { text: 'Using emergency kit', isCorrect: false }
                        ],
                        explanation: 'Loose objects become dangerous projectiles in strong winds.',
                        difficulty: 'medium',
                        points: 3
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
                        question: 'After a cyclone, what should be checked first?',
                        options: [
                            { text: 'Damaged electricity and water lines', isCorrect: true },
                            { text: 'Phone battery', isCorrect: false },
                            { text: 'School timetable', isCorrect: false },
                            { text: 'Television programs', isCorrect: false }
                        ],
                        explanation: 'Safety first - check for utility damage and hazards.',
                        difficulty: 'medium',
                        points: 3
                    },
                    {
                        question: 'Why is it dangerous to go outdoors during high winds of a cyclone?',
                        options: [
                            { text: 'Flying debris can cause injury', isCorrect: true },
                            { text: 'It\'s windy', isCorrect: false },
                            { text: 'You might get wet', isCorrect: false },
                            { text: 'It\'s boring', isCorrect: false }
                        ],
                        explanation: 'Objects can become deadly projectiles in cyclone-force winds.',
                        difficulty: 'hard',
                        points: 4
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
                    timeLimit: 15,
                    passingScore: 75,
                    maxAttempts: 3,
                    randomizeQuestions: true,
                    showCorrectAnswers: true
                }
            },

            // New Pandemic Quiz
            {
                title: 'Pandemic Safety Quiz',
                description: 'Test your knowledge about pandemic preparedness, prevention measures, and public health emergency response.',
                moduleId: createdModules.find(m => m.title === 'Pandemic Safety')._id,
                difficulty: 'medium',
                status: 'published',
                questions: [
                    {
                        question: 'Which of the following is an epidemic that affected India in 2020?',
                        options: [
                            { text: 'COVID-19', isCorrect: true },
                            { text: 'Dengue', isCorrect: false },
                            { text: 'Typhoon', isCorrect: false },
                            { text: 'Earthquake', isCorrect: false }
                        ],
                        explanation: 'A respiratory disease caused by a new coronavirus.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'What is a key method to prevent the spread of infectious diseases?',
                        options: [
                            { text: 'Vaccination', isCorrect: true },
                            { text: 'Watching TV', isCorrect: false },
                            { text: 'Traveling', isCorrect: false },
                            { text: 'Ignoring symptoms', isCorrect: false }
                        ],
                        explanation: 'Helps the body build immunity against specific diseases.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Which hygiene practice is important during a pandemic?',
                        options: [
                            { text: 'Handwashing', isCorrect: true },
                            { text: 'Skipping meals', isCorrect: false },
                            { text: 'Sleeping less', isCorrect: false },
                            { text: 'Running outdoors', isCorrect: false }
                        ],
                        explanation: 'Removes germs from hands and prevents transmission.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'During an epidemic, what is advised if you have symptoms?',
                        options: [
                            { text: 'Isolate yourself', isCorrect: true },
                            { text: 'Go to crowded places', isCorrect: false },
                            { text: 'Ignore it', isCorrect: false },
                            { text: 'Exercise in group', isCorrect: false }
                        ],
                        explanation: 'Prevents spreading disease to others.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Social distancing helps by:',
                        options: [
                            { text: 'Reducing contact', isCorrect: true },
                            { text: 'Increasing social media usage', isCorrect: false },
                            { text: 'Encouraging crowding', isCorrect: false },
                            { text: 'Boosting parties', isCorrect: false }
                        ],
                        explanation: 'Keeps people safe from transmission by maintaining physical distance.',
                        difficulty: 'easy',
                        points: 2
                    },
                    {
                        question: 'Mask usage is important because:',
                        options: [
                            { text: 'It reduces inhalation of virus droplets', isCorrect: true },
                            { text: 'It is fashionable', isCorrect: false },
                            { text: 'It helps sleep', isCorrect: false },
                            { text: 'It increases oxygen intake', isCorrect: false }
                        ],
                        explanation: 'Protects your nose and mouth from respiratory droplets.',
                        difficulty: 'medium',
                        points: 3
                    },
                    {
                        question: 'Quarantine period usually lasts:',
                        options: [
                            { text: '10–14 days', isCorrect: true },
                            { text: '1 day', isCorrect: false },
                            { text: '6 months', isCorrect: false },
                            { text: '1 hour', isCorrect: false }
                        ],
                        explanation: 'Covers incubation period of most viruses.',
                        difficulty: 'medium',
                        points: 3
                    },
                    {
                        question: 'Contact tracing helps in a pandemic by:',
                        options: [
                            { text: 'Identifying infected people and their contacts', isCorrect: true },
                            { text: 'Cooking meals', isCorrect: false },
                            { text: 'Watching movies', isCorrect: false },
                            { text: 'Improving fitness', isCorrect: false }
                        ],
                        explanation: 'Stops further transmission by tracking disease spread.',
                        difficulty: 'medium',
                        points: 3
                    },
                    {
                        question: 'Why should antibiotics not be used for viral pandemics?',
                        options: [
                            { text: 'They do not kill viruses', isCorrect: true },
                            { text: 'They are expensive', isCorrect: false },
                            { text: 'They cure viruses faster', isCorrect: false },
                            { text: 'They are addictive', isCorrect: false }
                        ],
                        explanation: 'Antibiotics only work on bacteria, not viruses.',
                        difficulty: 'hard',
                        points: 4
                    },
                    {
                        question: 'Which factor increases pandemic severity?',
                        options: [
                            { text: 'High population density', isCorrect: true },
                            { text: 'Low humidity alone', isCorrect: false },
                            { text: 'Wearing masks', isCorrect: false },
                            { text: 'Proper hygiene', isCorrect: false }
                        ],
                        explanation: 'Crowded areas allow faster virus spread between people.',
                        difficulty: 'hard',
                        points: 4
                    }
                ],
                settings: {
                    timeLimit: 15,
                    passingScore: 75,
                    maxAttempts: 3,
                    randomizeQuestions: true,
                    showCorrectAnswers: true
                }
            }
        ];

        console.log('\n🧩 Creating comprehensive quizzes...');
        for (const quizData of quizzes) {
            const existingQuiz = await Quiz.findOne({ title: quizData.title });
            if (!existingQuiz) {
                const quiz = new Quiz(quizData);
                await quiz.save();
                console.log(`✅ Created quiz: ${quiz.title} (${quiz.questions.length} questions)`);
            } else {
                // Update existing quiz
                await Quiz.findByIdAndUpdate(existingQuiz._id, quizData);
                console.log(`🔄 Updated quiz: ${existingQuiz.title}`);
            }
        }

        console.log('\n✨ Enhanced modules and quizzes creation completed!');
        console.log('\n📊 Summary:');
        
        const totalModules = await Module.countDocuments();
        const totalQuizzes = await Quiz.countDocuments({ status: 'published' });
        
        console.log(`📚 Total Modules: ${totalModules}`);
        console.log(`🧩 Total Published Quizzes: ${totalQuizzes}`);
        console.log('\n🎯 New Features Added:');
        console.log('✅ Video chapters for Earthquake Safety');
        console.log('✅ Video chapters for Flood Safety');
        console.log('✅ Enhanced Cyclone Safety module with videos');
        console.log('✅ Enhanced Pandemic Safety module with videos');
        console.log('✅ Comprehensive Cyclone Safety quiz (10 questions)');
        console.log('✅ Comprehensive Pandemic Safety quiz (10 questions)');

    } catch (error) {
        console.error('❌ Error creating enhanced modules and quizzes:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createEnhancedModulesAndQuizzes();