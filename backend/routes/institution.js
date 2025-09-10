const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Institution = require("../models/Institution");
const Student = require('../models/Student');
const { authMiddleware, institutionOnly } = require('../middleware');

// Institution Registration
router.post('/institution/register', async (req, res) => {
    try {
        const { name, institutionId, email, password, phone, location } = req.body;

        const existingInstitution = await Institution.findOne({
            $or: [{ email }, { institutionId }]
        });
        if (existingInstitution) {
            return res.status(400).json({ message: "Institution with this email or ID already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const institution = new Institution({ name, institutionId, email, password: hashedPassword, phone, location });
        await institution.save();

        const token = jwt.sign({ _id: institution._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "Institution registered successfully",
            token,
            institution: { id: institution._id, name: institution.name, institutionId: institution.institutionId, email: institution.email }
        });

    } catch (error) {
        console.error('Institution Registration Error:', error);
        
        // Handle specific MongoDB validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors,
                details: error.message 
            });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ 
                message: `${field} already exists`, 
                field: field,
                value: error.keyValue[field]
            });
        }
        
        res.status(400).json({ 
            message: error.message || 'Registration failed',
            error: error.name || 'UnknownError'
        });
    }
});

// Institution Login
router.post('/institution/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const institution = await Institution.findOne({ email });
        if (!institution) {
            return res.status(400).json({ message: "Invalid login credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, institution.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid login credentials" });
        }

        const token = jwt.sign({ _id: institution._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Login successful",
            token,
            institution: { id: institution._id, name: institution.name, institutionId: institution.institutionId, email: institution.email }
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get Institution Profile
router.get('/institution/profile', authMiddleware, institutionOnly, async (req, res) => {
    try {
        res.json({
            institution: {
                id: req.user._id,
                name: req.user.name,
                institutionId: req.user.institutionId,
                email: req.user.email,
                phone: req.user.phone,
                location: req.user.location,
                isActive: req.user.isActive,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Institution Profile
router.put('/institution/profile', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { name, phone, location } = req.body;
        const updatedInstitution = await Institution.findByIdAndUpdate(
            req.user._id,
            { name, phone, location },
            { new: true, runValidators: true }
        );

        res.json({
            message: "Profile updated successfully",
            institution: updatedInstitution.toObject() // toObject() gives a plain JS object
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get Institution Dashboard (with detailed student breakdown)
router.get('/institution/dashboard', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const allStudents = await Student.find({ institutionId: req.user._id })
            .select('name rollNo class division year email phone');
            
        // Use 'reduce' to group students by class and then by division
        const studentsGrouped = allStudents.reduce((acc, student) => {
            const { class: studentClass, division } = student;
            
            // Group by class
            if (!acc[studentClass]) {
                acc[studentClass] = {
                    totalStudents: 0,
                    divisions: {}
                };
            }
            acc[studentClass].totalStudents++;
            
            // Group by division within the class
            if (!acc[studentClass].divisions[division]) {
                acc[studentClass].divisions[division] = [];
            }
            acc[studentClass].divisions[division].push(student);
            
            return acc;
        }, {});

        res.json({
            institution: {
                name: req.user.name,
                institutionId: req.user.institutionId,
                email: req.user.email,
                location: req.user.location
            },
            statistics: {
                totalStudents: allStudents.length,
                totalClasses: Object.keys(studentsGrouped).length
            },
            studentsByClassAndDivision: studentsGrouped,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Get Institution Students with Progress (Enhanced Dashboard)
router.get('/institution/students-progress', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { page = 1, limit = 10, class: studentClass, division } = req.query;
        let filter = { institutionId: req.user._id };
        if (studentClass) filter.class = studentClass;
        if (division) filter.division = division;

        const students = await Student.find(filter)
            .select('name rollNo class division year email phone createdAt')
            .sort({ class: 1, division: 1, rollNo: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalStudents = await Student.countDocuments(filter);
        
        // TODO: Add progress tracking from StudentProgress model
        const studentsWithProgress = students.map(student => ({
            ...student.toObject(),
            progress: {
                modulesCompleted: Math.floor(Math.random() * 5), // Mock data - replace with actual progress
                quizzesTaken: Math.floor(Math.random() * 10),
                averageScore: Math.floor(Math.random() * 40) + 60,
                lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            }
        }));

        res.json({
            students: studentsWithProgress,
            totalStudents,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalStudents / limit)
        });

    } catch (error) {
        console.error('Students Progress Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get Institution Analytics
router.get('/institution/analytics', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const students = await Student.find({ institutionId: req.user._id })
            .select('class division createdAt');
        
        const analytics = {
            totalStudents: students.length,
            studentsThisMonth: students.filter(s => 
                new Date(s.createdAt) >= new Date(new Date().setMonth(new Date().getMonth() - 1))
            ).length,
            classwiseBreakdown: students.reduce((acc, student) => {
                const key = student.class;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {}),
            divisionwiseBreakdown: students.reduce((acc, student) => {
                const key = `${student.class}-${student.division}`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {}),
            registrationTrends: {
                // Mock data - implement actual trends
                lastWeek: 5,
                lastMonth: 18,
                last3Months: 45
            }
        };

        res.json({ analytics });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get specific student details for institution
router.get('/institution/student/:studentId', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const student = await Student.findOne({
            _id: studentId,
            institutionId: req.user._id
        }).select('-password');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found or not part of your institution' });
        }

        // TODO: Fetch actual progress data from StudentProgress, QuizAttempt models
        const studentWithProgress = {
            ...student.toObject(),
            progress: {
                modulesCompleted: 3,
                totalModules: 5,
                quizzesTaken: 8,
                averageScore: 82,
                badges: [
                    { name: 'First Steps', earnedAt: new Date() },
                    { name: 'Quick Learner', earnedAt: new Date() }
                ],
                recentActivity: [
                    { type: 'quiz', name: 'Earthquake Safety', score: 85, date: new Date() },
                    { type: 'module', name: 'Flood Preparedness', completed: true, date: new Date() }
                ]
            }
        };

        res.json({ student: studentWithProgress });

    } catch (error) {
        console.error('Student Details Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
