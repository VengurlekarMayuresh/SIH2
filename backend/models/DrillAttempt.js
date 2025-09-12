const mongoose = require('mongoose');

const drillAttemptSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    drillType: {
        type: String,
        required: true,
        enum: ['flood', 'fire', 'earthquake', 'pandemic', 'cyclone', 'landslide', 'road', 'crowd', 'lightning']
    },
    attemptNumber: {
        type: Number,
        required: true,
        default: 1
    },
    score: {
        xp: {
            type: Number,
            required: true,
            default: 0
        },
        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        maxPossibleScore: {
            type: Number,
            required: true
        },
        passed: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    badge: {
        name: String,
        color: String,
        icon: String
    },
    pathTaken: [{
        nodeKey: String,
        choiceText: String,
        choiceIndex: Number,
        xpGained: Number,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    timing: {
        startTime: {
            type: Date,
            default: Date.now
        },
        endTime: {
            type: Date
        },
        totalTimeSpent: {
            type: Number, // in seconds
            default: 0
        }
    },
    endState: {
        type: String,
        required: true
    },
    metadata: {
        scenarioCount: Number,
        optimalPathFollowed: {
            type: Boolean,
            default: false
        },
        helpedOthers: {
            type: Boolean,
            default: false
        },
        followedProtocols: {
            type: Boolean,
            default: false
        },
        userAgent: String,
        ipAddress: String
    },
    status: {
        type: String,
        enum: ['completed', 'abandoned'],
        default: 'completed'
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
drillAttemptSchema.index({ student: 1, drillType: 1 });
drillAttemptSchema.index({ student: 1, createdAt: -1 });
drillAttemptSchema.index({ drillType: 1, 'score.percentage': -1 });

// Static method to get next attempt number
drillAttemptSchema.statics.getNextAttemptNumber = async function(studentId, drillType) {
    const lastAttempt = await this.findOne({
        student: studentId,
        drillType: drillType
    }).sort({ attemptNumber: -1 });
    
    return lastAttempt ? lastAttempt.attemptNumber + 1 : 1;
};

// Static method to get student's drill statistics
drillAttemptSchema.statics.getStudentDrillStats = async function(studentId) {
    try {
        const stats = await this.aggregate([
            { $match: { student: mongoose.Types.ObjectId(studentId), status: 'completed' } },
            {
                $group: {
                    _id: '$drillType',
                    totalAttempts: { $sum: 1 },
                    bestScore: { $max: '$score.percentage' },
                    bestXP: { $max: '$score.xp' },
                    averageScore: { $avg: '$score.percentage' },
                    completedCount: { $sum: { $cond: [{ $gte: ['$score.percentage', 60] }, 1, 0] } },
                    lastAttempt: { $max: '$createdAt' },
                    bestBadge: { $first: '$badge' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Calculate overall statistics
        const overallStats = await this.aggregate([
            { $match: { student: mongoose.Types.ObjectId(studentId), status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalDrills: { $sum: 1 },
                    totalXP: { $sum: '$score.xp' },
                    averageScore: { $avg: '$score.percentage' },
                    passedDrills: { $sum: { $cond: [{ $gte: ['$score.percentage', 60] }, 1, 0] } },
                    perfectScores: { $sum: { $cond: [{ $eq: ['$score.percentage', 100] }, 1, 0] } }
                }
            }
        ]);

        return {
            drillStats: stats,
            overall: overallStats[0] || {
                totalDrills: 0,
                totalXP: 0,
                averageScore: 0,
                passedDrills: 0,
                perfectScores: 0
            }
        };
    } catch (error) {
        console.error('Error calculating drill stats:', error);
        return { drillStats: [], overall: { totalDrills: 0, totalXP: 0, averageScore: 0, passedDrills: 0, perfectScores: 0 } };
    }
};

// Instance method to calculate if optimal path was followed
drillAttemptSchema.methods.calculateOptimalPathScore = function(optimalPath) {
    if (!this.pathTaken || !optimalPath) return 0;
    
    let optimalSteps = 0;
    const pathKeys = this.pathTaken.map(p => p.nodeKey);
    
    optimalPath.forEach(step => {
        if (pathKeys.includes(step.key)) {
            optimalSteps++;
        }
    });
    
    return optimalPath.length > 0 ? (optimalSteps / optimalPath.length) * 100 : 0;
};

// Instance method to get attempt summary
drillAttemptSchema.methods.getSummary = function() {
    return {
        id: this._id,
        drillType: this.drillType,
        attemptNumber: this.attemptNumber,
        score: this.score,
        badge: this.badge,
        timing: this.timing,
        endState: this.endState,
        completedAt: this.createdAt,
        passed: this.score.passed
    };
};

const DrillAttempt = mongoose.model('DrillAttempt', drillAttemptSchema);
module.exports = DrillAttempt;