const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedOptions: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }],
    isCorrect: {
        type: Boolean,
        required: true
    },
    pointsEarned: {
        type: Number,
        required: true,
        default: 0
    },
    timeSpent: {
        type: Number, // Time spent on this question in seconds
        default: 0
    },
    confidence: {
        type: Number, // 1-5 scale
        min: 1,
        max: 5
    },
    hintsUsed: {
        type: Number,
        default: 0
    },
    hintPenalty: {
        type: Number,
        default: 0
    }
});

const quizAttemptSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    attemptNumber: {
        type: Number,
        required: true,
        min: 1
    },
    answers: [answerSchema],
    score: {
        raw: {
            type: Number, // Points earned
            required: true,
            default: 0
        },
        percentage: {
            type: Number, // Percentage score
            required: true,
            default: 0,
            min: 0,
            max: 100
        },
        passed: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    timing: {
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date
        },
        totalTimeSpent: {
            type: Number, // Total time in seconds
            default: 0
        },
        timeLimit: {
            type: Number, // Time limit that was set for this attempt
            required: true
        },
        timedOut: {
            type: Boolean,
            default: false
        }
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'submitted', 'timed_out'],
        default: 'in_progress'
    },
    metadata: {
        userAgent: String,
        ipAddress: String,
        randomizedQuestions: {
            type: Boolean,
            default: false
        },
        randomizedOptions: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Compound index for unique attempts per student per quiz
quizAttemptSchema.index({ student: 1, quiz: 1, attemptNumber: 1 }, { unique: true });

// Index for performance
quizAttemptSchema.index({ quiz: 1, status: 1 });
quizAttemptSchema.index({ student: 1, status: 1 });

// Pre-save middleware to calculate scores
quizAttemptSchema.pre('save', async function(next) {
    if (this.isModified('answers') || this.isNew) {
        // Calculate raw score
        this.score.raw = this.answers.reduce((total, answer) => total + answer.pointsEarned, 0);
        
        // Get quiz to calculate percentage
        try {
            const Quiz = mongoose.model('Quiz');
            const quiz = await Quiz.findById(this.quiz);
            if (quiz) {
                const totalPoints = quiz.getTotalPoints();
                this.score.percentage = totalPoints > 0 ? Math.round((this.score.raw / totalPoints) * 100) : 0;
                this.score.passed = this.score.percentage >= quiz.settings.passingScore;
            }
        } catch (error) {
            console.error('Error calculating score:', error);
        }
    }
    
    // Calculate total time spent
    if (this.timing.endTime && this.timing.startTime) {
        this.timing.totalTimeSpent = Math.floor((this.timing.endTime - this.timing.startTime) / 1000);
    }
    
    next();
});

// Static method to get next attempt number for a student
quizAttemptSchema.statics.getNextAttemptNumber = async function(studentId, quizId) {
    const lastAttempt = await this.findOne(
        { student: studentId, quiz: quizId },
        { attemptNumber: 1 }
    ).sort({ attemptNumber: -1 });
    
    return lastAttempt ? lastAttempt.attemptNumber + 1 : 1;
};

// Static method to check if student can attempt quiz
quizAttemptSchema.statics.canAttemptQuiz = async function(studentId, quiz) {
    const attemptCount = await this.countDocuments({
        student: studentId,
        quiz: quiz._id,
        status: { $in: ['completed', 'submitted'] }
    });
    
    if (attemptCount >= quiz.settings.maxAttempts) {
        return { canAttempt: false, reason: 'Maximum attempts exceeded' };
    }
    
    // Check retake delay if applicable
    if (quiz.settings.retakeDelay > 0 && attemptCount > 0) {
        const lastAttempt = await this.findOne(
            { student: studentId, quiz: quiz._id, status: { $in: ['completed', 'submitted'] } },
            { createdAt: 1 }
        ).sort({ createdAt: -1 });
        
        if (lastAttempt) {
            const retakeTime = new Date(lastAttempt.createdAt.getTime() + (quiz.settings.retakeDelay * 60 * 60 * 1000));
            if (new Date() < retakeTime) {
                return { 
                    canAttempt: false, 
                    reason: 'Retake delay not met',
                    retakeAvailableAt: retakeTime
                };
            }
        }
    }
    
    return { canAttempt: true };
};

// Instance method to get attempt summary
quizAttemptSchema.methods.getSummary = function() {
    return {
        id: this._id,
        attemptNumber: this.attemptNumber,
        score: this.score,
        timing: this.timing,
        status: this.status,
        questionCount: this.answers.length,
        correctAnswers: this.answers.filter(a => a.isCorrect).length,
        createdAt: this.createdAt
    };
};

// Instance method to get detailed analytics
quizAttemptSchema.methods.getAnalytics = function() {
    const analytics = {
        totalQuestions: this.answers.length,
        correctAnswers: this.answers.filter(a => a.isCorrect).length,
        averageTimePerQuestion: this.timing.totalTimeSpent / this.answers.length,
        averageConfidence: 0,
        totalHintsUsed: this.answers.reduce((total, answer) => total + answer.hintsUsed, 0),
        totalHintPenalty: this.answers.reduce((total, answer) => total + answer.hintPenalty, 0)
    };
    
    const confidenceAnswers = this.answers.filter(a => a.confidence);
    if (confidenceAnswers.length > 0) {
        analytics.averageConfidence = confidenceAnswers.reduce((sum, a) => sum + a.confidence, 0) / confidenceAnswers.length;
    }
    
    return analytics;
};

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt;
