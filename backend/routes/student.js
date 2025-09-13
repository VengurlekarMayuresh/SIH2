const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Institution = require('../models/Institution');
const { authMiddleware, studentOnly, institutionOnly } = require('../middleware');

// Student Registration
router.post('/student/register', async (req, res) => {
    try {
        const { institutionId, ...studentData } = req.body;
        let institutionObjectId = null;
        let institution = null;

        // Step 1: Handle institution code if provided
        if (institutionId && institutionId.trim() !== '') {
            institution = await Institution.findOne({ institutionId: institutionId.trim() });
            if (!institution) {
                return res.status(400).json({ message: "Invalid institution code. Please check and try again or register without an institution code." });
            }
            institutionObjectId = institution._id;

            // Check for existing student using the compound unique indexes
            const existingStudent = await Student.findOne({
                institutionId: institutionObjectId,
                $or: [{ email: studentData.email }, { rollNo: studentData.rollNo }]
            });
            if (existingStudent) {
                return res.status(400).json({ message: "Student with this email or roll number already exists in this institution." });
            }
        } else {
            // For independent students, check if email already exists
            const existingStudent = await Student.findOne({ 
                email: studentData.email,
                institutionId: { $exists: false }
            });
            if (existingStudent) {
                return res.status(400).json({ message: "Student with this email already exists." });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(studentData.password, 12);
        
        // Step 2: Create a new student
        const studentCreateData = {
            ...studentData,
            password: hashedPassword
        };
        
        // Only add institutionId if it exists
        if (institutionObjectId) {
            studentCreateData.institutionId = institutionObjectId;
        }
        
        const newStudent = new Student(studentCreateData);
        await newStudent.save();

        const token = jwt.sign({ _id: newStudent._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "Student registered successfully",
            token,
            student: {
                id: newStudent._id,
                name: newStudent.name,
                rollNo: newStudent.rollNo,
                email: newStudent.email,
                institutionId: newStudent.institutionId,
                institution: institution ? {
                    name: institution.name,
                    institutionId: institution.institutionId
                } : null
            }
        });

    } catch (error) {
        console.error('Student Registration Error:', error);
        
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

// Student Login
router.post('/student/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const student = await Student.findOne({ email }).populate('institutionId', 'name institutionId');
        if (!student) {
            return res.status(400).json({ message: "Invalid login credentials." });
        }

        const isPasswordValid = await bcrypt.compare(password, student.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid login credentials." });
        }

        const token = jwt.sign({ _id: student._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Login successful",
            token,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                rollNo: student.rollNo,
                class: student.class,
                division: student.division,
                institutionId: student.institutionId,
                institution: student.institutionId
            }
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Student Logout
router.post('/student/logout', authMiddleware, studentOnly, async (req, res) => {
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

// Get Student Profile
router.get('/student/profile', authMiddleware, studentOnly, async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).populate('institutionId', 'name institutionId location');
        res.json({
            student: student.toObject()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Student Profile
router.put('/student/profile', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { name, phone, parentPhone } = req.body;
        
        const updatedStudent = await Student.findByIdAndUpdate(
            req.user._id,
            { name, phone, parentPhone },
            { new: true, runValidators: true }
        ).populate('institutionId', 'name institutionId');

        res.json({
            message: "Profile updated successfully",
            student: updatedStudent.toObject()
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get Student Dashboard
router.get('/student/dashboard', authMiddleware, studentOnly, async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).populate('institutionId', 'name institutionId');
        
        res.json({
            student: {
                name: student.name,
                rollNo: student.rollNo,
                class: student.class,
                institution: student.institutionId,
                createdAt: student.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Students by Institution (for institution to view their students)
router.get('/institution/students', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { class: studentClass, division } = req.query;
        let filter = { institutionId: req.user._id };
        if (studentClass) filter.class = studentClass;
        if (division) filter.division = division;

        const students = await Student.find(filter)
            .select('name rollNo class division year email phone parentPhone createdAt')
            .sort({ class: 1, division: 1, rollNo: 1 });

        res.json({ students, total: students.length });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Virtual Drill Completion
router.post('/student/virtual-drill-complete', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { drillId, drillType, score, passed } = req.body;
        
        if (!drillId || !drillType || typeof score !== 'number' || typeof passed !== 'boolean') {
            return res.status(400).json({ message: "Missing required drill completion data" });
        }
        
        const student = await Student.findById(req.user._id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        // Check if this drill type has been completed before
        const existingDrillIndex = student.virtualDrillsCompleted.findIndex(
            drill => drill.drillId === drillId
        );
        
        if (existingDrillIndex !== -1) {
            // Update existing drill completion with better score or increment attempts
            const existingDrill = student.virtualDrillsCompleted[existingDrillIndex];
            if (score > existingDrill.score) {
                student.virtualDrillsCompleted[existingDrillIndex] = {
                    drillId,
                    drillType,
                    score,
                    passed,
                    completedAt: new Date(),
                    attempts: existingDrill.attempts + 1
                };
            } else {
                // Just increment attempts
                student.virtualDrillsCompleted[existingDrillIndex].attempts += 1;
            }
        } else {
            // Add new drill completion
            student.virtualDrillsCompleted.push({
                drillId,
                drillType,
                score,
                passed,
                completedAt: new Date(),
                attempts: 1
            });
        }
        
        await student.save();
        
        res.json({
            message: "Drill completion recorded successfully",
            drillCompletion: {
                drillId,
                drillType,
                score,
                passed,
                completedAt: new Date()
            }
        });
        
    } catch (error) {
        console.error('Virtual drill completion error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get Student Virtual Drill Progress
router.get('/student/virtual-drills', authMiddleware, studentOnly, async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).select('virtualDrillsCompleted');
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        const drillStats = {
            totalDrillsCompleted: student.virtualDrillsCompleted.length,
            drillsPassed: student.virtualDrillsCompleted.filter(drill => drill.passed).length,
            averageScore: student.virtualDrillsCompleted.length > 0 
                ? Math.round(student.virtualDrillsCompleted.reduce((sum, drill) => sum + drill.score, 0) / student.virtualDrillsCompleted.length)
                : 0,
            completedDrills: student.virtualDrillsCompleted.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        };
        
        res.json(drillStats);
        
    } catch (error) {
        console.error('Get virtual drills error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Enhanced Dashboard Data with Virtual Drills
router.get('/student/dashboard-data', authMiddleware, studentOnly, async (req, res) => {
    try {
        const student = await Student.findById(req.user._id)
            .populate('institutionId', 'name institutionId')
            .select('name rollNo class virtualDrillsCompleted createdAt');
        
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        // Calculate drill statistics
        const drillStats = {
            totalCompleted: student.virtualDrillsCompleted?.length || 0,
            passed: student.virtualDrillsCompleted?.filter(drill => drill.passed).length || 0,
            averageScore: student.virtualDrillsCompleted?.length > 0 
                ? Math.round(student.virtualDrillsCompleted.reduce((sum, drill) => sum + drill.score, 0) / student.virtualDrillsCompleted.length)
                : 0
        };
        
        // Mock recent activity data (you can enhance this based on your needs)
        const recentActivity = [
            {
                type: "virtual_drill",
                title: "Flood Evacuation Drill",
                description: drillStats.totalCompleted > 0 ? "Completed with good score" : "Ready to start",
                time: student.virtualDrillsCompleted?.length > 0 
                    ? student.virtualDrillsCompleted[student.virtualDrillsCompleted.length - 1].completedAt
                    : new Date().toISOString(),
                icon: "Target",
                color: "blue",
                badge: drillStats.passed > 0 ? "Passed" : null
            },
            {
                type: "learning",
                title: "Disaster Preparedness",
                description: "Continue learning about emergency response",
                time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                icon: "BookOpen",
                color: "green"
            }
        ];
        
        // Calculate today's progress
        const todayProgress = {
            completed: drillStats.passed,
            goal: 3,
            percentage: Math.min(100, Math.round((drillStats.passed / 3) * 100)),
            breakdown: {
                quizzes: 0, // You can connect this to your quiz system
                modules: 0, // You can connect this to your modules system  
                badges: drillStats.passed
            }
        };
        
        // Next badge logic
        const nextBadge = drillStats.totalCompleted < 1 ? {
            name: "Virtual Drill Novice",
            description: "Complete your first virtual drill",
            icon: "🎯",
            progress: 0,
            requirement: "Complete 1 virtual drill"
        } : drillStats.passed < 3 ? {
            name: "Emergency Responder",
            description: "Pass 3 virtual drills",
            icon: "🚨",
            progress: Math.round((drillStats.passed / 3) * 100),
            requirement: "Pass 3 virtual drills"
        } : {
            name: "Safety Champion",
            description: "Master of emergency preparedness", 
            icon: "🏆",
            progress: 100,
            requirement: "All drills mastered"
        };
        
        const dashboardData = {
            streak: Math.min(drillStats.totalCompleted, 7), // Mock streak calculation
            recentActivity,
            todayProgress,
            nextBadge,
            virtualDrillStats: drillStats
        };
        
        res.json(dashboardData);
        
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
