const express = require('express');
const connectDb = require('./config/database');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const institutionRouter = require('./routes/institution');
const studentRouter = require('./routes/student');
const modulesRouter = require('./routes/modules');

// Load environment variables
dotenv.config();

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
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}/api`);
        });
    })
    .catch((err) => {
        console.error("❌ Failed to start server:", err.message);
        process.exit(1);
    });