const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Quiz = require('./models/Quiz');

const checkAndUpdateFireModule = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // First, let's see all existing modules
        console.log('📚 Checking all existing modules...');
        const allModules = await Module.find({});
        console.log('Found modules:');
        allModules.forEach((module, index) => {
            console.log(`${index + 1}. "${module.title}" (ID: ${module._id})`);
            console.log(`   Description: ${module.description}`);
            console.log(`   Chapters: ${module.chapters.length}`);
            console.log('');
        });

        // Look for Fire Safety modules (both old and new)
        const fireModules = await Module.find({ 
            title: { $regex: /fire.*safety/i } 
        });
        
        console.log('🔥 Found Fire Safety related modules:');
        fireModules.forEach((module, index) => {
            console.log(`${index + 1}. "${module.title}" (ID: ${module._id})`);
            console.log(`   Chapters: ${module.chapters.length}`);
            module.chapters.forEach((chapter, chIndex) => {
                console.log(`   Chapter ${chIndex + 1}: "${chapter.title}"`);
            });
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

checkAndUpdateFireModule();