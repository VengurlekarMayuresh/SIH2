const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');

const checkEarthquakeModule = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Find earthquake module
        const earthquakeModule = await Module.findOne({ title: "Earthquake Safety" });
        
        if (earthquakeModule) {
            console.log(`🌍 Earthquake Safety Module Details:`);
            console.log(`   ID: ${earthquakeModule._id}`);
            console.log(`   Description: ${earthquakeModule.description}`);
            console.log(`   Chapters: ${earthquakeModule.chapters.length}`);
            console.log('');
            
            earthquakeModule.chapters.forEach((chapter, index) => {
                console.log(`📖 Chapter ${index + 1}: "${chapter.title}"`);
                console.log(`   Contents: ${chapter.contents.length} items`);
                chapter.contents.forEach((content, contentIndex) => {
                    if (content.type === 'video') {
                        console.log(`   📺 Video ${contentIndex + 1}: ${content.videoUrl}`);
                    } else if (content.type === 'text') {
                        console.log(`   📝 Text ${contentIndex + 1}: ${content.body.substring(0, 50)}...`);
                    }
                });
                console.log('');
            });
        } else {
            console.log('❌ Earthquake Safety module not found');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

checkEarthquakeModule();