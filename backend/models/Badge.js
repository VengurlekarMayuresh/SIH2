const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        required: true, // URL to badge icon/image
        trim: true
    },
    category: {
        type: String,
        enum: [
            'quiz_completion',    // Completing quizzes
            'high_achiever',      // High scores
            'speed_demon',        // Fast completion
            'perfectionist',      // Perfect scores
            'streak_master',      // Consecutive achievements
            'dedication',         // Regular participation
            'improvement',        // Score improvements
            'explorer',           // Trying multiple modules
            'safety_expert',      // Safety-specific achievements
            'special'             // Special event badges
        ],
        required: true
    },
    type: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
        required: true
    },
    criteria: {
        // Flexible criteria object to define how badge is earned
        quizCount: {
            type: Number,
            min: 0
        },
        minScore: {
            type: Number,
            min: 0,
            max: 100
        },
        maxTime: {
            type: Number, // Maximum time in seconds to earn badge
            min: 0
        },
        streakCount: {
            type: Number,
            min: 0
        },
        moduleCount: {
            type: Number,
            min: 0
        },
        perfectScore: {
            type: Boolean,
            default: false
        },
        consecutivePerfect: {
            type: Number,
            min: 0
        },
        improvementPercent: {
            type: Number,
            min: 0
        }
    },
    points: {
        type: Number,
        required: true,
        min: 0,
        default: 10 // Points awarded when badge is earned
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: false // Can be system-wide badges
    }
}, {
    timestamps: true
});

// Index for efficient queries
badgeSchema.index({ category: 1, type: 1 });
badgeSchema.index({ isActive: 1 });

// Static method to create default system badges
badgeSchema.statics.createDefaultBadges = async function() {
    const defaultBadges = [
        // Quiz Completion Badges
        {
            name: "First Steps",
            description: "Complete your first quiz",
            icon: "🎯",
            category: "quiz_completion",
            type: "bronze",
            criteria: { quizCount: 1 },
            points: 10,
            rarity: "common"
        },
        {
            name: "Quiz Explorer",
            description: "Complete 5 quizzes",
            icon: "🧭",
            category: "quiz_completion",
            type: "silver",
            criteria: { quizCount: 5 },
            points: 25,
            rarity: "uncommon"
        },
        {
            name: "Quiz Master",
            description: "Complete 25 quizzes",
            icon: "👑",
            category: "quiz_completion",
            type: "gold",
            criteria: { quizCount: 25 },
            points: 100,
            rarity: "rare"
        },
        
        // High Achiever Badges
        {
            name: "High Scorer",
            description: "Score 90% or higher on a quiz",
            icon: "⭐",
            category: "high_achiever",
            type: "bronze",
            criteria: { minScore: 90 },
            points: 15,
            rarity: "common"
        },
        {
            name: "Academic Excellence",
            description: "Score 95% or higher on 3 quizzes",
            icon: "🌟",
            category: "high_achiever",
            type: "silver",
            criteria: { minScore: 95, quizCount: 3 },
            points: 50,
            rarity: "uncommon"
        },
        
        // Perfectionist Badges
        {
            name: "Perfect Score",
            description: "Get 100% on any quiz",
            icon: "💯",
            category: "perfectionist",
            type: "silver",
            criteria: { perfectScore: true },
            points: 30,
            rarity: "uncommon"
        },
        {
            name: "Flawless Streak",
            description: "Get 100% on 3 consecutive quizzes",
            icon: "🔥",
            category: "perfectionist",
            type: "gold",
            criteria: { consecutivePerfect: 3 },
            points: 75,
            rarity: "rare"
        },
        
        // Speed Badges
        {
            name: "Lightning Fast",
            description: "Complete a quiz in under 2 minutes",
            icon: "⚡",
            category: "speed_demon",
            type: "bronze",
            criteria: { maxTime: 120 },
            points: 20,
            rarity: "common"
        },
        {
            name: "Speed Racer",
            description: "Complete a quiz in under 1 minute",
            icon: "🏎️",
            category: "speed_demon",
            type: "gold",
            criteria: { maxTime: 60 },
            points: 60,
            rarity: "rare"
        },
        
        // Streak Badges
        {
            name: "On Fire",
            description: "Pass 5 quizzes in a row",
            icon: "🔥",
            category: "streak_master",
            type: "silver",
            criteria: { streakCount: 5 },
            points: 40,
            rarity: "uncommon"
        },
        {
            name: "Unstoppable",
            description: "Pass 10 quizzes in a row",
            icon: "🚀",
            category: "streak_master",
            type: "gold",
            criteria: { streakCount: 10 },
            points: 80,
            rarity: "rare"
        },
        
        // Explorer Badges
        {
            name: "Safety Explorer",
            description: "Complete quizzes from 3 different modules",
            icon: "🗺️",
            category: "explorer",
            type: "silver",
            criteria: { moduleCount: 3 },
            points: 35,
            rarity: "uncommon"
        },
        
        // Safety Expert Badges
        {
            name: "Fire Safety Expert",
            description: "Master fire safety with perfect scores",
            icon: "🧯",
            category: "safety_expert",
            type: "gold",
            criteria: { perfectScore: true },
            points: 50,
            rarity: "rare"
        },
        
        // Special Badges
        {
            name: "Early Adopter",
            description: "One of the first 100 students to use the platform",
            icon: "🌟",
            category: "special",
            type: "platinum",
            criteria: {},
            points: 100,
            rarity: "legendary"
        }
    ];
    
    for (const badgeData of defaultBadges) {
        await this.findOneAndUpdate(
            { name: badgeData.name },
            badgeData,
            { upsert: true, new: true }
        );
    }
};

// Instance method to check if criteria is met
badgeSchema.methods.checkCriteria = function(studentStats) {
    const criteria = this.criteria;
    
    // Check quiz count
    if (criteria.quizCount && studentStats.totalQuizzes < criteria.quizCount) {
        return false;
    }
    
    // Check minimum score
    if (criteria.minScore && studentStats.highestScore < criteria.minScore) {
        return false;
    }
    
    // Check maximum time
    if (criteria.maxTime && studentStats.fastestTime > criteria.maxTime) {
        return false;
    }
    
    // Check streak count
    if (criteria.streakCount && studentStats.currentStreak < criteria.streakCount) {
        return false;
    }
    
    // Check module count
    if (criteria.moduleCount && studentStats.uniqueModules < criteria.moduleCount) {
        return false;
    }
    
    // Check perfect score
    if (criteria.perfectScore && !studentStats.hasPerfectScore) {
        return false;
    }
    
    // Check consecutive perfect scores
    if (criteria.consecutivePerfect && studentStats.consecutivePerfect < criteria.consecutivePerfect) {
        return false;
    }
    
    return true;
};

const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;
