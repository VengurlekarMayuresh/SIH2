const mongoose = require('mongoose');
const Badge = require('./models/Badge');
require('dotenv').config();

const initializeBadges = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🏆 Initializing default badges...');
        await Badge.createDefaultBadges();
        console.log('✅ Default badges created/updated successfully!');

        // List all badges
        const badges = await Badge.find().select('name category type points');
        console.log('\n📋 Available badges:');
        badges.forEach(badge => {
            console.log(`- ${badge.name} (${badge.category}, ${badge.type}, ${badge.points} pts)`);
        });

        console.log(`\n🎉 Total badges available: ${badges.length}`);
        
    } catch (error) {
        console.error('❌ Error initializing badges:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

initializeBadges();
