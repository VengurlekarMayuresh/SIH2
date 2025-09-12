const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Quiz = require('./models/Quiz');

const updateCycloneModule = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Find the existing Cyclone Safety module
        const existingCycloneModule = await Module.findOne({ title: "Cyclone Safety" });
        
        if (!existingCycloneModule) {
            console.log('❌ Cyclone Safety module not found');
            return;
        }

        console.log(`🎯 Found existing Cyclone Safety module: ${existingCycloneModule._id}`);
        console.log(`📖 Current chapters: ${existingCycloneModule.chapters.length}`);

        // Updated Cyclone Safety Module with clean, simple content
        const updatedCycloneData = {
            title: 'Cyclone Safety',
            description: 'Learn about cyclones and how to stay safe! Simple tips to understand, prepare for, and respond to cyclones.',
            thumbnail: existingCycloneModule.thumbnail || '/images/cyclone-thumb.jpg',
            chapters: [
                {
                    title: 'Understanding Cyclones',
                    contents: [
                        {
                            type: 'text',
                            body: `Lesson 1: Understanding Cyclones
Chapter 1 of 3

Key Points:
A cyclone is a powerful storm with strong winds and heavy rain, formed over warm ocean waters. It causes floods, damage to homes, and power outages.

✅ Winds can exceed 120 km/h, destroying structures.
✅ Storm surges flood coastal areas.

Do's and Don'ts:
Do: Monitor weather updates from IMD or NOAA for alerts.
Don't: Stay near coastlines during warnings—evacuate early.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://youtu.be/FxF8fPdtGao?si=V5KZSGDcmZoCksQN',
                            videoMetadata: {
                                duration: 300,
                                thumbnailUrl: '/images/cyclone-understanding-thumb.jpg'
                            }
                        }
                    ]
                },
                {
                    title: 'Cyclone Preparedness',
                    contents: [
                        {
                            type: 'text',
                            body: `Lesson 2: Cyclone Preparedness
Chapter 2 of 3

Key Points:
Prepare with an emergency kit (food, water, flashlight, batteries) and a family evacuation plan. Secure windows, doors, and outdoor items to reduce damage.

✅ Know your area's cyclone risk and safe shelters.
✅ Charge devices and keep cash for emergencies.

Do's and Don'ts:
Do: Board up windows and reinforce doors before a storm.
Don't: Ignore evacuation orders—safety comes first.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://youtu.be/HDJSj-cpRnM?si=wfI1SUsrReOG4NO5',
                            videoMetadata: {
                                duration: 240,
                                thumbnailUrl: '/images/cyclone-preparedness-thumb.jpg'
                            }
                        }
                    ]
                },
                {
                    title: 'During and After Cyclone',
                    contents: [
                        {
                            type: 'text',
                            body: `Lesson 3: During and After a Cyclone
Chapter 3 of 3

Key Points:
During: Stay indoors, away from windows, and listen to alerts. After: Avoid flooded areas, check for structural damage, and report injuries.

During: Use battery-powered radios for updates.
After: Beware of fallen power lines and contaminated water.

✅ Winds can topple trees, so stay clear of debris.
✅ Help neighbors, but prioritize personal safety.

Do's and Don'ts:
Do: Stay in a safe shelter until authorities say it's clear.
Don't: Touch downed wires—they may be live.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://youtu.be/B9qR2e3xyJo?si=_nCCKZ0pRPtRsnsM',
                            videoMetadata: {
                                duration: 360,
                                thumbnailUrl: '/images/cyclone-response-thumb.jpg'
                            }
                        }
                    ]
                }
            ]
        };

        // Update the existing module
        console.log('🔄 Updating existing Cyclone Safety module...');
        await Module.findByIdAndUpdate(existingCycloneModule._id, updatedCycloneData);
        console.log('✅ Successfully updated Cyclone Safety module');

        // Update the quiz to match the new content
        console.log('🧩 Updating Cyclone Safety quiz...');
        const cycloneQuiz = {
            title: 'Cyclone Safety Quiz',
            description: 'Test your cyclone safety knowledge! Learn how to stay safe during cyclones with fun questions.',
            moduleId: existingCycloneModule._id,
            difficulty: 'easy',
            status: 'published',
            questions: [
                {
                    question: 'What is a cyclone?',
                    options: [
                        { text: 'A powerful storm with strong winds and heavy rain', isCorrect: true },
                        { text: 'A gentle breeze', isCorrect: false },
                        { text: 'A type of earthquake', isCorrect: false },
                        { text: 'A fire in the forest', isCorrect: false }
                    ],
                    explanation: 'Correct! A cyclone is a powerful storm with strong winds and heavy rain formed over warm ocean waters.',
                    difficulty: 'easy',
                    points: 10
                },
                {
                    question: 'How fast can cyclone winds go?',
                    options: [
                        { text: 'Over 120 km/h', isCorrect: true },
                        { text: '10 km/h', isCorrect: false },
                        { text: '50 km/h', isCorrect: false },
                        { text: '5 km/h', isCorrect: false }
                    ],
                    explanation: 'Right! Cyclone winds can exceed 120 km/h and can destroy structures.',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'What should you monitor for cyclone alerts?',
                    options: [
                        { text: 'Weather updates from IMD or NOAA', isCorrect: true },
                        { text: 'Social media only', isCorrect: false },
                        { text: 'Your friends', isCorrect: false },
                        { text: 'TV shows', isCorrect: false }
                    ],
                    explanation: 'Perfect! Monitor official weather updates from IMD or NOAA for accurate cyclone alerts.',
                    difficulty: 'medium',
                    points: 15
                },
                {
                    question: 'What should you do when cyclone warnings are issued?',
                    options: [
                        { text: 'Evacuate early, don\'t stay near coastlines', isCorrect: true },
                        { text: 'Go to the beach to watch', isCorrect: false },
                        { text: 'Ignore the warnings', isCorrect: false },
                        { text: 'Stay outside', isCorrect: false }
                    ],
                    explanation: 'Smart! Don\'t stay near coastlines during warnings—evacuate early for safety.',
                    difficulty: 'easy',
                    points: 20
                },
                {
                    question: 'What should be in your cyclone emergency kit?',
                    options: [
                        { text: 'Food, water, flashlight, batteries', isCorrect: true },
                        { text: 'Games and toys only', isCorrect: false },
                        { text: 'Heavy furniture', isCorrect: false },
                        { text: 'Nothing special', isCorrect: false }
                    ],
                    explanation: 'Excellent! Pack food, water, flashlight, and batteries in your emergency kit.',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'What should you do to prepare your house before a cyclone?',
                    options: [
                        { text: 'Board up windows and reinforce doors', isCorrect: true },
                        { text: 'Open all windows', isCorrect: false },
                        { text: 'Remove the roof', isCorrect: false },
                        { text: 'Do nothing', isCorrect: false }
                    ],
                    explanation: 'Great! Board up windows and reinforce doors before the storm arrives.',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'During a cyclone, where should you stay?',
                    options: [
                        { text: 'Indoors, away from windows', isCorrect: true },
                        { text: 'Near big windows', isCorrect: false },
                        { text: 'Outside in the yard', isCorrect: false },
                        { text: 'On the roof', isCorrect: false }
                    ],
                    explanation: 'Perfect! Stay indoors and away from windows during a cyclone for safety.',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'After a cyclone, what should you avoid?',
                    options: [
                        { text: 'Flooded areas and fallen power lines', isCorrect: true },
                        { text: 'Drinking clean water', isCorrect: false },
                        { text: 'Talking to family', isCorrect: false },
                        { text: 'Being careful', isCorrect: false }
                    ],
                    explanation: 'Right! Avoid flooded areas and fallen power lines—they can be very dangerous.',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'What should you never touch after a cyclone?',
                    options: [
                        { text: 'Downed wires—they may be live', isCorrect: true },
                        { text: 'Your family', isCorrect: false },
                        { text: 'Clean water', isCorrect: false },
                        { text: 'Safe food', isCorrect: false }
                    ],
                    explanation: 'Correct! Never touch downed wires because they may still have electricity.',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'When can you leave your safe shelter after a cyclone?',
                    options: [
                        { text: 'When authorities say it\'s clear and safe', isCorrect: true },
                        { text: 'As soon as the wind stops', isCorrect: false },
                        { text: 'Immediately after rain stops', isCorrect: false },
                        { text: 'Whenever you want', isCorrect: false }
                    ],
                    explanation: 'Smart! Only leave your shelter when authorities officially say it\'s safe.',
                    difficulty: 'easy',
                    points: 15
                }
            ],
            settings: {
                timeLimit: 20,
                passingScore: 70,
                maxAttempts: 3,
                randomizeQuestions: true,
                showCorrectAnswers: true
            }
        };

        // Look for existing cyclone quiz and update it
        const existingQuiz = await Quiz.findOne({ 
            $or: [
                { title: /cyclone.*quiz/i },
                { moduleId: existingCycloneModule._id }
            ]
        });
        
        if (existingQuiz) {
            await Quiz.findByIdAndUpdate(existingQuiz._id, cycloneQuiz);
            console.log('✅ Updated existing Cyclone Safety quiz');
        } else {
            const quiz = new Quiz(cycloneQuiz);
            await quiz.save();
            console.log('✅ Created new Cyclone Safety quiz');
        }

        console.log('\n🎉 Cyclone Safety module update completed successfully!');
        console.log('\n📊 Summary of changes:');
        console.log('✅ Updated "Cyclone Safety" module with clean, simple content');
        console.log('✅ Lesson 1: Understanding Cyclones - What cyclones are and their dangers');
        console.log('✅ Lesson 2: Cyclone Preparedness - Emergency kits and house preparation');
        console.log('✅ Lesson 3: During and After Cyclone - Response and recovery');
        console.log('✅ Added your specific YouTube videos to each lesson');
        console.log('✅ Updated quiz with cyclone-specific questions');
        console.log('✅ Maintained 3 chapters structure');
        console.log('\n🌟 Module ID:', existingCycloneModule._id);

    } catch (error) {
        console.error('❌ Error updating Cyclone Safety module:', error);
    } finally {
        await mongoose.connection.close();
    }
};

updateCycloneModule();