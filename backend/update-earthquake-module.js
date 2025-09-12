const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Quiz = require('./models/Quiz');

const updateEarthquakeModule = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Find the existing Earthquake Safety module
        const existingEarthquakeModule = await Module.findOne({ title: "Earthquake Safety" });
        
        if (!existingEarthquakeModule) {
            console.log('❌ Earthquake Safety module not found');
            return;
        }

        console.log(`🎯 Found existing Earthquake Safety module: ${existingEarthquakeModule._id}`);
        console.log(`📖 Current chapters: ${existingEarthquakeModule.chapters.length}`);

        // Updated Earthquake Safety Module with your specific content
        const updatedEarthquakeData = {
            title: 'Earthquake Safety',
            description: 'Learn about earthquakes and how to stay safe! Simple tips to understand, prepare for, and respond to earthquakes. Perfect for young safety heroes!',
            thumbnail: existingEarthquakeModule.thumbnail || '/images/earthquake-thumb.jpg',
            chapters: [
                {
                    title: 'Understanding Earthquake 🌍',
                    contents: [
                        {
                            type: 'text',
                            body: `🌍 **Lesson 1: Understanding Earthquake**
*Chapter 1 of 3*

**Key Points:**
An earthquake is when the ground shakes because rocks deep in Earth move. It lasts seconds or minutes; small ones wiggle, big ones knock things over.

✅ Hear a rumble or feel dizzy.
✅ Earth's plates slip to cause shakes.

**Do's and Don'ts:**
✅ **Do:** Listen to news for local quake info.
❌ **Don't:** Panic—most are small.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://youtu.be/dJpIU1rSOFY?si=XSBIvAnwZ9UtOVzQ',
                            videoMetadata: {
                                duration: 300,
                                thumbnailUrl: '/images/earthquake-understanding-thumb.jpg'
                            }
                        }
                    ]
                },
                {
                    title: 'Earthquake Preparedness 🎒',
                    contents: [
                        {
                            type: 'text',
                            body: `🎒 **Lesson 2: Earthquake Preparedness**
*Chapter 2 of 3*

**Key Points:**
Plan ahead with a go-bag and safe spots. Practice "Drop, Cover, Hold On": drop down, cover under table, hold tight.

✅ Pack water, snacks, flashlight.
✅ Secure shelves to walls.

**Do's and Don'ts:**
✅ **Do:** Make family drills a game.
❌ **Don't:** Put bed near windows.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://youtu.be/MKILThtPxQs?si=f-nN0xk-IzSdb76u',
                            videoMetadata: {
                                duration: 240,
                                thumbnailUrl: '/images/earthquake-preparedness-thumb.jpg'
                            }
                        }
                    ]
                },
                {
                    title: 'During and After Earthquake 🚨',
                    contents: [
                        {
                            type: 'text',
                            body: `🚨 **Lesson 3: During and After Earthquake**
*Chapter 3 of 3*

**Key Points:**
During: Protect head, stay from falling stuff. After: Check for dangers like glass or fires; wait for all-clear.

**During:** Drop, Cover, Hold On till it stops.
**After:** Avoid wires, help if safe.

✅ Aftershocks can follow.
✅ Stay calm and hydrated.

**Do's and Don'ts:**
✅ **Do:** Stay inside unless outside in open area.
❌ **Don't:** Run to windows or doors.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://youtu.be/BLEPakj1YTY?si=DZ-CtFZypo5ON6R7',
                            videoMetadata: {
                                duration: 180,
                                thumbnailUrl: '/images/earthquake-response-thumb.jpg'
                            }
                        }
                    ]
                }
            ]
        };

        // Update the existing module
        console.log('🔄 Updating existing Earthquake Safety module...');
        await Module.findByIdAndUpdate(existingEarthquakeModule._id, updatedEarthquakeData);
        console.log('✅ Successfully updated Earthquake Safety module');

        // Update the quiz to match the new content
        console.log('🧩 Updating Earthquake Safety quiz...');
        const earthquakeQuiz = {
            title: 'Earthquake Safety Quiz 🌍🏠',
            description: 'Test your earthquake safety knowledge! Learn how to stay safe during earthquakes with fun questions.',
            moduleId: existingEarthquakeModule._id,
            difficulty: 'easy',
            status: 'published',
            questions: [
                {
                    question: 'What causes an earthquake?',
                    options: [
                        { text: '🌍 Rocks deep in Earth move and Earth\'s plates slip', isCorrect: true },
                        { text: '🌧️ Heavy rain and wind', isCorrect: false },
                        { text: '🔥 Fire underground', isCorrect: false },
                        { text: '❄️ Snow melting too fast', isCorrect: false }
                    ],
                    explanation: 'Great! Earthquakes happen when Earth\'s plates slip and rocks deep underground move!',
                    difficulty: 'easy',
                    points: 10
                },
                {
                    question: 'What should you do when you feel an earthquake?',
                    options: [
                        { text: '🛑 Drop, Cover, and Hold On', isCorrect: true },
                        { text: '🏃‍♀️ Run outside immediately', isCorrect: false },
                        { text: '🪟 Stand near a window', isCorrect: false },
                        { text: '🚪 Hide in a doorway', isCorrect: false }
                    ],
                    explanation: 'Perfect! Drop to the ground, take Cover under a table, and Hold On until shaking stops!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'What should you pack in your earthquake go-bag?',
                    options: [
                        { text: '💧 Water, snacks, and flashlight', isCorrect: true },
                        { text: '🎮 Video games and toys', isCorrect: false },
                        { text: '📚 All your school books', isCorrect: false },
                        { text: '👕 All your clothes', isCorrect: false }
                    ],
                    explanation: 'Excellent! Pack water, snacks, flashlight, and other emergency supplies in your go-bag!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'Where should you NOT put your bed?',
                    options: [
                        { text: '🪟 Near windows', isCorrect: true },
                        { text: '🛏️ In the middle of the room', isCorrect: false },
                        { text: '🏠 Away from tall furniture', isCorrect: false },
                        { text: '🔒 In a safe corner', isCorrect: false }
                    ],
                    explanation: 'Right! Don\'t put your bed near windows because glass can break during earthquakes!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'What might you hear or feel before an earthquake?',
                    options: [
                        { text: '🔊 A rumble sound or feel dizzy', isCorrect: true },
                        { text: '🎵 Music playing', isCorrect: false },
                        { text: '🌧️ Rain starting', isCorrect: false },
                        { text: '🐕 Dogs barking loudly', isCorrect: false }
                    ],
                    explanation: 'Good job! You might hear a rumbling sound or feel dizzy before the shaking starts!',
                    difficulty: 'medium',
                    points: 15
                },
                {
                    question: 'What can happen after the main earthquake?',
                    options: [
                        { text: '🔄 Aftershocks can follow', isCorrect: true },
                        { text: '🌈 A rainbow appears', isCorrect: false },
                        { text: '🎉 Everything goes back to normal immediately', isCorrect: false },
                        { text: '❄️ It starts snowing', isCorrect: false }
                    ],
                    explanation: 'Correct! Aftershocks are smaller earthquakes that can happen after the main one!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'If you\'re outside during an earthquake, what should you do?',
                    options: [
                        { text: '🏞️ Stay in an open area away from buildings', isCorrect: true },
                        { text: '🏢 Run into the nearest building', isCorrect: false },
                        { text: '🌳 Hide under a tree', isCorrect: false },
                        { text: '🚗 Get in a car quickly', isCorrect: false }
                    ],
                    explanation: 'Perfect! If outside, stay in an open area away from buildings, trees, and power lines!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'How should your family practice earthquake drills?',
                    options: [
                        { text: '🎮 Make family drills a game', isCorrect: true },
                        { text: '😰 Practice only when scared', isCorrect: false },
                        { text: '📚 Only read about it in books', isCorrect: false },
                        { text: '📺 Just watch videos', isCorrect: false }
                    ],
                    explanation: 'Great idea! Making drills a fun game helps everyone remember what to do!',
                    difficulty: 'easy',
                    points: 10
                },
                {
                    question: 'After an earthquake, what should you avoid?',
                    options: [
                        { text: '⚡ Wires and broken glass', isCorrect: true },
                        { text: '💧 Drinking water', isCorrect: false },
                        { text: '👨‍👩‍👧‍👦 Talking to family', isCorrect: false },
                        { text: '🩹 Helping someone who is hurt', isCorrect: false }
                    ],
                    explanation: 'Smart! Avoid dangerous things like electrical wires and broken glass after an earthquake!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'What should you NOT do during an earthquake?',
                    options: [
                        { text: '🏃‍♀️ Run to windows or doors', isCorrect: true },
                        { text: '🛑 Drop to the ground', isCorrect: false },
                        { text: '🛡️ Protect your head', isCorrect: false },
                        { text: '🧘 Stay calm', isCorrect: false }
                    ],
                    explanation: 'Correct! Don\'t run to windows or doors - they can be dangerous during shaking!',
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

        // Look for existing earthquake quiz and update it
        const existingQuiz = await Quiz.findOne({ 
            $or: [
                { title: /earthquake.*quiz/i },
                { moduleId: existingEarthquakeModule._id }
            ]
        });
        
        if (existingQuiz) {
            await Quiz.findByIdAndUpdate(existingQuiz._id, earthquakeQuiz);
            console.log('✅ Updated existing Earthquake Safety quiz');
        } else {
            const quiz = new Quiz(earthquakeQuiz);
            await quiz.save();
            console.log('✅ Created new Earthquake Safety quiz');
        }

        console.log('\n🎉 Earthquake Safety module update completed successfully!');
        console.log('\n📊 Summary of changes:');
        console.log('✅ Updated "Earthquake Safety" module with your specific content');
        console.log('✅ Lesson 1: Understanding Earthquake - Causes and signs');
        console.log('✅ Lesson 2: Earthquake Preparedness - Go-bag and Drop, Cover, Hold On');
        console.log('✅ Lesson 3: During and After Earthquake - Response and recovery');
        console.log('✅ Added your specific YouTube videos to each lesson');
        console.log('✅ Updated quiz with earthquake-specific questions');
        console.log('✅ Maintained 3 chapters structure');
        console.log('\n🌟 Module ID:', existingEarthquakeModule._id);
        console.log('\n📺 Videos included:');
        console.log('   • Lesson 1: https://youtu.be/dJpIU1rSOFY?si=XSBIvAnwZ9UtOVzQ');
        console.log('   • Lesson 2: https://youtu.be/MKILThtPxQs?si=f-nN0xk-IzSdb76u');
        console.log('   • Lesson 3: https://youtu.be/BLEPakj1YTY?si=DZ-CtFZypo5ON6R7');

    } catch (error) {
        console.error('❌ Error updating Earthquake Safety module:', error);
    } finally {
        await mongoose.connection.close();
    }
};

updateEarthquakeModule();