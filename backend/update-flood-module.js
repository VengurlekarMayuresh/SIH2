const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Quiz = require('./models/Quiz');

const updateFloodModule = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Find the existing Flood Safety module
        const existingFloodModule = await Module.findOne({ title: "Flood Safety" });
        
        if (!existingFloodModule) {
            console.log('❌ Flood Safety module not found');
            return;
        }

        console.log(`🎯 Found existing Flood Safety module: ${existingFloodModule._id}`);
        console.log(`📖 Current chapters: ${existingFloodModule.chapters.length}`);

        // Updated Flood Safety Module with your specific content
        const updatedFloodData = {
            title: 'Flood Safety',
            description: 'Learn about floods and how to stay safe! Simple tips to understand, prepare for, and respond to floods. Perfect for young safety heroes!',
            thumbnail: existingFloodModule.thumbnail || '/images/flood-thumb.jpg',
            chapters: [
                {
                    title: 'Understanding Flood 🌊',
                    contents: [
                        {
                            type: 'text',
                            body: `🌊 **Lesson 1: Understanding Flood**
*Chapter 1 of 3*

**Key Points:**
A flood is when heavy rain or rivers overflow, covering dry land like streets. It can be slow or super fast (flash flood), damaging homes.

✅ 6 inches of water can knock you down.
✅ Floods carry germs, making water unsafe.

**Do's and Don'ts:**
✅ **Do:** Check weather for flood warnings daily.
❌ **Don't:** Ignore flood alerts—they're common!`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://www.youtube.com/watch?v=TvMS_ykiLiQ', // FLOODS - The Dr. Binocs Show
                            videoMetadata: {
                                duration: 240,
                                thumbnailUrl: '/images/flood-understanding-thumb.jpg'
                            }
                        }
                    ]
                },
                {
                    title: 'Flood Preparedness 🎒',
                    contents: [
                        {
                            type: 'text',
                            body: `🎒 **Lesson 2: Flood Preparedness**
*Chapter 2 of 3*

**Key Points:**
Plan ahead with a go-bag (water, snacks, flashlight, papers) and know high spots to escape to. Secure outdoor items.

✅ Get weather alerts on phone or radio.
✅ Pick a safe family meeting spot.

**Do's and Don'ts:**
✅ **Do:** Draw a map of safe routes with family.
❌ **Don't:** Wait for rain to pack your bag.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://www.youtube.com/watch?v=pMXVX2ANKnQ', // How To Survive Floods
                            videoMetadata: {
                                duration: 300,
                                thumbnailUrl: '/images/flood-preparedness-thumb.jpg'
                            }
                        }
                    ]
                },
                {
                    title: 'During and After Flood 🚨',
                    contents: [
                        {
                            type: 'text',
                            body: `🚨 **Lesson 3: During and After Flood**
*Chapter 3 of 3*

**Key Points:**
During: Get to high ground, avoid water. After: Wait for safety okay, check for damage, boil water.

**During:** Turn off power if safe.
**After:** Avoid dirty water and hazards.

✅ 12 inches of water can float a car.
✅ Floodwater has germs—don't touch!

**Do's and Don'ts:**
✅ **Do:** Listen to radio for updates.
❌ **Don't:** Go home until it's safe.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://www.youtube.com/watch?v=kFlzYQ0mp3g', // Flood Safety Sheriff Labrador
                            videoMetadata: {
                                duration: 360,
                                thumbnailUrl: '/images/flood-response-thumb.jpg'
                            }
                        }
                    ]
                }
            ]
        };

        // Update the existing module
        console.log('🔄 Updating existing Flood Safety module...');
        await Module.findByIdAndUpdate(existingFloodModule._id, updatedFloodData);
        console.log('✅ Successfully updated Flood Safety module');

        // Update the quiz to match the new content
        console.log('🧩 Updating Flood Safety quiz...');
        const floodQuiz = {
            title: 'Flood Safety Quiz 🌊🏠',
            description: 'Test your flood safety knowledge! Learn how to stay safe during floods with fun questions.',
            moduleId: existingFloodModule._id,
            difficulty: 'easy',
            status: 'published',
            questions: [
                {
                    question: 'What is a flood?',
                    options: [
                        { text: '🌊 When heavy rain or rivers overflow, covering dry land', isCorrect: true },
                        { text: '🔥 When it gets very hot outside', isCorrect: false },
                        { text: '❄️ When snow falls heavily', isCorrect: false },
                        { text: '🌪️ When wind blows very fast', isCorrect: false }
                    ],
                    explanation: 'Perfect! A flood happens when heavy rain or rivers overflow and cover normally dry land like streets!',
                    difficulty: 'easy',
                    points: 10
                },
                {
                    question: 'How much water can knock you down?',
                    options: [
                        { text: '💧 6 inches of water', isCorrect: true },
                        { text: '💧 2 feet of water', isCorrect: false },
                        { text: '💧 1 foot of water', isCorrect: false },
                        { text: '💧 3 feet of water', isCorrect: false }
                    ],
                    explanation: 'Great memory! Just 6 inches of moving water can knock you down - that\'s why floods are so dangerous!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'What should you pack in your flood go-bag?',
                    options: [
                        { text: '🎒 Water, snacks, flashlight, papers', isCorrect: true },
                        { text: '🎮 Video games and tablets', isCorrect: false },
                        { text: '🧸 All your stuffed animals', isCorrect: false },
                        { text: '📚 Heavy school textbooks', isCorrect: false }
                    ],
                    explanation: 'Excellent! Pack essential items like water, snacks, flashlight, and important papers in your go-bag!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'When should you pack your flood emergency bag?',
                    options: [
                        { text: '☀️ Before it rains, not during', isCorrect: true },
                        { text: '🌧️ Only when it starts raining heavily', isCorrect: false },
                        { text: '🌊 After the flood starts', isCorrect: false },
                        { text: '📅 Once a year only', isCorrect: false }
                    ],
                    explanation: 'Smart thinking! Don\'t wait for rain to pack your bag - prepare ahead of time!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'Why is floodwater dangerous?',
                    options: [
                        { text: '🦠 It carries germs and makes water unsafe', isCorrect: true },
                        { text: '❄️ It\'s too cold', isCorrect: false },
                        { text: '🌈 It has too many colors', isCorrect: false },
                        { text: '🐟 It has too many fish', isCorrect: false }
                    ],
                    explanation: 'Correct! Floodwater carries germs and bacteria that can make you sick - never touch or drink it!',
                    difficulty: 'medium',
                    points: 15
                },
                {
                    question: 'How much water can float a car?',
                    options: [
                        { text: '🚗 12 inches of water', isCorrect: true },
                        { text: '🚗 3 feet of water', isCorrect: false },
                        { text: '🚗 6 feet of water', isCorrect: false },
                        { text: '🚗 2 inches of water', isCorrect: false }
                    ],
                    explanation: 'Amazing! Just 12 inches (1 foot) of water can float a car - never drive through floods!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'What should you do during a flood?',
                    options: [
                        { text: '⛰️ Get to high ground and avoid water', isCorrect: true },
                        { text: '🏊‍♀️ Try to swim through the water', isCorrect: false },
                        { text: '🚗 Drive through the floodwater', isCorrect: false },
                        { text: '🏠 Stay in the basement', isCorrect: false }
                    ],
                    explanation: 'Perfect! Always get to high ground and stay away from floodwater during a flood!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'What should you do with power/electricity if it\'s safe during a flood?',
                    options: [
                        { text: '🔌 Turn off power if safe', isCorrect: true },
                        { text: '💡 Turn on all lights', isCorrect: false },
                        { text: '📺 Watch TV loudly', isCorrect: false },
                        { text: '🔊 Play music at full volume', isCorrect: false }
                    ],
                    explanation: 'Good thinking! Turn off power if you can do it safely - water and electricity are dangerous together!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'How should your family prepare for floods?',
                    options: [
                        { text: '🗺️ Draw a map of safe routes together', isCorrect: true },
                        { text: '🎮 Play video games together', isCorrect: false },
                        { text: '🛍️ Go shopping for new clothes', isCorrect: false },
                        { text: '📺 Watch movies all day', isCorrect: false }
                    ],
                    explanation: 'Excellent! Drawing a family map of safe routes helps everyone know where to go during a flood!',
                    difficulty: 'easy',
                    points: 10
                },
                {
                    question: 'After a flood, when should you go home?',
                    options: [
                        { text: '✅ Wait until officials say it\'s safe', isCorrect: true },
                        { text: '🏃‍♀️ Go back immediately', isCorrect: false },
                        { text: '🌅 As soon as the sun comes out', isCorrect: false },
                        { text: '💧 When the water looks clear', isCorrect: false }
                    ],
                    explanation: 'Smart! Never go home until safety officials say it\'s okay - there might be hidden dangers!',
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

        // Look for existing flood quiz and update it
        const existingQuiz = await Quiz.findOne({ 
            $or: [
                { title: /flood.*quiz/i },
                { moduleId: existingFloodModule._id }
            ]
        });
        
        if (existingQuiz) {
            await Quiz.findByIdAndUpdate(existingQuiz._id, floodQuiz);
            console.log('✅ Updated existing Flood Safety quiz');
        } else {
            const quiz = new Quiz(floodQuiz);
            await quiz.save();
            console.log('✅ Created new Flood Safety quiz');
        }

        console.log('\n🎉 Flood Safety module update completed successfully!');
        console.log('\n📊 Summary of changes:');
        console.log('✅ Updated "Flood Safety" module with your specific content');
        console.log('✅ Lesson 1: Understanding Flood - What floods are and dangers');
        console.log('✅ Lesson 2: Flood Preparedness - Go-bag and escape routes');
        console.log('✅ Lesson 3: During and After Flood - Response and recovery');
        console.log('✅ Added educational videos to each lesson');
        console.log('✅ Updated quiz with flood-specific questions');
        console.log('✅ Updated to 3 chapters structure');
        console.log('\n🌟 Module ID:', existingFloodModule._id);
        console.log('\n📺 Videos included:');
        console.log('   • Lesson 1: FLOODS - The Dr. Binocs Show (4-min cartoon)');
        console.log('   • Lesson 2: How To Survive Floods (5-min prep guide)');
        console.log('   • Lesson 3: Flood Safety Sheriff Labrador (6-min cartoon)');

    } catch (error) {
        console.error('❌ Error updating Flood Safety module:', error);
    } finally {
        await mongoose.connection.close();
    }
};

updateFloodModule();