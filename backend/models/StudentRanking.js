const mongoose = require('mongoose');

const studentRankingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true
    },
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    overallStats: {
        totalQuizzes: {
            type: Number,
            default: 0
        },
        totalScore: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0
        },
        highestScore: {
            type: Number,
            default: 0
        },
        perfectScores: {
            type: Number,
            default: 0
        },
        totalTimeSpent: {
            type: Number, // Total time in seconds
            default: 0
        },
        averageTimePerQuiz: {
            type: Number,
            default: 0
        },
        fastestQuizTime: {
            type: Number,
            default: Infinity
        }
    },
    badgeStats: {
        totalBadges: {
            type: Number,
            default: 0
        },
        badgePoints: {
            type: Number,
            default: 0
        },
        bronzeBadges: {
            type: Number,
            default: 0
        },
        silverBadges: {
            type: Number,
            default: 0
        },
        goldBadges: {
            type: Number,
            default: 0
        },
        platinumBadges: {
            type: Number,
            default: 0
        },
        diamondBadges: {
            type: Number,
            default: 0
        },
        rareBadges: {
            type: Number,
            default: 0 // Count of rare/epic/legendary badges
        }
    },
    streakStats: {
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        totalPassedQuizzes: {
            type: Number,
            default: 0
        }
    },
    rankings: {
        global: {
            position: {
                type: Number,
                default: 0
            },
            percentile: {
                type: Number,
                default: 0
            },
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        },
        institutional: {
            position: {
                type: Number,
                default: 0
            },
            percentile: {
                type: Number,
                default: 0
            },
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        }
    },
    rankingScore: {
        type: Number,
        default: 0 // Composite score used for ranking
    },
    moduleProgress: [{
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module'
        },
        quizzesCompleted: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0
        },
        bestScore: {
            type: Number,
            default: 0
        }
    }],
    recentActivity: {
        lastQuizDate: {
            type: Date
        },
        lastBadgeEarned: {
            type: Date
        },
        activeDays: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes for efficient ranking queries
studentRankingSchema.index({ rankingScore: -1 }); // Global ranking
studentRankingSchema.index({ institution: 1, rankingScore: -1 }); // Institutional ranking
studentRankingSchema.index({ 'overallStats.averageScore': -1 }); // Score-based ranking
studentRankingSchema.index({ 'badgeStats.totalBadges': -1 }); // Badge-based ranking
studentRankingSchema.index({ 'streakStats.currentStreak': -1 }); // Streak-based ranking

// Calculate composite ranking score
studentRankingSchema.methods.calculateRankingScore = function() {
    const weights = {
        averageScore: 0.35,      // 35% - Quiz performance
        totalBadges: 0.25,       // 25% - Achievement collection
        badgePoints: 0.15,       // 15% - Badge quality/points
        currentStreak: 0.10,     // 10% - Current performance streak
        perfectScores: 0.08,     // 8% - Perfect quiz completions
        speed: 0.05,             // 5% - Quiz completion speed (inverse)
        consistency: 0.02        // 2% - Regular activity
    };
    
    // Normalize values for fair comparison
    const normalizedAvgScore = this.overallStats.averageScore || 0;
    const normalizedBadges = Math.min(this.badgeStats.totalBadges * 4, 100); // Cap at 25 badges = 100 pts
    const normalizedBadgePoints = Math.min(this.badgeStats.badgePoints / 10, 100);
    const normalizedStreak = Math.min(this.streakStats.currentStreak * 10, 100);
    const normalizedPerfectScores = Math.min(this.overallStats.perfectScores * 20, 100);
    
    // Speed bonus (faster = better, but capped)
    const normalizedSpeed = this.overallStats.averageTimePerQuiz > 0 ? 
        Math.max(0, 100 - (this.overallStats.averageTimePerQuiz / 60)) : 0;
    
    // Consistency bonus
    const normalizedConsistency = Math.min(this.recentActivity.activeDays * 2, 100);
    
    this.rankingScore = Math.round(
        (normalizedAvgScore * weights.averageScore) +
        (normalizedBadges * weights.totalBadges) +
        (normalizedBadgePoints * weights.badgePoints) +
        (normalizedStreak * weights.currentStreak) +
        (normalizedPerfectScores * weights.perfectScores) +
        (normalizedSpeed * weights.speed) +
        (normalizedConsistency * weights.consistency)
    );
    
    return this.rankingScore;
};

// Static method to update student ranking after quiz completion
studentRankingSchema.statics.updateStudentRanking = async function(studentId, quizAttemptData) {
    const QuizAttempt = mongoose.model('QuizAttempt');
    const StudentBadge = mongoose.model('StudentBadge');
    const Student = mongoose.model('Student');
    
    try {
        // Get student info
        const student = await Student.findById(studentId);
        if (!student) return;
        
        // Find or create ranking record
        let ranking = await this.findOne({ student: studentId });
        if (!ranking) {
            ranking = new this({
                student: studentId,
                institution: student.institutionId
            });
        }
        
        // Get all student's quiz attempts
        const attempts = await QuizAttempt.find({
            student: studentId,
            status: 'submitted'
        }).populate('quiz', 'moduleId');
        
        // Get all student's badges
        const { badges, stats: badgeStats } = await StudentBadge.getStudentBadges(studentId);
        
        // Calculate overall stats
        const totalQuizzes = attempts.length;
        const scores = attempts.map(a => a.score.percentage);
        const times = attempts.map(a => a.timing.totalTimeSpent).filter(t => t > 0);
        
        ranking.overallStats = {
            totalQuizzes,
            totalScore: scores.reduce((sum, score) => sum + score, 0),
            averageScore: totalQuizzes > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / totalQuizzes) : 0,
            highestScore: totalQuizzes > 0 ? Math.max(...scores) : 0,
            perfectScores: scores.filter(score => score === 100).length,
            totalTimeSpent: times.reduce((sum, time) => sum + time, 0),
            averageTimePerQuiz: times.length > 0 ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 0,
            fastestQuizTime: times.length > 0 ? Math.min(...times) : Infinity
        };
        
        // Calculate badge stats
        const badgesByType = badgeStats.byType || {};
        const badgesByRarity = badgeStats.byRarity || {};
        
        ranking.badgeStats = {
            totalBadges: badgeStats.total || 0,
            badgePoints: badgeStats.totalPoints || 0,
            bronzeBadges: badgesByType.bronze || 0,
            silverBadges: badgesByType.silver || 0,
            goldBadges: badgesByType.gold || 0,
            platinumBadges: badgesByType.platinum || 0,
            diamondBadges: badgesByType.diamond || 0,
            rareBadges: (badgesByRarity.rare || 0) + (badgesByRarity.epic || 0) + (badgesByRarity.legendary || 0)
        };
        
        // Calculate streak stats
        const sortedAttempts = attempts.sort((a, b) => a.createdAt - b.createdAt);
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let totalPassed = 0;
        
        for (let i = sortedAttempts.length - 1; i >= 0; i--) {
            const attempt = sortedAttempts[i];
            if (attempt.score.passed) {
                totalPassed++;
                if (i === sortedAttempts.length - 1) currentStreak = 1;
                else if (currentStreak > 0) currentStreak++;
                
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                if (i === sortedAttempts.length - 1) currentStreak = 0;
                tempStreak = 0;
            }
        }
        
        ranking.streakStats = {
            currentStreak,
            longestStreak,
            totalPassedQuizzes: totalPassed
        };
        
        // Update module progress
        const moduleProgress = {};
        attempts.forEach(attempt => {
            const moduleId = attempt.quiz?.moduleId?.toString();
            if (moduleId) {
                if (!moduleProgress[moduleId]) {
                    moduleProgress[moduleId] = {
                        quizzesCompleted: 0,
                        scores: []
                    };
                }
                moduleProgress[moduleId].quizzesCompleted++;
                moduleProgress[moduleId].scores.push(attempt.score.percentage);
            }
        });
        
        ranking.moduleProgress = Object.keys(moduleProgress).map(moduleId => ({
            moduleId,
            quizzesCompleted: moduleProgress[moduleId].quizzesCompleted,
            averageScore: Math.round(
                moduleProgress[moduleId].scores.reduce((sum, score) => sum + score, 0) / 
                moduleProgress[moduleId].scores.length
            ),
            bestScore: Math.max(...moduleProgress[moduleId].scores)
        }));
        
        // Update recent activity
        ranking.recentActivity = {
            lastQuizDate: totalQuizzes > 0 ? sortedAttempts[sortedAttempts.length - 1].createdAt : null,
            lastBadgeEarned: badges.length > 0 ? badges[0].earnedAt : null,
            activeDays: totalQuizzes // Simplified - could be more sophisticated
        };
        
        // Calculate ranking score
        ranking.calculateRankingScore();
        
        await ranking.save();
        
        return ranking;
    } catch (error) {
        console.error('Error updating student ranking:', error);
        return null;
    }
};

// Static method to calculate global rankings
studentRankingSchema.statics.calculateGlobalRankings = async function() {
    try {
        const rankings = await this.find({}).sort({ rankingScore: -1 });
        const totalStudents = rankings.length;
        
        for (let i = 0; i < rankings.length; i++) {
            const ranking = rankings[i];
            ranking.rankings.global = {
                position: i + 1,
                percentile: Math.round(((totalStudents - i) / totalStudents) * 100),
                lastUpdated: new Date()
            };
            await ranking.save();
        }
        
        return rankings.length;
    } catch (error) {
        console.error('Error calculating global rankings:', error);
        return 0;
    }
};

// Static method to calculate institutional rankings
studentRankingSchema.statics.calculateInstitutionalRankings = async function(institutionId) {
    try {
        const rankings = await this.find({ institution: institutionId }).sort({ rankingScore: -1 });
        const totalStudents = rankings.length;
        
        for (let i = 0; i < rankings.length; i++) {
            const ranking = rankings[i];
            ranking.rankings.institutional = {
                position: i + 1,
                percentile: Math.round(((totalStudents - i) / totalStudents) * 100),
                lastUpdated: new Date()
            };
            await ranking.save();
        }
        
        return rankings.length;
    } catch (error) {
        console.error('Error calculating institutional rankings:', error);
        return 0;
    }
};

// Static method to get leaderboard
studentRankingSchema.statics.getLeaderboard = async function(options = {}) {
    const {
        type = 'global', // 'global', 'institutional', 'module'
        institutionId,
        moduleId,
        limit = 50,
        studentId // To get student's position even if not in top 50
    } = options;
    
    try {
        let filter = {};
        let sort = { rankingScore: -1 };
        
        if (type === 'institutional' && institutionId) {
            filter.institution = institutionId;
        }
        
        // Get top performers
        const topRankings = await this.find(filter)
            .populate('student', 'name email class division')
            .populate('institution', 'name')
            .sort(sort)
            .limit(limit);
        
        // Get student's position if requested and not in top results
        let studentRanking = null;
        if (studentId) {
            studentRanking = await this.findOne({ student: studentId })
                .populate('student', 'name email class division')
                .populate('institution', 'name');
            
            // Check if student is already in top results
            const studentInTop = topRankings.find(r => r.student._id.toString() === studentId);
            if (!studentInTop && studentRanking) {
                studentRanking.isCurrentUser = true;
            }
        }
        
        return {
            leaderboard: topRankings.map((ranking, index) => ({
                position: index + 1,
                student: {
                    id: ranking.student._id,
                    name: ranking.student.name,
                    email: ranking.student.email,
                    class: ranking.student.class,
                    division: ranking.student.division
                },
                institution: ranking.institution.name,
                stats: {
                    rankingScore: ranking.rankingScore,
                    averageScore: ranking.overallStats.averageScore,
                    totalQuizzes: ranking.overallStats.totalQuizzes,
                    totalBadges: ranking.badgeStats.totalBadges,
                    badgePoints: ranking.badgeStats.badgePoints,
                    currentStreak: ranking.streakStats.currentStreak,
                    perfectScores: ranking.overallStats.perfectScores
                },
                lastActive: ranking.recentActivity.lastQuizDate
            })),
            studentPosition: studentRanking && !topRankings.find(r => r.student._id.toString() === studentId) ? {
                position: studentRanking.rankings[type]?.position || 0,
                student: {
                    id: studentRanking.student._id,
                    name: studentRanking.student.name,
                    email: studentRanking.student.email,
                    class: studentRanking.student.class,
                    division: studentRanking.student.division
                },
                stats: {
                    rankingScore: studentRanking.rankingScore,
                    averageScore: studentRanking.overallStats.averageScore,
                    totalQuizzes: studentRanking.overallStats.totalQuizzes,
                    totalBadges: studentRanking.badgeStats.totalBadges,
                    currentStreak: studentRanking.streakStats.currentStreak
                }
            } : null
        };
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return { leaderboard: [], studentPosition: null };
    }
};

const StudentRanking = mongoose.model('StudentRanking', studentRankingSchema);
module.exports = StudentRanking;
