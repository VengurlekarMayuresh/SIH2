const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completionDate: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);

module.exports = StudentProgress;