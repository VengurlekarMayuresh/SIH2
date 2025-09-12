const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');

const checkFloodModule = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Find flood module
        const floodModule = await Module.findOne({ title: "Flood Safety" });
        
        if (floodModule) {
            console.log(`🌊 Flood Safety Module Details:`);
            console.log(`   ID: ${floodModule._id}`);
            console.log(`   Description: ${floodModule.description}`);
            console.log(`   Chapters: ${floodModule.chapters.length}`);
            console.log('');
            
            floodModule.chapters.forEach((chapter, index) => {
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
            console.log('❌ Flood Safety module not found');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

checkFloodModule();