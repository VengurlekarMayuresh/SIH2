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

// Institution Logout
router.post('/institution/logout', authMiddleware, institutionOnly, async (req, res) => {
    try {
        // For JWT tokens, we can't really invalidate them on the server side
        // unless we maintain a blacklist. For now, we'll just send success response
        // and let the client handle token removal
        res.json({
            message: "Logout successful",
            success: true
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Logout failed",
            error: error.message 
        });
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
        
        // Get real progress data from database
        const StudentProgress = require('../models/StudentProgress');
        const QuizAttempt = require('../models/QuizAttempt');
        
        const studentsWithProgress = await Promise.all(
            students.map(async (student) => {
                // Get module completion count
                const modulesCompleted = await StudentProgress.countDocuments({
                    student: student._id,
                    completed: true
                });
                
                // Get quiz attempts
                const quizAttempts = await QuizAttempt.find({
                    student: student._id,
                    status: { $in: ['completed', 'submitted'] }
                });
                
                // Calculate average score
                const averageScore = quizAttempts.length > 0 
                    ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score.percentage, 0) / quizAttempts.length)
                    : 0;
                
                // Get last activity (most recent quiz attempt or module completion)
                const lastQuizAttempt = await QuizAttempt.findOne({
                    student: student._id
                }).sort({ createdAt: -1 });
                
                const lastModuleProgress = await StudentProgress.findOne({
                    student: student._id
                }).sort({ updatedAt: -1 });
                
                let lastActive = student.createdAt;
                if (lastQuizAttempt && lastModuleProgress) {
                    lastActive = lastQuizAttempt.createdAt > lastModuleProgress.updatedAt 
                        ? lastQuizAttempt.createdAt 
                        : lastModuleProgress.updatedAt;
                } else if (lastQuizAttempt) {
                    lastActive = lastQuizAttempt.createdAt;
                } else if (lastModuleProgress) {
                    lastActive = lastModuleProgress.updatedAt;
                }
                
                return {
                    ...student.toObject(),
                    progress: {
                        modulesCompleted,
                        quizzesTaken: quizAttempts.length,
                        averageScore,
                        lastActive
                    }
                };
            })
        );

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

// Get live dashboard statistics
router.get('/institution/live-stats', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const StudentProgress = require('../models/StudentProgress');
        const QuizAttempt = require('../models/QuizAttempt');
        const Module = require('../models/Module');
        
        // Get all students for this institution
        const students = await Student.find({ institutionId: req.user._id });
        const studentIds = students.map(s => s._id);
        
        if (studentIds.length === 0) {
            return res.json({
                totalStudents: 0,
                averageProgress: 0,
                activeToday: 0,
                completionRate: 0,
                totalModulesCompleted: 0,
                totalQuizzesTaken: 0,
                averageQuizScore: 0,
                studentsActiveThisWeek: 0
            });
        }
        
        // Get today's date for active users calculation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Get this week's date
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);
        
        // Parallel queries for better performance
        const [moduleProgressData, quizAttemptData, totalModules, activeToday, activeThisWeek] = await Promise.all([
            // Get all module progress for institution students
            StudentProgress.find({ 
                student: { $in: studentIds } 
            }),
            
            // Get all quiz attempts for institution students
            QuizAttempt.find({ 
                student: { $in: studentIds },
                status: { $in: ['completed', 'submitted'] }
            }),
            
            // Get total available modules
            Module.countDocuments({ active: true }),
            
            // Get students active today (quiz attempts or module progress today)
            Promise.all([
                QuizAttempt.distinct('student', {
                    student: { $in: studentIds },
                    createdAt: { $gte: today, $lt: tomorrow }
                }),
                StudentProgress.distinct('student', {
                    student: { $in: studentIds },
                    updatedAt: { $gte: today, $lt: tomorrow }
                })
            ]).then(([quizStudents, progressStudents]) => {
                return new Set([...quizStudents, ...progressStudents]).size;
            }),
            
            // Get students active this week
            Promise.all([
                QuizAttempt.distinct('student', {
                    student: { $in: studentIds },
                    createdAt: { $gte: thisWeek }
                }),
                StudentProgress.distinct('student', {
                    student: { $in: studentIds },
                    updatedAt: { $gte: thisWeek }
                })
            ]).then(([quizStudents, progressStudents]) => {
                return new Set([...quizStudents, ...progressStudents]).size;
            })
        ]);
        
        // Calculate statistics
        const totalStudents = students.length;
        const completedModules = moduleProgressData.filter(p => p.completed);
        const totalModulesCompleted = completedModules.length;
        
        // Average progress calculation
        const studentsWithProgress = {};
        moduleProgressData.forEach(progress => {
            const studentId = progress.student.toString();
            if (!studentsWithProgress[studentId]) {
                studentsWithProgress[studentId] = 0;
            }
            if (progress.completed) {
                studentsWithProgress[studentId]++;
            }
        });
        
        const progressPercentages = Object.values(studentsWithProgress).map(completed => 
            totalModules > 0 ? (completed / totalModules) * 100 : 0
        );
        const averageProgress = progressPercentages.length > 0 
            ? Math.round(progressPercentages.reduce((sum, p) => sum + p, 0) / progressPercentages.length)
            : 0;
        
        // Quiz statistics
        const totalQuizzesTaken = quizAttemptData.length;
        const averageQuizScore = quizAttemptData.length > 0 
            ? Math.round(quizAttemptData.reduce((sum, attempt) => sum + attempt.score.percentage, 0) / quizAttemptData.length)
            : 0;
        
        // Completion rate (students who completed at least one module)
        const studentsWithCompletedModules = Object.keys(studentsWithProgress).filter(
            studentId => studentsWithProgress[studentId] > 0
        ).length;
        const completionRate = totalStudents > 0 
            ? Math.round((studentsWithCompletedModules / totalStudents) * 100)
            : 0;
        
        res.json({
            totalStudents,
            averageProgress,
            activeToday,
            completionRate,
            totalModulesCompleted,
            totalQuizzesTaken,
            averageQuizScore,
            studentsActiveThisWeek: activeThisWeek,
            lastUpdated: new Date()
        });
        
    } catch (error) {
        console.error('Live Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get recent activity for dashboard
router.get('/institution/recent-activity', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const StudentProgress = require('../models/StudentProgress');
        const QuizAttempt = require('../models/QuizAttempt');
        const Module = require('../models/Module');
        
        const limit = parseInt(req.query.limit) || 10;
        
        // Get recent quiz attempts and module completions
        const students = await Student.find({ institutionId: req.user._id }).select('_id name class division rollNo');
        const studentIds = students.map(s => s._id);
        const studentMap = students.reduce((acc, student) => {
            acc[student._id.toString()] = student;
            return acc;
        }, {});
        
        if (studentIds.length === 0) {
            return res.json({ activities: [] });
        }
        
        const [recentQuizzes, recentModules] = await Promise.all([
            QuizAttempt.find({
                student: { $in: studentIds },
                status: { $in: ['completed', 'submitted'] }
            })
            .populate('quiz', 'title')
            .sort({ createdAt: -1 })
            .limit(limit),
            
            StudentProgress.find({
                student: { $in: studentIds },
                completed: true
            })
            .populate('module', 'title')
            .sort({ updatedAt: -1 })
            .limit(limit)
        ]);
        
        // Combine and format activities
        const activities = [
            ...recentQuizzes.map(quiz => ({
                type: 'quiz',
                student: studentMap[quiz.student.toString()],
                title: quiz.quiz?.title || 'Quiz',
                score: quiz.score?.percentage || 0,
                timestamp: quiz.createdAt,
                icon: 'quiz'
            })),
            ...recentModules.map(module => ({
                type: 'module',
                student: studentMap[module.student.toString()],
                title: module.module?.title || 'Module',
                timestamp: module.updatedAt,
                icon: 'module'
            }))
        ]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
        
        res.json({ activities });
        
    } catch (error) {
        console.error('Recent Activity Error:', error);
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
