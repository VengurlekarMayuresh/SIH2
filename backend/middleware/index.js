const jwt = require("jsonwebtoken");
const Institution = require("../models/Institution");
const Student = require("../models/Student");

// General auth middleware that works for both Institution and Student
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        let token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Try to find user in Institution collection first
        let user = await Institution.findById(decoded._id);
        if (user) {
            req.user = user;
            req.userType = 'institution';
        } else {
            // Try Student collection
            user = await Student.findById(decoded._id);
            if (user) {
                req.user = user;
                req.userType = 'student';
            }
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid token - user not found." });
        }

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ message: "Invalid token." });
    }
};

// Middleware specifically for institutions only
const institutionOnly = (req, res, next) => {
    if (req.userType !== 'institution') {
        return res.status(403).json({ message: "Access denied. Institution access only." });
    }
    next();
};

// Middleware specifically for students only
const studentOnly = (req, res, next) => {
    if (req.userType !== 'student') {
        return res.status(403).json({ message: "Access denied. Student access only." });
    }
    next();
};

module.exports = { authMiddleware, institutionOnly, studentOnly };