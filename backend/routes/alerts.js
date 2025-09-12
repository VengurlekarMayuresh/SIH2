const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { authMiddleware, institutionOnly } = require('../middleware');

// Create a new alert (Institution only)
router.post('/alerts', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { 
            title, 
            message, 
            type, 
            priority, 
            expiresAt, 
            targetAudience, 
            targetClass, 
            targetDivision 
        } = req.body;

        // Validation
        if (!title || !message) {
            return res.status(400).json({ 
                message: "Title and message are required" 
            });
        }

        if (targetAudience === "specific_class" && !targetClass) {
            return res.status(400).json({ 
                message: "Target class is required when targeting specific class" 
            });
        }

        const alert = new Alert({
            title,
            message,
            type: type || 'info',
            priority: priority || 'medium',
            institutionId: req.user._id,
            createdBy: req.user._id,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            targetAudience: targetAudience || 'all',
            targetClass: targetClass || null,
            targetDivision: targetDivision || null
        });

        await alert.save();

        res.status(201).json({
            message: "Alert created successfully",
            alert: await alert.populate("createdBy", "name institutionId")
        });

    } catch (error) {
        console.error('Alert Creation Error:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }
        
        res.status(400).json({ 
            message: error.message || 'Failed to create alert' 
        });
    }
});

// Get all alerts for an institution (Institution dashboard)
router.get('/alerts', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, priority, isActive } = req.query;
        
        let filter = { institutionId: req.user._id };
        
        if (type) filter.type = type;
        if (priority) filter.priority = priority;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        
        const alerts = await Alert.find(filter)
            .populate("createdBy", "name institutionId")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalAlerts = await Alert.countDocuments(filter);
        const totalPages = Math.ceil(totalAlerts / limit);

        res.json({
            alerts,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalAlerts,
                hasMore: page < totalPages
            }
        });

    } catch (error) {
        console.error('Fetch Alerts Error:', error);
        res.status(500).json({ 
            message: "Failed to fetch alerts" 
        });
    }
});

// Get active alerts for students (Public endpoint - used by frontend)
router.get('/alerts/active/:institutionId', async (req, res) => {
    try {
        const { institutionId } = req.params;
        const { targetAudience = "students", targetClass } = req.query;

        const alerts = await Alert.getActiveAlerts(institutionId, targetAudience, targetClass);

        res.json({
            alerts,
            count: alerts.length
        });

    } catch (error) {
        console.error('Fetch Active Alerts Error:', error);
        res.status(500).json({ 
            message: "Failed to fetch active alerts" 
        });
    }
});

// Get single alert by ID
router.get('/alerts/:id', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const alert = await Alert.findOne({ 
            _id: req.params.id, 
            institutionId: req.user._id 
        }).populate("createdBy", "name institutionId");

        if (!alert) {
            return res.status(404).json({ 
                message: "Alert not found" 
            });
        }

        res.json({ alert });

    } catch (error) {
        console.error('Fetch Alert Error:', error);
        res.status(500).json({ 
            message: "Failed to fetch alert" 
        });
    }
});

// Update alert
router.put('/alerts/:id', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { 
            title, 
            message, 
            type, 
            priority, 
            isActive, 
            expiresAt, 
            targetAudience, 
            targetClass, 
            targetDivision 
        } = req.body;

        const alert = await Alert.findOne({ 
            _id: req.params.id, 
            institutionId: req.user._id 
        });

        if (!alert) {
            return res.status(404).json({ 
                message: "Alert not found" 
            });
        }

        // Validation
        if (targetAudience === "specific_class" && !targetClass) {
            return res.status(400).json({ 
                message: "Target class is required when targeting specific class" 
            });
        }

        // Update fields
        if (title) alert.title = title;
        if (message) alert.message = message;
        if (type) alert.type = type;
        if (priority) alert.priority = priority;
        if (isActive !== undefined) alert.isActive = isActive;
        if (expiresAt) alert.expiresAt = new Date(expiresAt);
        if (targetAudience) alert.targetAudience = targetAudience;
        if (targetClass) alert.targetClass = targetClass;
        if (targetDivision) alert.targetDivision = targetDivision;

        await alert.save();

        res.json({
            message: "Alert updated successfully",
            alert: await alert.populate("createdBy", "name institutionId")
        });

    } catch (error) {
        console.error('Update Alert Error:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }
        
        res.status(400).json({ 
            message: error.message || 'Failed to update alert' 
        });
    }
});

// Delete alert
router.delete('/alerts/:id', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const alert = await Alert.findOneAndDelete({ 
            _id: req.params.id, 
            institutionId: req.user._id 
        });

        if (!alert) {
            return res.status(404).json({ 
                message: "Alert not found" 
            });
        }

        res.json({
            message: "Alert deleted successfully"
        });

    } catch (error) {
        console.error('Delete Alert Error:', error);
        res.status(500).json({ 
            message: "Failed to delete alert" 
        });
    }
});

// Toggle alert active status
router.patch('/alerts/:id/toggle', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const alert = await Alert.findOne({ 
            _id: req.params.id, 
            institutionId: req.user._id 
        });

        if (!alert) {
            return res.status(404).json({ 
                message: "Alert not found" 
            });
        }

        alert.isActive = !alert.isActive;
        await alert.save();

        res.json({
            message: `Alert ${alert.isActive ? 'activated' : 'deactivated'} successfully`,
            alert: await alert.populate("createdBy", "name institutionId")
        });

    } catch (error) {
        console.error('Toggle Alert Error:', error);
        res.status(500).json({ 
            message: "Failed to toggle alert status" 
        });
    }
});

// Get alert statistics for dashboard
router.get('/alerts/stats/dashboard', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const institutionId = req.user._id;

        const totalAlerts = await Alert.countDocuments({ institutionId });
        const activeAlerts = await Alert.countDocuments({ institutionId, isActive: true });
        const expiredAlerts = await Alert.countDocuments({ 
            institutionId, 
            expiresAt: { $lte: new Date() } 
        });

        // Alerts by type
        const alertsByType = await Alert.aggregate([
            { $match: { institutionId: institutionId } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        // Alerts by priority
        const alertsByPriority = await Alert.aggregate([
            { $match: { institutionId: institutionId } },
            { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]);

        // Recent alerts (last 7 days)
        const recentAlerts = await Alert.countDocuments({ 
            institutionId, 
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
        });

        res.json({
            stats: {
                total: totalAlerts,
                active: activeAlerts,
                expired: expiredAlerts,
                recent: recentAlerts
            },
            breakdowns: {
                byType: alertsByType,
                byPriority: alertsByPriority
            }
        });

    } catch (error) {
        console.error('Alert Stats Error:', error);
        res.status(500).json({ 
            message: "Failed to fetch alert statistics" 
        });
    }
});

module.exports = router;