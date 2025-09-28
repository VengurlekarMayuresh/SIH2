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
// Production-ready CORS configuration
const getAllowedOrigins = () => {
    // In production, use only specified origins
    if (process.env.NODE_ENV === 'production') {
        const origins = [];
        if (process.env.FRONTEND_URL) origins.push(process.env.FRONTEND_URL);
        if (process.env.ALLOWED_ORIGINS) {
            origins.push(...process.env.ALLOWED_ORIGINS.split(','));
        }
        return origins.length > 0 ? origins : [process.env.FRONTEND_URL || 'https://localhost'];
    }
    
    // In development, allow common local dev ports
    return [
        process.env.FRONTEND_URL || "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "http://localhost:3000", // React default
        "http://localhost:5000"  // Alternative port
    ];
};

const allowedOrigins = getAllowedOrigins();
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // In development, allow any localhost port
        if (process.env.NODE_ENV !== 'production') {
            const localhostMatch = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
            if (localhostMatch) {
                console.log(`✅ CORS: Allowing dev origin: ${origin}`);
                return callback(null, true);
            }
        }
        
        console.error(`❌ CORS: Origin not allowed: ${origin}`);
        console.log(`📋 CORS: Allowed origins:`, allowedOrigins);
        return callback(new Error(`CORS not allowed from origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
        message: "🚨 Raksha Setu API is running!",
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