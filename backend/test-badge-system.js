const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./models/Student');
const Badge = require('./models/Badge');
const StudentBadge = require('./models/StudentBadge');

const testBadgeSystem = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if badges exist
        const badges = await Badge.find();
        console.log(`📋 Found ${badges.length} badges in database`);

        if (badges.length === 0) {
            console.log('❌ No badges found! Run initialize-badges.js first.');
            return;
        }

        // Show available badges
        console.log('\n🏆 Available badges:');
        badges.forEach(badge => {
            console.log(`- ${badge.name}: ${badge.description}`);
            console.log(`  Criteria: ${JSON.stringify(badge.criteria, null, 2)}`);
        });

        console.log('\n✅ Badge system is properly initialized and ready!');

    } catch (error) {
        console.error('❌ Error testing badge system:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

testBadgeSystem();
