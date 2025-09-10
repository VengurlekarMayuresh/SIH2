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
                institution: student.institutionId
            }
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
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

module.exports = router;