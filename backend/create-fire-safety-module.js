const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Quiz = require('./models/Quiz');

const createFireSafetyModule = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Enhanced Fire Safety Module with Kid-Friendly Content
        const fireSafetyModule = {
            title: 'Fire Safety Fundamentals',
            description: 'Learn how to stay safe around fire! Discover fun ways to prevent fires and know what to do in case of emergencies.',
            thumbnail: '/images/fire-safety-thumb.jpg',
            chapters: [
                {
                    title: 'What is Fire? 🔥',
                    contents: [
                        {
                            type: 'text',
                            body: `🔥 **Welcome to Fire Safety!**

Fire is amazing but can be dangerous too! Let's learn about it together.

**What makes fire happen?**
Fire needs three special things to exist - we call this the "Fire Triangle":

✓ **Heat** - Like a match or spark
✓ **Fuel** - Things that can burn (wood, paper, gas)
✓ **Oxygen** - The air we breathe

If we remove any one of these three things, the fire cannot survive! This is how firefighters put out fires.

**Fun Fact:** Fire has been helping humans for thousands of years! We use it for cooking, warmth, and light.`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://www.youtube.com/watch?v=BybXqkbgBA4', // Fire Triangle educational video for kids
                            videoMetadata: {
                                duration: 240,
                                thumbnailUrl: '/images/fire-triangle-kids.jpg'
                            }
                        },
                        {
                            type: 'text',
                            body: `🎯 **Remember the Fire Triangle:**
- Heat + Fuel + Oxygen = Fire
- Remove one element = No fire!

This knowledge helps us both prevent fires and know how to stop them safely.`
                        }
                    ]
                },
                {
                    title: 'Fire Prevention - Be a Safety Hero! 🦸‍♀️🦸‍♂️',
                    contents: [
                        {
                            type: 'text',
                            body: `🦸‍♀️ **Become a Fire Safety Superhero!**

The best way to stay safe from fire is to prevent it from starting in the first place. Here's how you can be a hero:

**🏠 At Home Safety Rules:**

✓ **Kitchen Safety**
  • Never cook without an adult
  • Keep pot handles turned inward
  • Stay away from the stove when adults are cooking
  • Clean up spills immediately

✓ **Electrical Safety**
  • Don't put too many plugs in one outlet
  • Tell an adult if you see damaged wires
  • Keep electronics away from water
  • Unplug devices when not in use

✓ **Around the House**
  • Keep matches and lighters away from children
  • Don't play near candles or fireplaces
  • Keep exit paths clear and clean`
                        },
                        {
                            type: 'image',
                            imageUrl: '/images/fire-prevention-kids.jpg'
                        },
                        {
                            type: 'text',
                            body: `🔥 **Fire Prevention Checklist:**

📋 Things to check at home (with your family):
□ Smoke detectors work (test monthly!)
□ Fire extinguisher is in the kitchen
□ Exit routes are planned and practiced
□ Important papers are in a safe place
□ Emergency phone numbers are posted

🌟 **Remember:** Prevention is always better than cure! Small actions can prevent big problems.`
                        }
                    ]
                },
                {
                    title: 'What to Do in a Fire Emergency! 🚨',
                    contents: [
                        {
                            type: 'text',
                            body: `🚨 **Emergency Action Plan - Stay Calm and Be Smart!**

If there's a fire, remember these important steps:

**🔥 Step 1: GET OUT FAST!**
• Don't try to fight the fire yourself
• Leave everything behind - things can be replaced, you cannot!
• If there's smoke, crawl low under the smoke to breathe better
• Feel doors with the back of your hand - if hot, find another way out

**📱 Step 2: CALL FOR HELP!**
• Once you're safe outside, call emergency services
• In India: Call **101** for Fire Emergency
• In USA: Call **911**
• Give them your address and tell them about the fire

**🏠 Step 3: STAY OUT!**
• Never go back inside for any reason
• Meet your family at your planned meeting spot
• Wait for firefighters to say it's safe`
                        },
                        {
                            type: 'video',
                            videoUrl: 'https://www.youtube.com/watch?v=kBdP33Vb6lQ', // Fire escape plan for kids
                            videoMetadata: {
                                duration: 180,
                                thumbnailUrl: '/images/fire-escape-kids.jpg'
                            }
                        },
                        {
                            type: 'text',
                            body: `🎯 **Special Emergency Tips:**

**If your clothes catch fire:**
🛑 **STOP** - Don't run!
🤸‍♀️ **DROP** - Drop to the ground
🔄 **ROLL** - Roll back and forth to put out flames

**If you're trapped:**
• Close the door between you and the fire
• Put a wet cloth under the door crack
• Go to a window and call for help
• Wave a bright cloth to get attention

**Remember:** Practice makes perfect! Have fire drills at home with your family.`
                        }
                    ]
                }
            ]
        };

        console.log('🔥 Creating/updating Fire Safety module...');
        
        // Check if Fire Safety module exists
        let existingModule = await Module.findOne({ title: 'Fire Safety Fundamentals' });
        
        if (existingModule) {
            // Update existing module
            await Module.findByIdAndUpdate(existingModule._id, fireSafetyModule);
            existingModule = await Module.findById(existingModule._id);
            console.log('🔄 Updated Fire Safety module');
        } else {
            // Create new module
            existingModule = new Module(fireSafetyModule);
            await existingModule.save();
            console.log('✅ Created new Fire Safety module');
        }

        // Create enhanced Fire Safety Quiz
        const fireSafetyQuiz = {
            title: 'Fire Safety Heroes Quiz 🔥🦸‍♀️',
            description: 'Test your fire safety knowledge and become a certified Fire Safety Hero! Fun questions for young safety champions.',
            moduleId: existingModule._id,
            difficulty: 'easy',
            status: 'published',
            questions: [
                {
                    question: 'What are the three things fire needs to exist? (The Fire Triangle)',
                    options: [
                        { text: '🔥 Heat, Fuel, and Oxygen', isCorrect: true },
                        { text: '💧 Heat, Water, and Air', isCorrect: false },
                        { text: '🌪️ Wind, Fuel, and Water', isCorrect: false },
                        { text: '⚡ Electricity, Gas, and Heat', isCorrect: false }
                    ],
                    explanation: 'Great job! Fire needs Heat, Fuel, and Oxygen to exist. Remove any one of these and the fire will go out!',
                    difficulty: 'easy',
                    points: 10
                },
                {
                    question: 'What should you do FIRST when you discover a fire at home?',
                    options: [
                        { text: '🏃‍♀️ Get out of the house immediately', isCorrect: true },
                        { text: '💧 Try to put it out with water', isCorrect: false },
                        { text: '📱 Take photos for social media', isCorrect: false },
                        { text: '🎒 Pack your favorite toys', isCorrect: false }
                    ],
                    explanation: 'Perfect! Your safety comes first. Get out immediately and call for help from a safe place outside.',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'If your clothes catch fire, what should you do?',
                    options: [
                        { text: '🛑 Stop, Drop, and Roll', isCorrect: true },
                        { text: '🏃‍♀️ Run as fast as you can', isCorrect: false },
                        { text: '💨 Wave your arms to put it out', isCorrect: false },
                        { text: '💧 Jump in the swimming pool', isCorrect: false }
                    ],
                    explanation: 'Excellent! Stop, Drop, and Roll helps put out the fire. Running makes fire worse because it adds oxygen!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'What number should you call for fire emergency in India?',
                    options: [
                        { text: '📞 101', isCorrect: true },
                        { text: '📞 102', isCorrect: false },
                        { text: '📞 108', isCorrect: false },
                        { text: '📞 100', isCorrect: false }
                    ],
                    explanation: 'Well done! 101 is the fire emergency number in India. Remember it well!',
                    difficulty: 'easy',
                    points: 10
                },
                {
                    question: 'Where is the safest place to meet your family during a fire emergency?',
                    options: [
                        { text: '🏠 At a planned meeting spot outside your house', isCorrect: true },
                        { text: '🛏️ In your bedroom', isCorrect: false },
                        { text: '🚗 In the garage', isCorrect: false },
                        { text: '🏠 In the basement', isCorrect: false }
                    ],
                    explanation: 'Great thinking! Always meet at a planned spot OUTSIDE and away from the house where everyone can be safe.',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'How often should smoke detector batteries be tested?',
                    options: [
                        { text: '📅 Every month', isCorrect: true },
                        { text: '📅 Once a year', isCorrect: false },
                        { text: '📅 Every 6 months', isCorrect: false },
                        { text: '📅 Never - they test themselves', isCorrect: false }
                    ],
                    explanation: 'Perfect! Test smoke detectors monthly to make sure they work. They are your first warning system!',
                    difficulty: 'medium',
                    points: 15
                },
                {
                    question: 'If you see smoke coming under a door during a fire, what should you do?',
                    options: [
                        { text: '🚪 Don\'t open it - find another exit', isCorrect: true },
                        { text: '🚪 Open it quickly and run through', isCorrect: false },
                        { text: '💧 Pour water under the door', isCorrect: false },
                        { text: '🗣️ Shout for help through the door', isCorrect: false }
                    ],
                    explanation: 'Smart choice! Smoke under a door means fire is on the other side. Find another safe way out!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'What should you never do during a fire emergency?',
                    options: [
                        { text: '🔄 Go back inside for belongings', isCorrect: true },
                        { text: '📱 Call for help', isCorrect: false },
                        { text: '🏃‍♀️ Leave the building', isCorrect: false },
                        { text: '👨‍👩‍👧‍👦 Meet your family outside', isCorrect: false }
                    ],
                    explanation: 'Absolutely right! NEVER go back inside for things. Objects can be replaced, but you cannot!',
                    difficulty: 'easy',
                    points: 15
                },
                {
                    question: 'When crawling under smoke, you should:',
                    options: [
                        { text: '⬇️ Stay as low as possible to breathe cleaner air', isCorrect: true },
                        { text: '⬆️ Stand up tall to see better', isCorrect: false },
                        { text: '🐨 Crawl on your back', isCorrect: false },
                        { text: '🏃‍♀️ Run in a crouched position', isCorrect: false }
                    ],
                    explanation: 'Excellent! Smoke rises up, so cleaner air is closer to the floor. Crawl low and stay safe!',
                    difficulty: 'medium',
                    points: 20
                },
                {
                    question: 'Who are the brave people who fight fires and keep us safe?',
                    options: [
                        { text: '🚒 Firefighters', isCorrect: true },
                        { text: '👮‍♀️ Police officers', isCorrect: false },
                        { text: '🏥 Doctors', isCorrect: false },
                        { text: '🏫 Teachers', isCorrect: false }
                    ],
                    explanation: 'Yes! Firefighters are our heroes who risk their lives to keep us safe. Always listen to them during emergencies!',
                    difficulty: 'easy',
                    points: 10
                }
            ],
            settings: {
                timeLimit: 15,
                passingScore: 70,
                maxAttempts: 3,
                randomizeQuestions: true,
                showCorrectAnswers: true
            }
        };

        console.log('🧩 Creating/updating Fire Safety quiz...');
        const existingQuiz = await Quiz.findOne({ title: 'Fire Safety Heroes Quiz 🔥🦸‍♀️' });
        
        if (existingQuiz) {
            await Quiz.findByIdAndUpdate(existingQuiz._id, fireSafetyQuiz);
            console.log('🔄 Updated Fire Safety quiz');
        } else {
            const quiz = new Quiz(fireSafetyQuiz);
            await quiz.save();
            console.log('✅ Created Fire Safety quiz');
        }

        console.log('\n🎉 Fire Safety module enhancement completed!');
        console.log('\n📊 What was updated:');
        console.log('✅ Chapter 1: What is Fire? - Fun introduction with Fire Triangle');
        console.log('✅ Chapter 2: Fire Prevention - Be a Safety Hero (Enhanced with kid-friendly content)');
        console.log('✅ Chapter 3: Emergency Response - What to Do in Fire Emergency (Enhanced with interactive tips)');
        console.log('✅ Chapters 4 & 5: Removed (only 3 chapters now as requested)');
        console.log('✅ Added educational videos below chapter content');
        console.log('✅ Created kid-friendly quiz with emojis and engaging questions');
        console.log('✅ Improved CSS-friendly content structure');
        console.log('\n🌟 Module now features:');
        console.log('   • Kid-friendly language and emojis');
        console.log('   • Interactive content and checklists');
        console.log('   • Educational videos');
        console.log('   • Emergency action plans');
        console.log('   • Fun quiz with immediate feedback');

    } catch (error) {
        console.error('❌ Error creating Fire Safety module:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createFireSafetyModule();