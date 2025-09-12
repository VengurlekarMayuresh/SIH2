const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Quiz = require('./models/Quiz');

const cleanAllModules = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Clean Fire Safety Module
        console.log('🔥 Cleaning Fire Safety module...');
        const fireModule = await Module.findOne({ title: "Fire Safety" });
        if (fireModule) {
            const cleanFireData = {
                title: 'Fire Safety',
                description: 'Learn about fire safety! Simple tips to understand, prevent, and respond to fires.',
                thumbnail: fireModule.thumbnail,
                chapters: [
                    {
                        title: 'Understanding Fire',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 1: Understanding Fire
Chapter 1 of 3

Key Points:
Fire needs three things to exist: heat, fuel, and oxygen. This is called the fire triangle. Fire helps us cook and stay warm, but can be dangerous.

✅ Heat comes from matches or sparks
✅ Fuel is things that burn like wood and paper
✅ Oxygen is the air we breathe

Do's and Don'ts:
Do: Learn about fire safety from adults
Don't: Play with matches or lighters`
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=BybXqkbgBA4',
                                videoMetadata: {
                                    duration: 240,
                                    thumbnailUrl: '/images/fire-triangle-kids.jpg'
                                }
                            }
                        ]
                    },
                    {
                        title: 'Fire Prevention',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 2: Fire Prevention
Chapter 2 of 3

Key Points:
Prevention is the best way to stay safe from fire. Keep your home safe by following simple rules and checking safety equipment regularly.

✅ Test smoke detectors monthly
✅ Keep matches away from children
✅ Don't put too many plugs in one outlet
✅ Clean up spills quickly

Do's and Don'ts:
Do: Make an escape plan with your family
Don't: Cook without an adult helping you`
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=kBdP33Vb6lQ',
                                videoMetadata: {
                                    duration: 180,
                                    thumbnailUrl: '/images/fire-prevention-kids.jpg'
                                }
                            }
                        ]
                    },
                    {
                        title: 'Fire Emergency Response',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 3: Fire Emergency Response
Chapter 3 of 3

Key Points:
If there's a fire, get out fast and call for help. Remember: things can be replaced, but you cannot!

Step 1: GET OUT FAST - Don't try to fight the fire
Step 2: CALL FOR HELP - Call 101 in India or 911 in USA
Step 3: STAY OUT - Wait for firefighters

If your clothes catch fire:
STOP - Don't run
DROP - Drop to the ground
ROLL - Roll back and forth

Do's and Don'ts:
Do: Meet your family at a planned safe spot outside
Don't: Go back inside for anything`
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=kBdP33Vb6lQ',
                                videoMetadata: {
                                    duration: 180,
                                    thumbnailUrl: '/images/fire-escape-kids.jpg'
                                }
                            }
                        ]
                    }
                ]
            };
            await Module.findByIdAndUpdate(fireModule._id, cleanFireData);
            console.log('✅ Cleaned Fire Safety module');
        }

        // Clean Earthquake Safety Module
        console.log('🌍 Cleaning Earthquake Safety module...');
        const earthquakeModule = await Module.findOne({ title: "Earthquake Safety" });
        if (earthquakeModule) {
            const cleanEarthquakeData = {
                title: 'Earthquake Safety',
                description: 'Learn about earthquake safety! Simple tips to understand, prepare for, and respond to earthquakes.',
                thumbnail: earthquakeModule.thumbnail,
                chapters: [
                    {
                        title: 'Understanding Earthquakes',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 1: Understanding Earthquakes
Chapter 1 of 3

Key Points:
An earthquake is when the ground shakes because rocks deep in Earth move. It lasts seconds or minutes. Small ones wiggle, big ones knock things over.

✅ You might hear a rumble or feel dizzy
✅ Earth's plates slip and cause shakes
✅ Most earthquakes are small and not dangerous

Do's and Don'ts:
Do: Listen to news for earthquake information
Don't: Panic - most earthquakes are small`
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
                        title: 'Earthquake Preparedness',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 2: Earthquake Preparedness
Chapter 2 of 3

Key Points:
Plan ahead with a go-bag and safe spots. Practice "Drop, Cover, Hold On": drop down, cover under table, hold tight.

✅ Pack water, snacks, and flashlight in your go-bag
✅ Secure heavy furniture to walls
✅ Know where safe spots are in each room

Do's and Don'ts:
Do: Make family earthquake drills fun like a game
Don't: Put your bed near windows that can break`
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
                        title: 'During and After Earthquakes',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 3: During and After Earthquakes
Chapter 3 of 3

Key Points:
During: Drop, Cover, Hold On until shaking stops. After: Check for dangers like broken glass or fires and wait for the all-clear.

During an earthquake:
- Protect your head and stay away from falling things
- If inside: Drop, Cover, Hold On
- If outside: Stay in open area away from buildings

After an earthquake:
- Check for injuries and dangers
- Stay away from broken wires and glass
- Help others if it's safe

✅ Aftershocks can happen after the main earthquake
✅ Stay calm and drink water if you have it

Do's and Don'ts:
Do: Stay inside unless you're already outside in an open area
Don't: Run to windows or doors during shaking`
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
            await Module.findByIdAndUpdate(earthquakeModule._id, cleanEarthquakeData);
            console.log('✅ Cleaned Earthquake Safety module');
        }

        // Clean Flood Safety Module
        console.log('🌊 Cleaning Flood Safety module...');
        const floodModule = await Module.findOne({ title: "Flood Safety" });
        if (floodModule) {
            const cleanFloodData = {
                title: 'Flood Safety',
                description: 'Learn about flood safety! Simple tips to understand, prepare for, and respond to floods.',
                thumbnail: floodModule.thumbnail,
                chapters: [
                    {
                        title: 'Understanding Floods',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 1: Understanding Floods
Chapter 1 of 3

Key Points:
A flood is when heavy rain or rivers overflow, covering dry land like streets. It can be slow or super fast (flash flood), damaging homes.

✅ Just 6 inches of water can knock you down
✅ Floods carry germs, making water unsafe to touch
✅ Floods happen when there's too much water for the ground to absorb

Do's and Don'ts:
Do: Check weather reports daily for flood warnings
Don't: Ignore flood alerts - they're important for safety`
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=TvMS_ykiLiQ',
                                videoMetadata: {
                                    duration: 240,
                                    thumbnailUrl: '/images/flood-understanding-thumb.jpg'
                                }
                            }
                        ]
                    },
                    {
                        title: 'Flood Preparedness',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 2: Flood Preparedness
Chapter 2 of 3

Key Points:
Plan ahead with a go-bag (water, snacks, flashlight, important papers) and know high spots to escape to. Secure outdoor items that could float away.

✅ Get weather alerts on your phone or radio
✅ Pick a safe family meeting spot on high ground
✅ Know which routes lead to higher, safer areas

Do's and Don'ts:
Do: Draw a map of safe escape routes with your family
Don't: Wait until it's raining to pack your emergency bag`
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=pMXVX2ANKnQ',
                                videoMetadata: {
                                    duration: 300,
                                    thumbnailUrl: '/images/flood-preparedness-thumb.jpg'
                                }
                            }
                        ]
                    },
                    {
                        title: 'During and After Floods',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 3: During and After Floods
Chapter 3 of 3

Key Points:
During: Get to high ground and avoid water. After: Wait for the safety all-clear, check for damage, and boil water before drinking.

During a flood:
- Turn off electricity if you can do it safely
- Get to the highest ground possible
- Stay away from moving water

After a flood:
- Avoid dirty flood water and dangerous areas
- Wait for officials to say it's safe to return home
- Check for damage but be careful

✅ 12 inches of water can float a car - never drive through floods
✅ Floodwater has germs and bacteria - don't touch it

Do's and Don'ts:
Do: Listen to radio or emergency alerts for updates
Don't: Go back home until authorities say it's safe`
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=kFlzYQ0mp3g',
                                videoMetadata: {
                                    duration: 360,
                                    thumbnailUrl: '/images/flood-response-thumb.jpg'
                                }
                            }
                        ]
                    }
                ]
            };
            await Module.findByIdAndUpdate(floodModule._id, cleanFloodData);
            console.log('✅ Cleaned Flood Safety module');
        }

        // Clean Pandemic Safety Module
        console.log('🦠 Cleaning Pandemic Safety module...');
        const pandemicModule = await Module.findOne({ title: "Pandemic Safety" });
        if (pandemicModule) {
            const cleanPandemicData = {
                title: 'Pandemic Safety',
                description: 'Learn about pandemic safety! Simple tips to understand, prepare for, and respond to health emergencies.',
                thumbnail: pandemicModule.thumbnail,
                chapters: [
                    {
                        title: 'Understanding Pandemics',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 1: Understanding Pandemics
Chapter 1 of 3

Key Points:
A pandemic is a disease spreading across countries, like flu or COVID-19, caused by germs passing through contact or air.

✅ Diseases spread fast in crowds or through travel
✅ Common symptoms include fever, cough, or feeling sick
✅ Germs can spread when people cough, sneeze, or touch things

Do's and Don'ts:
Do: Follow trusted health updates from WHO or government health experts
Don't: Trust unverified information from social media`
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=gxAaO2rsdIs',
                                videoMetadata: {
                                    duration: 300,
                                    thumbnailUrl: '/images/pandemic-understanding-thumb.jpg'
                                }
                            }
                        ]
                    },
                    {
                        title: 'Pandemic Preparedness',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 2: Pandemic Preparedness
Chapter 2 of 3

Key Points:
Prepare with a kit of food, medicines, and masks. Plan for remote work or study and know local health rules.

✅ Stock about 2 weeks of food and essential supplies
✅ Practice handwashing properly and learn to wear masks
✅ Know how to contact your doctor or local health services

Do's and Don'ts:
Do: Plan how your family will get healthcare if needed
Don't: Buy too many supplies - save some for other families`
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=d914EnpU4Fo',
                                videoMetadata: {
                                    duration: 240,
                                    thumbnailUrl: '/images/pandemic-preparedness-thumb.jpg'
                                }
                            }
                        ]
                    },
                    {
                        title: 'During and After Pandemics',
                        contents: [
                            {
                                type: 'text',
                                body: `Lesson 3: During and After Pandemics
Chapter 3 of 3

Key Points:
During: Wear masks, stay home if sick, get vaccinated when available. After: Keep good hygiene habits, watch for stress, and help community recover.

During a pandemic:
- Get vaccinated when vaccines are available
- Report symptoms to adults and doctors
- Stay away from others if you feel sick

After a pandemic:
- Keep washing hands and staying healthy
- Talk to adults about any worries or stress
- Help your community get back to normal safely

✅ Staying apart from others in crowds helps stop disease spread
✅ Supporting recovery means keeping safe habits even after

Do's and Don'ts:
Do: Follow quarantine rules and get tested when needed
Don't: Ignore symptoms - tell an adult right away if you feel sick`
                            },
                            {
                                type: 'video',
                                videoUrl: 'https://www.youtube.com/watch?v=1APwq1df6Mw',
                                videoMetadata: {
                                    duration: 300,
                                    thumbnailUrl: '/images/pandemic-response-thumb.jpg'
                                }
                            }
                        ]
                    }
                ]
            };
            await Module.findByIdAndUpdate(pandemicModule._id, cleanPandemicData);
            console.log('✅ Cleaned Pandemic Safety module');
        }

        console.log('\n🎉 All modules have been cleaned and simplified!');
        console.log('\n📊 What was cleaned:');
        console.log('✅ Removed unnecessary emojis and complex formatting');
        console.log('✅ Simplified language to be more direct and clear');
        console.log('✅ Kept essential safety information');
        console.log('✅ Maintained chapter structure consistency');
        console.log('✅ Preserved educational videos');
        console.log('\nAll modules now have clean, simple, kid-friendly content! 🌟');

    } catch (error) {
        console.error('❌ Error cleaning modules:', error);
    } finally {
        await mongoose.connection.close();
    }
};

cleanAllModules();