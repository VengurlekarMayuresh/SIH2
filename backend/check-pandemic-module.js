const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');

const checkPandemicModule = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Find pandemic module
        const pandemicModule = await Module.findOne({ title: "Pandemic Safety" });
        
        if (pandemicModule) {
            console.log(`🦠 Pandemic Safety Module Details:`);
            console.log(`   ID: ${pandemicModule._id}`);
            console.log(`   Description: ${pandemicModule.description}`);
            console.log(`   Chapters: ${pandemicModule.chapters.length}`);
            console.log('');
            
            pandemicModule.chapters.forEach((chapter, index) => {
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
            console.log('❌ Pandemic Safety module not found');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

checkPandemicModule();