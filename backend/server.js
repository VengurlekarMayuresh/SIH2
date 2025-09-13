// Load environment variables FIRST
const dotenv = require('dotenv');
dotenv.config();

// Now import other modules
const express = require('express');
const connectDb = require('./config/database');
const cors = require('cors');
const mongoose = require('mongoose');

// Register all models to prevent MissingSchemaError
require('./models');
const institutionRouter = require('./routes/institution');
const studentRouter = require('./routes/student');
const modulesRouter = require('./routes/modules');
const alertsRouter = require('./routes/alerts');
const weatherRouter = require('./routes/weather');
const chatbotRouter = require('./routes/chatbot');

const app = express();

// Middleware
// Robust CORS: allow common local dev ports and env override
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080"
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // allow curl/postman/no-origin
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow any localhost port during dev
        const localhostMatch = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
        if (localhostMatch) return callback(null, true);
        return callback(new Error('CORS not allowed from origin: ' + origin), false);
    },
    credentials: true
}));
app.use(express.json());

// Use routes
app.use('/api', institutionRouter);
app.use('/api', studentRouter);
app.use('/api', modulesRouter);
app.use('/api', alertsRouter);
app.use('/api', weatherRouter);
app.use('/api/chatbot', chatbotRouter);

// Health check
app.get('/', (req, res) => {
    res.json({ 
        message: "🚨 SafeEd API is running!",
        status: "success"
    });
});

// Connect to database and start server
connectDb()
    .then(() => {
        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}/api`);
        });
    })
    .catch((err) => {
        console.error("❌ Failed to start server:", err.message);
        process.exit(1);
    });