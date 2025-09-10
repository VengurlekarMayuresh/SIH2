const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    isCorrect: {
        type: Boolean,
        required: true,
        default: false
    }
});

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [optionSchema],
        required: true,
        validate: [arrayLimit, 'Questions must have between 2 and 6 options']
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    explanation: {
        type: String,
        trim: true
    },
    timeLimit: {
        type: Number, // Time in seconds for this question
        default: 30
    },
    points: {
        type: Number,
        default: 1,
        min: 1
    },
    hints: [{
        text: String,
        penalty: {
            type: Number,
            default: 0.1 // 10% penalty for using hint
        }
    }]
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Optional - quiz can be for entire module
    },
    questions: {
        type: [questionSchema],
        required: true,
        validate: [arrayLimit, 'Quiz must have at least 1 question']
    },
    settings: {
        timeLimit: {
            type: Number, // Total time limit in minutes
            default: 30
        },
        passingScore: {
            type: Number, // Percentage required to pass
            default: 70,
            min: 0,
            max: 100
        },
        maxAttempts: {
            type: Number,
            default: 3,
            min: 1
        },
        randomizeQuestions: {
            type: Boolean,
            default: false
        },
        randomizeOptions: {
            type: Boolean,
            default: false
        },
        showCorrectAnswers: {
            type: Boolean,
            default: true
        },
        allowRetake: {
            type: Boolean,
            default: true
        },
        retakeDelay: {
            type: Number, // Hours to wait before retake
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    createdBy: {
        type: String,
        default: 'system', // Global system content
        required: false
    }
}, {
    timestamps: true
});

// Validation function for array length
function arrayLimit(val) {
    return val.length >= 1;
}

// Pre-save middleware to ensure at least one correct answer per question
quizSchema.pre('save', function(next) {
    for (let question of this.questions) {
        const hasCorrectAnswer = question.options.some(option => option.isCorrect);
        if (!hasCorrectAnswer) {
            return next(new Error(`Question "${question.question}" must have at least one correct answer`));
        }
        
        // Ensure options array has proper length
        if (question.options.length < 2 || question.options.length > 6) {
            return next(new Error(`Question "${question.question}" must have between 2 and 6 options`));
        }
    }
    next();
});

// Instance method to calculate total points
quizSchema.methods.getTotalPoints = function() {
    return this.questions.reduce((total, question) => total + question.points, 0);
};

// Instance method to get quiz summary
quizSchema.methods.getSummary = function() {
    return {
        id: this._id,
        title: this.title,
        description: this.description,
        questionCount: this.questions.length,
        totalPoints: this.getTotalPoints(),
        timeLimit: this.settings.timeLimit,
        passingScore: this.settings.passingScore,
        status: this.status,
        createdAt: this.createdAt
    };
};

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
