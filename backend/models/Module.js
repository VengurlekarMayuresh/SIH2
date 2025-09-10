const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'video', 'image'],
        required: true,
    },
    body: {
        type: String,
        required: function() { return this.type === 'text'; },
    },
    videoUrl: {
        type: String,
        required: function() { return this.type === 'video'; },
    },
    imageUrl: {
        type: String,
        required: function() { return this.type === 'image'; },
    },
});

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    contents: [contentSchema],
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
});

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    chapters: [chapterSchema],
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }], // Module-level quizzes
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;