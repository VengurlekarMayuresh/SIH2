const mongoose = require('mongoose');

const studentBadgeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    badge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
        required: true
    },
    earnedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: false // Badge might not be related to a specific quiz
    },
    quizAttempt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizAttempt',
        required: false // Reference to the specific attempt that earned the badge
    },
    progress: {
        // Track progress towards earning the badge (for multi-step badges)
        current: {
            type: Number,
            default: 1
        },
        required: {
            type: Number,
            default: 1
        },
        percentage: {
            type: Number,
            default: 100,
            min: 0,
            max: 100
        }
    },
    metadata: {
        // Additional context about how the badge was earned
        scoreAchieved: Number,
        timeSpent: Number,
        streakNumber: Number,
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module'
        },
        additionalInfo: String
    },
    isVisible: {
        type: Boolean,
        default: true // Students can choose to hide badges
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate badges per student
studentBadgeSchema.index({ student: 1, badge: 1 }, { unique: true });

// Index for efficient queries
studentBadgeSchema.index({ student: 1, earnedAt: -1 });
studentBadgeSchema.index({ badge: 1, earnedAt: -1 });

// Static method to award badge to student
studentBadgeSchema.statics.awardBadge = async function(studentId, badgeId, context = {}) {
    try {
        // Check if student already has this badge
        const existingBadge = await this.findOne({
            student: studentId,
            badge: badgeId
        });
        
        if (existingBadge) {
            return { success: false, message: 'Badge already earned', badge: existingBadge };
        }
        
        // Create new badge award
        const studentBadge = new this({
            student: studentId,
            badge: badgeId,
            quiz: context.quizId,
            quizAttempt: context.attemptId,
            metadata: {
                scoreAchieved: context.score,
                timeSpent: context.timeSpent,
                streakNumber: context.streak,
                moduleId: context.moduleId,
                additionalInfo: context.info
            }
        });
        
        await studentBadge.save();
        await studentBadge.populate('badge');
        
        return { 
            success: true, 
            message: 'Badge awarded successfully!', 
            badge: studentBadge 
        };
    } catch (error) {
        console.error('Error awarding badge:', error);
        return { success: false, message: 'Failed to award badge', error };
    }
};

// Static method to get student's badges with statistics
studentBadgeSchema.statics.getStudentBadges = async function(studentId) {
    try {
        const badges = await this.find({ 
            student: studentId, 
            isVisible: true 
        })
        .populate('badge')
        .populate('quiz', 'title')
        .populate('moduleId', 'title')
        .sort({ earnedAt: -1 });
        
        // Calculate badge statistics
        const stats = {
            total: badges.length,
            byType: {},
            byCategory: {},
            byRarity: {},
            totalPoints: 0,
            recentBadges: badges.slice(0, 5) // Last 5 badges
        };
        
        badges.forEach(studentBadge => {
            const badge = studentBadge.badge;
            
            // Count by type
            stats.byType[badge.type] = (stats.byType[badge.type] || 0) + 1;
            
            // Count by category
            stats.byCategory[badge.category] = (stats.byCategory[badge.category] || 0) + 1;
            
            // Count by rarity
            stats.byRarity[badge.rarity] = (stats.byRarity[badge.rarity] || 0) + 1;
            
            // Total points
            stats.totalPoints += badge.points;
        });
        
        return { badges, stats };
    } catch (error) {
        console.error('Error fetching student badges:', error);
        return { badges: [], stats: { total: 0, totalPoints: 0 } };
    }
};

// Static method to check and award eligible badges after quiz completion
studentBadgeSchema.statics.checkAndAwardBadges = async function(studentId, quizAttemptData) {
    const Badge = mongoose.model('Badge');
    const QuizAttempt = mongoose.model('QuizAttempt');
    
    try {
        // Get student's quiz statistics
        const studentStats = await this.calculateStudentStats(studentId);
        
        // Get all available badges
        const availableBadges = await Badge.find({ isActive: true });
        
        const newBadges = [];
        
        for (const badge of availableBadges) {
            // Check if student already has this badge
            const alreadyEarned = await this.findOne({
                student: studentId,
                badge: badge._id
            });
            
            if (alreadyEarned) continue;
            
            // Check if badge criteria is met
            if (badge.checkCriteria(studentStats)) {
                const context = {
                    quizId: quizAttemptData.quiz,
                    attemptId: quizAttemptData._id,
                    score: quizAttemptData.score.percentage,
                    timeSpent: quizAttemptData.timing.totalTimeSpent,
                    moduleId: quizAttemptData.moduleId
                };
                
                const result = await this.awardBadge(studentId, badge._id, context);
                if (result.success) {
                    newBadges.push(result.badge);
                }
            }
        }
        
        return newBadges;
    } catch (error) {
        console.error('Error checking and awarding badges:', error);
        return [];
    }
};

// Static method to calculate student statistics for badge criteria
studentBadgeSchema.statics.calculateStudentStats = async function(studentId) {
    const QuizAttempt = mongoose.model('QuizAttempt');
    const Quiz = mongoose.model('Quiz');
    
    try {
        // Get all student's quiz attempts
        const attempts = await QuizAttempt.find({ 
            student: studentId, 
            status: 'submitted' 
        }).populate('quiz', 'moduleId');
        
        if (attempts.length === 0) {
            return {
                totalQuizzes: 0,
                highestScore: 0,
                averageScore: 0,
                fastestTime: Infinity,
                currentStreak: 0,
                longestStreak: 0,
                uniqueModules: 0,
                hasPerfectScore: false,
                consecutivePerfect: 0,
                totalPoints: 0
            };
        }
        
        // Calculate basic stats
        const totalQuizzes = attempts.length;
        const scores = attempts.map(a => a.score.percentage);
        const times = attempts.map(a => a.timing.totalTimeSpent).filter(t => t > 0);
        const highestScore = Math.max(...scores);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const fastestTime = times.length > 0 ? Math.min(...times) : Infinity;
        const hasPerfectScore = scores.some(score => score === 100);
        const totalPoints = attempts.reduce((sum, a) => sum + a.score.raw, 0);
        
        // Calculate unique modules
        const moduleIds = [...new Set(attempts.map(a => a.quiz.moduleId?.toString()).filter(Boolean))];
        const uniqueModules = moduleIds.length;
        
        // Calculate streaks
        const sortedAttempts = attempts.sort((a, b) => a.createdAt - b.createdAt);
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let consecutivePerfect = 0;
        let tempConsecutivePerfect = 0;
        
        for (let i = sortedAttempts.length - 1; i >= 0; i--) {
            const attempt = sortedAttempts[i];
            
            // Current streak (from most recent backwards)
            if (i === sortedAttempts.length - 1) {
                currentStreak = attempt.score.passed ? 1 : 0;
            } else if (attempt.score.passed && currentStreak > 0) {
                currentStreak++;
            } else if (!attempt.score.passed) {
                currentStreak = 0;
            }
            
            // Longest streak overall
            if (attempt.score.passed) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
            
            // Consecutive perfect scores
            if (attempt.score.percentage === 100) {
                tempConsecutivePerfect++;
                consecutivePerfect = Math.max(consecutivePerfect, tempConsecutivePerfect);
            } else {
                tempConsecutivePerfect = 0;
            }
        }
        
        return {
            totalQuizzes,
            highestScore,
            averageScore: Math.round(averageScore),
            fastestTime,
            currentStreak,
            longestStreak,
            uniqueModules,
            hasPerfectScore,
            consecutivePerfect,
            totalPoints
        };
    } catch (error) {
        console.error('Error calculating student stats:', error);
        return {
            totalQuizzes: 0,
            highestScore: 0,
            averageScore: 0,
            fastestTime: Infinity,
            currentStreak: 0,
            longestStreak: 0,
            uniqueModules: 0,
            hasPerfectScore: false,
            consecutivePerfect: 0,
            totalPoints: 0
        };
    }
};

// Instance method to get badge summary
studentBadgeSchema.methods.getSummary = function() {
    return {
        id: this._id,
        badgeName: this.badge.name,
        badgeIcon: this.badge.icon,
        badgeType: this.badge.type,
        badgeRarity: this.badge.rarity,
        points: this.badge.points,
        earnedAt: this.earnedAt,
        context: this.metadata
    };
};

const StudentBadge = mongoose.model('StudentBadge', studentBadgeSchema);
module.exports = StudentBadge;
