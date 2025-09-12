const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Quiz = require('./models/Quiz');

const updatePandemicModule = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Find the existing Pandemic Safety module
        const existingPandemicModule = await Module.findOne({ title: "Pandemic Safety" });
        
        if (!existingPandemicModule) {
            console.log('❌ Pandemic Safety module not found');
            return;
        }

        console.log(`🎯 Found existing Pandemic Safety module: ${existingPandemicModule._id}`);
        console.log(`📖 Current chapters: ${existingPandemicModule.chapters.length}`);

        // Updated Pandemic Safety Module with your specific content
        const updatedPandemicData = {
            title: 'Pandemic Safety',
            description: 'Learn about pandemics and how to stay safe! Simple tips to understand, prepare for, and respond to pandemics. Perfect for young safety heroes!',
            thumbnail: existingPandemicModule.thumbnail || '/images/pandemic-thumb.jpg',
            chapters: [
                {
                    title: 'Understanding Pandemics 🦠',
                    contents: [
                        {
                            type: 'text',
                            body: `🦠 **Lesson 1: Understanding Pandemics**
*Chapter 1 of 3*

**Key Points:**
A pandemic is a disease spreading across countries, like flu or COVID-19, caused by germs passing through contact or air.

✅ Spreads fast in crowds or via travel.
✅ Symptoms may include fever or cough.

**Do's and Don'ts:**
✅ **Do:** Follow trusted health updates (WHO, government).
❌ **Don't:** Trust unverified social media cures.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://www.youtube.com/watch?v=gxAaO2rsdIs', // Doctor Explains How to Prepare for a Pandemic | WIRED
                            videoMetadata: {
                                duration: 300,
                                thumbnailUrl: '/images/pandemic-understanding-thumb.jpg'
                            }
                        }
                    ]
                },
                {
                    title: 'Pandemic Preparedness 🎒',
                    contents: [
                        {
                            type: 'text',
                            body: `🎒 **Lesson 2: Pandemic Preparedness**
*Chapter 2 of 3*

**Key Points:**
Prepare with a kit of food, medicines, and masks. Plan for remote work/study and know local health rules.

✅ Stock 2 weeks of essentials.
✅ Practice handwashing and masking.

**Do's and Don'ts:**
✅ **Do:** Plan healthcare access with family.
❌ **Don't:** Hoard supplies, causing shortages.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://www.youtube.com/watch?v=d914EnpU4Fo', // How to Prepare for a Pandemic | CDC Tips
                            videoMetadata: {
                                duration: 240,
                                thumbnailUrl: '/images/pandemic-preparedness-thumb.jpg'
                            }
                        }
                    ]
                },
                {
                    title: 'During and After a Pandemic 🚨',
                    contents: [
                        {
                            type: 'text',
                            body: `🚨 **Lesson 3: During and After a Pandemic**
*Chapter 3 of 3*

**Key Points:**
During: Wear masks, isolate if sick. After: Keep hygiene, watch for stress, help community recover.

**During:** Get vaccinated, report symptoms.
**After:** Monitor mental health.

✅ Distancing cuts spread in busy places.
✅ Support recovery with safe habits.

**Do's and Don'ts:**
✅ **Do:** Follow quarantine and testing rules.
❌ **Don't:** Ignore symptoms—seek help fast.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://www.youtube.com/watch?v=1APwq1df6Mw', // Pandemic Safety: Do's and Don'ts | Health Expert
                            videoMetadata: {
                                duration: 300,
                                thumbnailUrl: '/images/pandemic-response-thumb.jpg'
                            }
                        }
                    ]
                }
            ]
        };

        // Update the existing module
        console.log('🔄 Updating existing Pandemic Safety module...');
        await Module.findByIdAndUpdate(existingPandemicModule._id, updatedPandemicData);
        console.log('✅ Successfully updated Pandemic Safety module');

        // Update the quiz to match the new content
        console.log('🧩 Updating Pandemic Safety quiz...');
        const pandemicQuiz = {
            title: 'Pandemic Safety Quiz 🦠🏥',
            description: 'Test your pandemic safety knowledge! Learn how to stay safe during health emergencies with fun questions.',
            moduleId: existingPandemicModule._id,
            difficulty: 'easy',
            status: 'published',
            questions: [
                {
                    question: 'What is a pandemic?',
                    options: [
                        { text: '🦠 A disease spreading across countries', isCorrect: true },
                        { text: '🌧️ Heavy rain in many places', isCorrect: false },
                        { text: '🔥 Fires burning everywhere', isCorrect: false },
                        { text: '❄️ Snow covering the world', isCorrect: false }
                    ],
                    explanation: 'Perfect! A pandemic is a disease that spreads across many countries, like flu or COVID-19!',
                    difficulty: 'easy',
                    points: 10
                },
                {
                    question: 'How do pandemic germs usually spread?',
                    options: [
                        { text: '🤝 Through contact or air', isCorrect: true },
                        { text: '📚 Through books only', isCorrect: false },
                        { text: '🌊 Through water only', isCorrect: false },
                        { text: '🌞 Through sunlight', isCorrect: false }
                    ],
                    explanation: 'Great! Pandemic germs spread through contact with people or through the air when people cough or sneeze!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'What are common symptoms of pandemic diseases?',
                    options: [
                        { text: '🤒 Fever or cough', isCorrect: true },
                        { text: '😴 Only feeling sleepy', isCorrect: false },
                        { text: '🍎 Wanting to eat apples', isCorrect: false },
                        { text: '🎵 Hearing music', isCorrect: false }
                    ],
                    explanation: 'Correct! Common symptoms include fever, cough, and feeling unwell - always tell an adult if you feel sick!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'Who should you trust for health information during a pandemic?',
                    options: [
                        { text: '🏥 WHO and government health experts', isCorrect: true },
                        { text: '📱 Random social media posts', isCorrect: false },
                        { text: '🎬 Movie characters', isCorrect: false },
                        { text: '🎮 Video game tips', isCorrect: false }
                    ],
                    explanation: 'Smart! Always trust official health organizations like WHO and government health experts, not social media!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'How much food and supplies should you stock for pandemic preparedness?',
                    options: [
                        { text: '📅 2 weeks of essentials', isCorrect: true },
                        { text: '📅 1 day only', isCorrect: false },
                        { text: '📅 6 months of everything', isCorrect: false },
                        { text: '📅 1 year of supplies', isCorrect: false }
                    ],
                    explanation: 'Excellent! Stock about 2 weeks of essentials - enough to be prepared but not hoarding!',
                    difficulty: 'medium',
                    points: 15
                },
                {
                    question: 'What should you practice regularly during pandemic preparedness?',
                    options: [
                        { text: '🧼 Handwashing and masking', isCorrect: true },
                        { text: '🏃‍♀️ Running marathons', isCorrect: false },
                        { text: '🎪 Circus tricks', isCorrect: false },
                        { text: '🎨 Painting pictures', isCorrect: false }
                    ],
                    explanation: 'Perfect! Practice good hygiene like handwashing and wearing masks to protect yourself and others!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'What should you NOT do when preparing for a pandemic?',
                    options: [
                        { text: '🛒 Hoard supplies, causing shortages', isCorrect: true },
                        { text: '🧼 Wash your hands regularly', isCorrect: false },
                        { text: '👨‍⚕️ Plan healthcare access', isCorrect: false },
                        { text: '😷 Practice wearing masks', isCorrect: false }
                    ],
                    explanation: 'Right! Don\'t hoard supplies - buy what you need so everyone can prepare safely!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'What should you do if you feel sick during a pandemic?',
                    options: [
                        { text: '🏠 Isolate and get vaccinated if available', isCorrect: true },
                        { text: '🎉 Go to big parties', isCorrect: false },
                        { text: '🏫 Go to school anyway', isCorrect: false },
                        { text: '🤷‍♀️ Ignore it completely', isCorrect: false }
                    ],
                    explanation: 'Great job! Stay home, isolate from others, get vaccinated if available, and tell an adult!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'What helps cut the spread of disease in busy places?',
                    options: [
                        { text: '↔️ Social distancing', isCorrect: true },
                        { text: '🤗 Hugging everyone', isCorrect: false },
                        { text: '🗣️ Talking very loudly', isCorrect: false },
                        { text: '🏃‍♀️ Running around crowds', isCorrect: false }
                    ],
                    explanation: 'Perfect! Social distancing means staying further apart from people to reduce germ spread!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'What should you monitor after a pandemic?',
                    options: [
                        { text: '🧠 Mental health and stress', isCorrect: true },
                        { text: '📺 Only TV shows', isCorrect: false },
                        { text: '🎮 Video game scores', isCorrect: false },
                        { text: '🌦️ Weather only', isCorrect: false }
                    ],
                    explanation: 'Excellent! Mental health is important - pandemics can be stressful, so talk to adults about feelings!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'What should you do if you have pandemic symptoms?',
                    options: [
                        { text: '🏥 Seek help fast, don\'t ignore them', isCorrect: true },
                        { text: '🤐 Keep it secret from adults', isCorrect: false },
                        { text: '🎪 Go to crowded places', isCorrect: false },
                        { text: '😴 Just sleep it off', isCorrect: false }
                    ],
                    explanation: 'Smart! Never ignore symptoms - tell an adult and seek medical help quickly to stay safe!',
                    difficulty: 'easy',
                    points: 15
                }
            ],
            settings: {
                timeLimit: 25,
                passingScore: 70,
                maxAttempts: 3,
                randomizeQuestions: true,
                showCorrectAnswers: true
            }
        };

        // Look for existing pandemic quiz and update it
        const existingQuiz = await Quiz.findOne({ 
            $or: [
                { title: /pandemic.*quiz/i },
                { moduleId: existingPandemicModule._id }
            ]
        });
        
        if (existingQuiz) {
            await Quiz.findByIdAndUpdate(existingQuiz._id, pandemicQuiz);
            console.log('✅ Updated existing Pandemic Safety quiz');
        } else {
            const quiz = new Quiz(pandemicQuiz);
            await quiz.save();
            console.log('✅ Created new Pandemic Safety quiz');
        }

        console.log('\n🎉 Pandemic Safety module update completed successfully!');
        console.log('\n📊 Summary of changes:');
        console.log('✅ Updated "Pandemic Safety" module with your specific content');
        console.log('✅ Lesson 1: Understanding Pandemics - Disease spread and symptoms');
        console.log('✅ Lesson 2: Pandemic Preparedness - Emergency kits and planning');
        console.log('✅ Lesson 3: During and After Pandemic - Response and recovery');
        console.log('✅ Added expert educational videos to each lesson');
        console.log('✅ Updated quiz with pandemic-specific questions');
        console.log('✅ Maintained 3 chapters structure');
        console.log('\n🌟 Module ID:', existingPandemicModule._id);
        console.log('\n📺 Videos included:');
        console.log('   • Lesson 1: Doctor Explains How to Prepare for a Pandemic | WIRED (5-min)');
        console.log('   • Lesson 2: How to Prepare for a Pandemic | CDC Tips (4-min)');
        console.log('   • Lesson 3: Pandemic Safety: Do\'s and Don\'ts | Health Expert (5-min)');

    } catch (error) {
        console.error('❌ Error updating Pandemic Safety module:', error);
    } finally {
        await mongoose.connection.close();
    }
};

updatePandemicModule();