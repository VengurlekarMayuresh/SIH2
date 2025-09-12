const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const StudentProgress = require('../models/StudentProgress');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Badge = require('../models/Badge');
const StudentBadge = require('../models/StudentBadge');
const StudentRanking = require('../models/StudentRanking');
const { authMiddleware, studentOnly, institutionOnly } = require('../middleware');

// =========================================================
// === INSTITUTION ROUTES (Content Management) ===
// =========================================================

// POST to create a new module
router.post('/institution/modules', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const newModule = new Module(req.body);
        await newModule.save();
        res.status(201).json(newModule);
    } catch (error) {
        console.error("Error creating module:", error);
        res.status(500).json({ message: "Error creating module." });
    }
});

// GET all modules (for institution dashboard/management)
router.get('/institution/modules', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const modules = await Module.find().select('title thumbnail chapters');
        res.json(modules);
    } catch (error) {
        console.error("Error fetching modules:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET a single module with full details (for institution editing)
router.get('/institution/modules/:id', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ message: "Module not found." });
        }
        res.json(module);
    } catch (error) {
        console.error("Error fetching module for edit:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// PUT to update an existing module
router.put('/institution/modules/:id', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const updatedModule = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedModule) {
            return res.status(404).json({ message: "Module not found." });
        }
        res.json(updatedModule);
    } catch (error) {
        console.error("Error updating module:", error);
        res.status(500).json({ message: "Error updating module." });
    }
});

// DELETE a module
router.delete('/institution/modules/:id', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const deletedModule = await Module.findByIdAndDelete(req.params.id);
        if (!deletedModule) {
            return res.status(404).json({ message: "Module not found." });
        }
        res.json({ message: "Module deleted successfully." });
    } catch (error) {
        console.error("Error deleting module:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// POST to add a new chapter to a module
router.post('/institution/modules/:moduleId/chapters', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { title } = req.body;
        const newChapter = { title, contents: [] };
        const updatedModule = await Module.findByIdAndUpdate(
            req.params.moduleId,
            { $push: { chapters: newChapter } },
            { new: true }
        );
        if (!updatedModule) {
            return res.status(404).json({ message: "Module not found." });
        }
        res.status(201).json(updatedModule);
    } catch (error) {
        console.error("Error adding chapter:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// PUT to update a specific chapter
router.put('/institution/modules/:moduleId/chapters/:chapterId', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { title } = req.body;
        const updatedModule = await Module.findOneAndUpdate(
            { "_id": req.params.moduleId, "chapters._id": req.params.chapterId },
            { "$set": { "chapters.$.title": title } },
            { new: true }
        );
        if (!updatedModule) {
            return res.status(404).json({ message: "Module or chapter not found." });
        }
        res.json(updatedModule);
    } catch (error) {
        console.error("Error updating chapter:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// DELETE a chapter from a module
router.delete('/institution/modules/:moduleId/chapters/:chapterId', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const updatedModule = await Module.findByIdAndUpdate(
            req.params.moduleId,
            { $pull: { chapters: { _id: req.params.chapterId } } },
            { new: true }
        );
        if (!updatedModule) {
            return res.status(404).json({ message: "Module or chapter not found." });
        }
        res.json({ message: "Chapter deleted successfully." });
    } catch (error) {
        console.error("Error deleting chapter:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// POST to add new content to a chapter
router.post('/institution/modules/:moduleId/chapters/:chapterId/contents', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { type, body, videoUrl, imageUrl } = req.body;
        const newContent = { type, body, videoUrl, imageUrl };
        const updatedModule = await Module.findOneAndUpdate(
            { "_id": req.params.moduleId, "chapters._id": req.params.chapterId },
            { "$push": { "chapters.$.contents": newContent } },
            { new: true }
        );
        if (!updatedModule) {
            return res.status(404).json({ message: "Module or chapter not found." });
        }
        res.status(201).json(updatedModule);
    } catch (error) {
        console.error("Error adding content:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// =========================================================
// === INSTITUTION QUIZ MANAGEMENT ROUTES ===
// =========================================================

// POST to create a new quiz
router.post('/institution/quizzes', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const quizData = {
            ...req.body,
            createdBy: 'system' // Global system content
        };
        const newQuiz = new Quiz(quizData);
        await newQuiz.save();
        res.status(201).json(newQuiz);
    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ 
            message: "Error creating quiz.",
            error: error.message 
        });
    }
});

// GET all quizzes for an institution
router.get('/institution/quizzes', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const quizzes = await Quiz.find({})
            .populate('moduleId', 'title')
            .select('title description moduleId status createdAt questions.length settings.timeLimit');
        res.json(quizzes);
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET a single quiz for editing
router.get('/institution/quizzes/:id', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('moduleId', 'title');
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }
        res.json(quiz);
    } catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// PUT to update a quiz
router.put('/institution/quizzes/:id', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedQuiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }
        res.json(updatedQuiz);
    } catch (error) {
        console.error("Error updating quiz:", error);
        res.status(500).json({ 
            message: "Error updating quiz.",
            error: error.message 
        });
    }
});

// DELETE a quiz
router.delete('/institution/quizzes/:id', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!deletedQuiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }
        
        // Also delete all quiz attempts for this quiz
        await QuizAttempt.deleteMany({ quiz: req.params.id });
        
        res.json({ message: "Quiz deleted successfully." });
    } catch (error) {
        console.error("Error deleting quiz:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// PUT to publish/unpublish a quiz
router.put('/institution/quizzes/:id/status', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['draft', 'published', 'archived'].includes(status)) {
            return res.status(400).json({ message: "Invalid status." });
        }
        
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }
        
        res.json({ message: `Quiz ${status} successfully.`, quiz });
    } catch (error) {
        console.error("Error updating quiz status:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET quiz analytics for institution
router.get('/institution/quizzes/:id/analytics', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }
        
        const attempts = await QuizAttempt.find({ quiz: req.params.id, status: 'submitted' })
            .populate('student', 'name email');
        
        const analytics = {
            totalAttempts: attempts.length,
            averageScore: 0,
            passRate: 0,
            averageTime: 0,
            questionStats: [],
            recentAttempts: attempts.slice(-10).map(attempt => ({
                student: attempt.student,
                score: attempt.score,
                completedAt: attempt.createdAt
            }))
        };
        
        if (attempts.length > 0) {
            analytics.averageScore = attempts.reduce((sum, a) => sum + a.score.percentage, 0) / attempts.length;
            analytics.passRate = (attempts.filter(a => a.score.passed).length / attempts.length) * 100;
            analytics.averageTime = attempts.reduce((sum, a) => sum + a.timing.totalTimeSpent, 0) / attempts.length;
        }
        
        res.json(analytics);
    } catch (error) {
        console.error("Error fetching quiz analytics:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// =========================================================
// === STUDENT ROUTES (Consumption & Progress) ===
// =========================================================

// GET all available modules (public access for students to browse)
router.get('/modules', async (req, res) => {
    try {
        const modules = await Module.find().select('title description thumbnail');
        res.json(modules);
    } catch (error) {
        console.error("Error fetching modules:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET a specific module with all its chapters and content
router.get('/modules/:id', authMiddleware, studentOnly, async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ message: "Module not found." });
        }
        res.json(module);
    } catch (error) {
        console.error("Error fetching module details:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// POST to update a student's progress on a module
router.post('/student/progress', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { moduleId, completed } = req.body;
        
        let progress = await StudentProgress.findOne({
            student: req.user._id,
            module: moduleId,
        });

        if (progress) {
            progress.completed = completed;
            if (completed) {
                progress.completionDate = new Date();
            }
        } else {
            progress = new StudentProgress({
                student: req.user._id,
                module: moduleId,
                completed,
                completionDate: completed ? new Date() : null,
            });
        }
        await progress.save();
        res.json({ message: "Progress updated successfully." });
    } catch (error) {
        console.error("Error updating student progress:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// =========================================================
// === STUDENT QUIZ ROUTES ===
// =========================================================

// GET all available quizzes for students
router.get('/student/quizzes', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { page = 1, limit = 12, difficulty, moduleId } = req.query;
        
        let filter = { status: 'published' };
        if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
        if (moduleId && moduleId !== 'all') filter.moduleId = moduleId;
        
        const quizzes = await Quiz.find(filter)
            .populate('moduleId', 'title thumbnail')
            .select('-questions.options.isCorrect') // Don't expose correct answers
            .sort({ createdAt: -1 })
            .limit(parseInt(limit) * parseInt(page))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await Quiz.countDocuments(filter);
        
        // For each quiz, check student's attempts
        const quizzesWithProgress = await Promise.all(quizzes.map(async (quiz) => {
            const attempts = await QuizAttempt.find({
                student: req.user._id,
                quiz: quiz._id,
                status: 'submitted'
            }).sort({ createdAt: -1 }).limit(1);
            
            const lastAttempt = attempts[0];
            const canAttempt = await QuizAttempt.canAttemptQuiz(req.user._id, quiz);
            
            return {
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                module: {
                    _id: quiz.moduleId._id,
                    title: quiz.moduleId.title,
                    thumbnail: quiz.moduleId.thumbnail
                },
                source: quiz.createdBy || 'system',
                questionCount: quiz.questions.length,
                timeLimit: quiz.settings.timeLimit,
                passingScore: quiz.settings.passingScore,
                difficulty: quiz.difficulty || 'medium',
                attemptCount: await QuizAttempt.countDocuments({ student: req.user._id, quiz: quiz._id }),
                lastScore: lastAttempt ? lastAttempt.score.percentage : null,
                lastTime: lastAttempt ? lastAttempt.timing.totalTimeSpent : null,
                canAttempt: canAttempt.canAttempt,
                createdAt: quiz.createdAt
            };
        }));
        
        res.json({
            quizzes: quizzesWithProgress,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching student quizzes:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET featured quizzes for students
router.get('/student/quizzes/featured', authMiddleware, studentOnly, async (req, res) => {
    try {
        // Get recently created quizzes and popular ones
        const recentQuizzes = await Quiz.find({ status: 'published' })
            .populate('moduleId', 'title thumbnail')
            .select('-questions.options.isCorrect')
            .sort({ createdAt: -1 })
            .limit(3);
            
        // Get quizzes with most attempts (popular)
        const popularQuizzes = await Quiz.aggregate([
            { $match: { status: 'published' } },
            { $lookup: {
                from: 'quizattempts',
                localField: '_id',
                foreignField: 'quiz',
                as: 'attempts'
            }},
            { $addFields: { attemptCount: { $size: '$attempts' } } },
            { $sort: { attemptCount: -1 } },
            { $limit: 3 },
            { $lookup: {
                from: 'modules',
                localField: 'moduleId',
                foreignField: '_id',
                as: 'module'
            }},
            { $unwind: '$module' }
        ]);
        
        const featured = [
            ...recentQuizzes.map(quiz => ({
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                module: {
                    _id: quiz.moduleId._id,
                    title: quiz.moduleId.title,
                    thumbnail: quiz.moduleId.thumbnail
                },
                source: quiz.createdBy || 'system',
                questionCount: quiz.questions.length,
                timeLimit: quiz.settings.timeLimit,
                passingScore: quiz.settings.passingScore,
                reason: 'Recently Added'
            })),
            ...popularQuizzes.map(quiz => ({
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                module: {
                    _id: quiz.module._id,
                    title: quiz.module.title,
                    thumbnail: quiz.module.thumbnail
                },
                source: quiz.createdBy || 'system',
                questionCount: quiz.questions.length,
                timeLimit: quiz.settings.timeLimit,
                passingScore: quiz.settings.passingScore,
                reason: 'Popular Choice'
            }))
        ];
        
        // Get categories (modules with quiz counts)
        const categories = await Quiz.aggregate([
            { $match: { status: 'published' } },
            { $lookup: {
                from: 'modules',
                localField: 'moduleId',
                foreignField: '_id',
                as: 'module'
            }},
            { $unwind: '$module' },
            { $group: {
                _id: '$module.title',
                count: { $sum: 1 }
            }},
            { $project: {
                name: '$_id',
                count: 1,
                _id: 0
            }}
        ]);
        
        res.json({ featured, categories });
    } catch (error) {
        console.error('Error fetching featured quizzes:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET available quizzes for a module
router.get('/modules/:moduleId/quiz', authMiddleware, studentOnly, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ 
            moduleId: req.params.moduleId, 
            status: 'published' 
        }).select('-questions.options.isCorrect'); // Don't send correct answers
        
        if (!quiz) {
            return res.status(404).json({ message: "No quiz found for this module." });
        }
        
        // Check if student can attempt this quiz
        const canAttempt = await QuizAttempt.canAttemptQuiz(req.user._id, quiz);
        if (!canAttempt.canAttempt) {
            return res.status(403).json({ 
                message: canAttempt.reason,
                retakeAvailableAt: canAttempt.retakeAvailableAt
            });
        }
        
        // Randomize questions and options if settings require it
        let processedQuestions = [...quiz.questions];
        if (quiz.settings.randomizeQuestions) {
            processedQuestions = processedQuestions.sort(() => Math.random() - 0.5);
        }
        
        if (quiz.settings.randomizeOptions) {
            processedQuestions = processedQuestions.map(q => ({
                ...q.toObject(),
                options: q.options.sort(() => Math.random() - 0.5)
            }));
        }
        
        res.json({
            ...quiz.toObject(),
            questions: processedQuestions
        });
    } catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// POST to start a quiz attempt
router.post('/student/quiz/start', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { quizId } = req.body;
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz || quiz.status !== 'published') {
            return res.status(404).json({ message: "Quiz not found or not available." });
        }
        
        // Check if student can attempt this quiz
        const canAttempt = await QuizAttempt.canAttemptQuiz(req.user._id, quiz);
        if (!canAttempt.canAttempt) {
            return res.status(403).json({ 
                message: canAttempt.reason,
                retakeAvailableAt: canAttempt.retakeAvailableAt
            });
        }
        
        const attemptNumber = await QuizAttempt.getNextAttemptNumber(req.user._id, quizId);
        
        const newAttempt = new QuizAttempt({
            student: req.user._id,
            quiz: quizId,
            attemptNumber,
            timing: {
                startTime: new Date(),
                timeLimit: quiz.settings.timeLimit * 60 // Convert minutes to seconds
            },
            metadata: {
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip,
                randomizedQuestions: quiz.settings.randomizeQuestions,
                randomizedOptions: quiz.settings.randomizeOptions
            }
        });
        
        await newAttempt.save();
        
        res.status(201).json({
            attemptId: newAttempt._id,
            attemptNumber,
            startTime: newAttempt.timing.startTime,
            timeLimit: newAttempt.timing.timeLimit
        });
    } catch (error) {
        console.error("Error starting quiz attempt:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// POST to submit quiz answers
router.post('/student/quiz/submit', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { attemptId, answers } = req.body;
        
        const attempt = await QuizAttempt.findOne({
            _id: attemptId,
            student: req.user._id,
            status: 'in_progress'
        }).populate('quiz');
        
        if (!attempt) {
            return res.status(404).json({ message: "Quiz attempt not found or already submitted." });
        }
        
        const quiz = attempt.quiz;
        
        // Process answers
        const processedAnswers = [];
        for (const answer of answers) {
            const question = quiz.questions.id(answer.questionId);
            if (!question) continue;
            
            const selectedOptions = answer.selectedOptions || [];
            const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt._id.toString());
            
            // Check if answer is correct
            const isCorrect = selectedOptions.length === correctOptions.length &&
                selectedOptions.every(opt => correctOptions.includes(opt.toString()));
            
            let pointsEarned = 0;
            if (isCorrect) {
                pointsEarned = question.points;
                // Apply hint penalty if hints were used
                if (answer.hintsUsed > 0) {
                    const hintPenalty = question.hints.slice(0, answer.hintsUsed)
                        .reduce((penalty, hint) => penalty + hint.penalty, 0);
                    pointsEarned = Math.max(0, pointsEarned * (1 - hintPenalty));
                }
            }
            
            processedAnswers.push({
                questionId: answer.questionId,
                selectedOptions,
                isCorrect,
                pointsEarned,
                timeSpent: answer.timeSpent || 0,
                confidence: answer.confidence,
                hintsUsed: answer.hintsUsed || 0,
                hintPenalty: answer.hintPenalty || 0
            });
        }
        
        // Update attempt
        attempt.answers = processedAnswers;
        attempt.timing.endTime = new Date();
        attempt.status = 'submitted';
        
        await attempt.save();
        
        // Check and award badges
        const newBadges = await StudentBadge.checkAndAwardBadges(req.user._id, {
            ...attempt.toObject(),
            moduleId: quiz.moduleId
        });
        
        // Update student ranking
        const updatedRanking = await StudentRanking.updateStudentRanking(req.user._id, attempt);
        
        // Prepare response
        const response = {
            score: attempt.score,
            timing: attempt.timing,
            passed: attempt.score.passed,
            analytics: attempt.getAnalytics(),
            badges: newBadges.map(badge => ({
                id: badge._id,
                name: badge.badge.name,
                description: badge.badge.description,
                icon: badge.badge.icon,
                type: badge.badge.type,
                rarity: badge.badge.rarity,
                points: badge.badge.points,
                earnedAt: badge.earnedAt
            }))
        };
        
        // Include correct answers if quiz allows it
        if (quiz.settings.showCorrectAnswers) {
            response.correctAnswers = quiz.questions.map(q => ({
                questionId: q._id,
                correctOptions: q.options.filter(opt => opt.isCorrect).map(opt => opt._id),
                explanation: q.explanation
            }));
        }
        
        res.json(response);
    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET student's quiz attempts
router.get('/student/quiz/attempts', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { quizId } = req.query;
        const filter = { student: req.user._id };
        if (quizId) filter.quiz = quizId;
        
        const attempts = await QuizAttempt.find(filter)
            .populate('quiz', 'title description moduleId')
            .sort({ createdAt: -1 });
        
        const summaries = attempts.map(attempt => attempt.getSummary());
        res.json(summaries);
    } catch (error) {
        console.error("Error fetching quiz attempts:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET specific quiz attempt details
router.get('/student/quiz/attempts/:attemptId', authMiddleware, studentOnly, async (req, res) => {
    try {
        const attempt = await QuizAttempt.findOne({
            _id: req.params.attemptId,
            student: req.user._id
        }).populate('quiz', 'title settings');
        
        if (!attempt) {
            return res.status(404).json({ message: "Quiz attempt not found." });
        }
        
        res.json(attempt);
    } catch (error) {
        console.error("Error fetching quiz attempt:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// =========================================================
// === BADGE AND ACHIEVEMENT ROUTES ===
// =========================================================

// GET student's dashboard data (recent activity, streaks, next badge)
router.get('/student/dashboard-data', authMiddleware, studentOnly, async (req, res) => {
    try {
        const studentId = req.user._id;
        
        // Get recent quiz attempts (last 5)
        const recentQuizAttempts = await QuizAttempt.find({ 
            student: studentId, 
            status: 'submitted' 
        })
        .populate('quiz', 'title moduleId')
        .populate({
            path: 'quiz',
            populate: {
                path: 'moduleId',
                select: 'title'
            }
        })
        .sort({ createdAt: -1 })
        .limit(5);
        
        // Get recent module completions
        const recentModuleCompletions = await StudentProgress.find({
            student: studentId,
            completed: true
        })
        .populate('module', 'title')
        .sort({ completionDate: -1 })
        .limit(3);
        
        // Get recently earned badges (last 3)
        const { badges: allBadges } = await StudentBadge.getStudentBadges(studentId);
        const recentBadges = allBadges.slice(0, 3);
        
        // Calculate streak data
        const allAttempts = await QuizAttempt.find({ 
            student: studentId, 
            status: 'submitted' 
        })
        .select('score createdAt')
        .sort({ createdAt: -1 });
        
        // Calculate current streak (consecutive passed quizzes)
        let currentStreak = 0;
        for (let attempt of allAttempts) {
            if (attempt.score.passed) {
                currentStreak++;
            } else {
                break;
            }
        }
        
        // Get next badge info
        const allAvailableBadges = await Badge.find().sort({ points: 1 });
        const earnedBadgeIds = allBadges.map(sb => sb.badge._id.toString());
        const nextBadge = allAvailableBadges.find(badge => 
            !earnedBadgeIds.includes(badge._id.toString())
        );
        
        // Get overall progress for next badge calculation
        const totalModules = await Module.countDocuments();
        const completedModules = await StudentProgress.countDocuments({
            student: studentId,
            completed: true
        });
        
        // Prepare recent activity array
        const recentActivity = [];
        
        // Add recent badges to activity
        recentBadges.forEach(badge => {
            recentActivity.push({
                type: 'badge',
                title: `Earned "${badge.badge.name}" badge`,
                description: badge.badge.description,
                time: badge.earnedAt,
                icon: 'Award',
                color: 'accent',
                badge: badge.badge.rarity === 'gold' ? 'New!' : null
            });
        });
        
        // Add recent module completions to activity
        recentModuleCompletions.forEach(completion => {
            recentActivity.push({
                type: 'module',
                title: `Completed ${completion.module.title} module`,
                description: 'Learned about disaster preparedness and safety measures',
                time: completion.completionDate,
                icon: 'BookOpen',
                color: 'primary',
                progress: 100
            });
        });
        
        // Add recent quiz attempts to activity
        recentQuizAttempts.forEach(attempt => {
            const moduleName = attempt.quiz.moduleId ? attempt.quiz.moduleId.title : 'General';
            recentActivity.push({
                type: 'quiz',
                title: `Took ${attempt.quiz.title}`,
                description: `Scored ${Math.round(attempt.score.percentage)}% - ${attempt.score.passed ? 'Great job!' : 'Keep practicing!'}`,
                time: attempt.createdAt,
                icon: 'HelpCircle',
                color: 'secondary',
                badge: `${Math.round(attempt.score.percentage)}%`
            });
        });
        
        // Sort all activity by time (most recent first)
        recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        // Calculate today's progress
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Count today's completed activities
        const todayQuizzes = await QuizAttempt.countDocuments({
            student: studentId,
            status: 'submitted',
            createdAt: { $gte: today, $lt: tomorrow }
        });
        
        const todayModules = await StudentProgress.countDocuments({
            student: studentId,
            completed: true,
            completionDate: { $gte: today, $lt: tomorrow }
        });
        
        const todayBadges = allBadges.filter(badge => {
            const badgeDate = new Date(badge.earnedAt);
            return badgeDate >= today && badgeDate < tomorrow;
        }).length;
        
        const todayActivities = todayQuizzes + todayModules + todayBadges;
        const dailyGoal = 3; // Default daily goal - could be made configurable per user
        
        res.json({
            streak: currentStreak,
            recentActivity: recentActivity.slice(0, 5), // Limit to 5 most recent
            todayProgress: {
                completed: todayActivities,
                goal: dailyGoal,
                percentage: Math.round((todayActivities / dailyGoal) * 100),
                breakdown: {
                    quizzes: todayQuizzes,
                    modules: todayModules,
                    badges: todayBadges
                }
            },
            nextBadge: nextBadge ? {
                name: nextBadge.name,
                description: nextBadge.description,
                icon: nextBadge.icon,
                progress: Math.round((completedModules / totalModules) * 100),
                requirement: `${completedModules}/${totalModules} modules completed`
            } : null
        });
        
    } catch (error) {
        console.error("Error fetching student dashboard:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET student's comprehensive progress dashboard
router.get('/student/progress-dashboard', authMiddleware, studentOnly, async (req, res) => {
    try {
        const studentId = req.user._id;
        
        // Get all modules and progress
        const modules = await Module.find().select('title thumbnail chapters');
        const moduleProgresses = await StudentProgress.find({ student: studentId }).populate('module', 'title');
        
        // Get quiz attempts and scores
        const quizAttempts = await QuizAttempt.find({ 
            student: studentId, 
            status: 'submitted' 
        }).populate('quiz', 'title moduleId').sort({ createdAt: -1 });
        
        // Get student badges
        const { badges, stats } = await StudentBadge.getStudentBadges(studentId);
        
        // Calculate overall statistics
        const totalModules = modules.length;
        const completedModules = moduleProgresses.filter(p => p.completed).length;
        const totalBadges = badges.length;
        
        // Calculate quiz score trends (last 6 attempts or weeks)
        const recentAttempts = quizAttempts.slice(0, 6).reverse();
        const quizTrends = recentAttempts.map((attempt, index) => ({
            date: `Attempt ${index + 1}`,
            score: attempt.score.percentage
        }));
        
        // Calculate module progress data
        const moduleProgressData = modules.map(module => {
            const progress = moduleProgresses.find(p => p.module._id.toString() === module._id.toString());
            return {
                module: module.title,
                progress: progress ? (progress.completed ? 100 : 50) : 0, // 50% if started, 100% if completed
                color: "#3A7CA5" // Default color
            };
        });
        
        // Calculate overall progress percentage
        const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
        
        // Get latest quiz score
        const latestQuizScore = quizAttempts.length > 0 ? quizAttempts[0].score.percentage : 0;
        
        // Prepare badge data with earned status
        const allBadges = await Badge.find().sort({ createdAt: -1 });
        const badgeData = allBadges.map(badge => {
            const earnedBadge = badges.find(sb => sb.badge._id.toString() === badge._id.toString());
            return {
                title: badge.name,
                description: badge.description,
                icon: badge.icon,
                color: badge.rarity === 'gold' ? 'accent' : badge.rarity === 'silver' ? 'secondary' : 'primary',
                earned: !!earnedBadge,
                date: earnedBadge ? earnedBadge.earnedAt : 'Not earned'
            };
        });
        
        res.json({
            stats: {
                completedModules,
                totalModules,
                latestQuizScore,
                earnedBadges: totalBadges,
                overallProgress
            },
            quizScoreData: quizTrends.length > 0 ? quizTrends : [
                { date: "Week 1", score: 0 }
            ],
            moduleProgressData,
            badges: badgeData,
            joinedDate: req.user.createdAt,
            improvement: quizTrends.length >= 2 ? 
                Math.round(((quizTrends[quizTrends.length - 1].score - quizTrends[0].score) / quizTrends[0].score) * 100) : 0
        });
        
    } catch (error) {
        console.error("Error fetching student progress dashboard:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET student's badges and achievements
router.get('/student/badges', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { badges, stats } = await StudentBadge.getStudentBadges(req.user._id);
        
        res.json({
            badges: badges.map(sb => ({
                id: sb._id,
                name: sb.badge.name,
                description: sb.badge.description,
                icon: sb.badge.icon,
                type: sb.badge.type,
                rarity: sb.badge.rarity,
                category: sb.badge.category,
                points: sb.badge.points,
                earnedAt: sb.earnedAt,
                context: sb.metadata
            })),
            stats
        });
    } catch (error) {
        console.error("Error fetching student badges:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET all available badges (for students to see what they can earn)
router.get('/badges', authMiddleware, studentOnly, async (req, res) => {
    try {
        const allBadges = await Badge.find({ isActive: true })
            .select('name description icon type rarity category points criteria');
        
        // Get student's earned badges to show progress
        const earnedBadges = await StudentBadge.find({ 
            student: req.user._id 
        }).select('badge');
        
        const earnedBadgeIds = earnedBadges.map(sb => sb.badge.toString());
        
        const badgesWithProgress = allBadges.map(badge => ({
            id: badge._id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            type: badge.type,
            rarity: badge.rarity,
            category: badge.category,
            points: badge.points,
            isEarned: earnedBadgeIds.includes(badge._id.toString()),
            criteria: badge.criteria
        }));
        
        res.json(badgesWithProgress);
    } catch (error) {
        console.error("Error fetching available badges:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Initialize default badges (admin/institution route)
router.post('/institution/badges/initialize', authMiddleware, institutionOnly, async (req, res) => {
    try {
        await Badge.createDefaultBadges();
        res.json({ message: "Default badges initialized successfully." });
    } catch (error) {
        console.error("Error initializing badges:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET badge analytics for institution
router.get('/institution/badges/analytics', authMiddleware, institutionOnly, async (req, res) => {
    try {
        // Get all students from this institution
        const Student = require('../models/Student');
        const institutionStudents = await Student.find({ 
            institutionId: req.user._id 
        }).select('_id');
        
        const studentIds = institutionStudents.map(s => s._id);
        
        // Get badge statistics for institution's students
        const badgeStats = await StudentBadge.aggregate([
            { $match: { student: { $in: studentIds } } },
            { $lookup: {
                from: 'badges',
                localField: 'badge',
                foreignField: '_id',
                as: 'badgeInfo'
            }},
            { $unwind: '$badgeInfo' },
            { $group: {
                _id: '$badgeInfo._id',
                name: { $first: '$badgeInfo.name' },
                category: { $first: '$badgeInfo.category' },
                type: { $first: '$badgeInfo.type' },
                rarity: { $first: '$badgeInfo.rarity' },
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } }
        ]);
        
        res.json({
            totalStudents: studentIds.length,
            badgeStats,
            summary: {
                mostPopularBadges: badgeStats.slice(0, 5),
                totalBadgesEarned: badgeStats.reduce((sum, badge) => sum + badge.count, 0)
            }
        });
    } catch (error) {
        console.error("Error fetching badge analytics:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// =========================================================
// === QUIZ DISCOVERY ROUTES (Quiz Cards) ===
// =========================================================

// GET individual quiz details
router.get('/quizzes/:id', authMiddleware, studentOnly, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('moduleId', 'title thumbnail')
            .select('-questions.options.isCorrect'); // Don't send correct answers to frontend
        
        if (!quiz || quiz.status !== 'published') {
            return res.status(404).json({ message: "Quiz not found or not available." });
        }
        
        // Check if student can attempt this quiz
        const canAttempt = await QuizAttempt.canAttemptQuiz(req.user._id, quiz);
        
        // Get student's attempt history for this quiz
        const attempts = await QuizAttempt.find({
            quiz: quiz._id,
            student: req.user._id,
            status: { $in: ['submitted', 'completed'] }
        }).select('attemptNumber score timing status createdAt').sort({ createdAt: -1 });
        
        res.json({
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            moduleId: quiz.moduleId,
            questions: quiz.questions,
            settings: quiz.settings,
            status: quiz.status,
            createdAt: quiz.createdAt,
            canAttempt: canAttempt.canAttempt,
            attempts: attempts.length
        });
    } catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET all published quizzes as cards (for quiz browsing)
router.get('/quizzes', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { page = 1, limit = 12, category, difficulty, moduleId } = req.query;
        
        // Build filter
        const filter = { status: 'published' };
        if (moduleId) filter.moduleId = moduleId;
        if (difficulty) filter['questions.difficulty'] = difficulty;
        
        const quizzes = await Quiz.find(filter)
            .populate('moduleId', 'title thumbnail')
            .select('title description moduleId createdBy settings.timeLimit settings.passingScore questions status createdAt')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        // Get attempt counts for each quiz
        const quizCards = await Promise.all(quizzes.map(async (quiz) => {
            const attemptCount = await QuizAttempt.countDocuments({
                quiz: quiz._id,
                student: req.user._id,
                status: 'submitted'
            });
            
            const lastAttempt = await QuizAttempt.findOne({
                quiz: quiz._id,
                student: req.user._id,
                status: 'submitted'
            }).sort({ createdAt: -1 }).select('score timing');
            
            return {
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                module: quiz.moduleId,
                source: quiz.createdBy, // 'system' for global content
                questionCount: quiz.questions.length,
                timeLimit: quiz.settings.timeLimit,
                passingScore: quiz.settings.passingScore,
                difficulty: quiz.questions.length > 0 ? 
                    quiz.questions.reduce((acc, q, idx) => {
                        if (idx === 0) return q.difficulty;
                        return acc === q.difficulty ? acc : 'mixed';
                    }, quiz.questions[0]?.difficulty) : 'medium',
                attemptCount,
                lastScore: lastAttempt?.score.percentage || null,
                lastTime: lastAttempt?.timing.totalTimeSpent || null,
                canAttempt: attemptCount < quiz.settings.maxAttempts,
                createdAt: quiz.createdAt
            };
        }));
        
        const total = await Quiz.countDocuments(filter);
        
        res.json({
            quizzes: quizCards,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching quiz cards:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET featured/recommended quizzes
router.get('/quizzes/featured', authMiddleware, studentOnly, async (req, res) => {
    try {
        // Get student's progress to recommend relevant quizzes
        const studentProgress = await StudentProgress.find({ 
            student: req.user._id,
            completed: true 
        }).populate('module');
        
        const completedModuleIds = studentProgress.map(p => p.module._id);
        
        // Recommend quizzes from completed modules and new modules
        const featuredQuizzes = await Quiz.find({
            status: 'published',
            $or: [
                { moduleId: { $in: completedModuleIds } },
                { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } // New quizzes from last week
            ]
        })
        .populate('moduleId', 'title thumbnail')
        .select('title description moduleId createdBy questions.length settings.timeLimit settings.passingScore')
        .limit(8)
        .sort({ createdAt: -1 });
        
        const featuredCards = featuredQuizzes.map(quiz => ({
            id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            module: quiz.moduleId,
            source: quiz.createdBy,
            questionCount: quiz.questions.length,
            timeLimit: quiz.settings.timeLimit,
            passingScore: quiz.settings.passingScore,
            reason: completedModuleIds.includes(quiz.moduleId) ? 
                'Based on your completed modules' : 'New quiz'
        }));
        
        res.json({
            featured: featuredCards,
            categories: [
                { name: 'Fire Safety', count: await Quiz.countDocuments({ status: 'published', 'questions.0': { $exists: true } }) },
                { name: 'Earthquake Safety', count: 0 },
                { name: 'Flood Safety', count: 0 }
            ]
        });
    } catch (error) {
        console.error("Error fetching featured quizzes:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// =========================================================
// === LEADERBOARD AND RANKING ROUTES ===
// =========================================================

// GET global leaderboard
router.get('/leaderboard/global', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const leaderboardData = await StudentRanking.getLeaderboard({
            type: 'global',
            limit: parseInt(limit),
            studentId: req.user._id
        });
        
        res.json(leaderboardData);
    } catch (error) {
        console.error("Error fetching global leaderboard:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET institutional leaderboard
router.get('/leaderboard/institution', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const Student = require('../models/Student');
        const student = await Student.findById(req.user._id);
        
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }
        
        const leaderboardData = await StudentRanking.getLeaderboard({
            type: 'institutional',
            institutionId: student.institutionId,
            limit: parseInt(limit),
            studentId: req.user._id
        });
        
        res.json(leaderboardData);
    } catch (error) {
        console.error("Error fetching institutional leaderboard:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET student's ranking details
router.get('/student/ranking', authMiddleware, studentOnly, async (req, res) => {
    try {
        const ranking = await StudentRanking.findOne({ student: req.user._id })
            .populate('student', 'name email class division')
            .populate('institution', 'name')
            .populate('moduleProgress.moduleId', 'title thumbnail');
        
        if (!ranking) {
            // Create initial ranking if doesn't exist
            const Student = require('../models/Student');
            const student = await Student.findById(req.user._id);
            
            const newRanking = new StudentRanking({
                student: req.user._id,
                institution: student.institutionId
            });
            await newRanking.save();
            
            return res.json({
                student: {
                    name: student.name,
                    class: student.class,
                    division: student.division
                },
                overallStats: newRanking.overallStats,
                badgeStats: newRanking.badgeStats,
                streakStats: newRanking.streakStats,
                rankings: newRanking.rankings,
                rankingScore: newRanking.rankingScore,
                moduleProgress: []
            });
        }
        
        res.json({
            student: {
                name: ranking.student.name,
                email: ranking.student.email,
                class: ranking.student.class,
                division: ranking.student.division
            },
            institution: ranking.institution.name,
            overallStats: ranking.overallStats,
            badgeStats: ranking.badgeStats,
            streakStats: ranking.streakStats,
            rankings: ranking.rankings,
            rankingScore: ranking.rankingScore,
            moduleProgress: ranking.moduleProgress,
            recentActivity: ranking.recentActivity,
            lastUpdated: ranking.updatedAt
        });
    } catch (error) {
        console.error("Error fetching student ranking:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET quiz-specific leaderboard
router.get('/quiz/:quizId/leaderboard', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        
        // Get top attempts for this specific quiz
        const topAttempts = await QuizAttempt.find({
            quiz: req.params.quizId,
            status: 'submitted'
        })
        .populate('student', 'name email class division')
        .sort({ 'score.percentage': -1, 'timing.totalTimeSpent': 1 })
        .limit(parseInt(limit));
        
        // Get student's best attempt for this quiz
        let studentAttempt = null;
        if (req.user._id) {
            studentAttempt = await QuizAttempt.findOne({
                quiz: req.params.quizId,
                student: req.user._id,
                status: 'submitted'
            })
            .populate('student', 'name email class division')
            .sort({ 'score.percentage': -1, 'timing.totalTimeSpent': 1 });
        }
        
        const leaderboard = topAttempts.map((attempt, index) => ({
            position: index + 1,
            student: {
                id: attempt.student._id,
                name: attempt.student.name,
                class: attempt.student.class,
                division: attempt.student.division
            },
            score: attempt.score.percentage,
            timeSpent: attempt.timing.totalTimeSpent,
            attemptNumber: attempt.attemptNumber,
            completedAt: attempt.createdAt,
            isCurrentUser: attempt.student._id.toString() === req.user._id.toString()
        }));
        
        // Find student's position if not in top results
        let studentPosition = null;
        if (studentAttempt && !leaderboard.find(entry => entry.isCurrentUser)) {
            const betterAttempts = await QuizAttempt.countDocuments({
                quiz: req.params.quizId,
                status: 'submitted',
                $or: [
                    { 'score.percentage': { $gt: studentAttempt.score.percentage } },
                    {
                        'score.percentage': studentAttempt.score.percentage,
                        'timing.totalTimeSpent': { $lt: studentAttempt.timing.totalTimeSpent }
                    }
                ]
            });
            
            studentPosition = {
                position: betterAttempts + 1,
                student: {
                    id: studentAttempt.student._id,
                    name: studentAttempt.student.name,
                    class: studentAttempt.student.class,
                    division: studentAttempt.student.division
                },
                score: studentAttempt.score.percentage,
                timeSpent: studentAttempt.timing.totalTimeSpent,
                attemptNumber: studentAttempt.attemptNumber,
                completedAt: studentAttempt.createdAt,
                isCurrentUser: true
            };
        }
        
        res.json({
            leaderboard,
            studentPosition,
            totalAttempts: await QuizAttempt.countDocuments({ 
                quiz: req.params.quizId, 
                status: 'submitted' 
            })
        });
    } catch (error) {
        console.error("Error fetching quiz leaderboard:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// POST to recalculate rankings (admin/institution route)
router.post('/institution/rankings/recalculate', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { type = 'institutional' } = req.body;
        
        let updatedCount = 0;
        if (type === 'global') {
            updatedCount = await StudentRanking.calculateGlobalRankings();
        } else {
            updatedCount = await StudentRanking.calculateInstitutionalRankings(req.user._id);
        }
        
        res.json({ 
            message: `Rankings recalculated successfully`,
            type,
            studentsUpdated: updatedCount
        });
    } catch (error) {
        console.error("Error recalculating rankings:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// GET ranking statistics for institution
router.get('/institution/rankings/stats', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const Student = require('../models/Student');
        const institutionStudents = await Student.find({ 
            institutionId: req.user._id 
        }).select('_id');
        
        const studentIds = institutionStudents.map(s => s._id);
        
        const rankingStats = await StudentRanking.aggregate([
            { $match: { student: { $in: studentIds } } },
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    averageRankingScore: { $avg: '$rankingScore' },
                    averageQuizScore: { $avg: '$overallStats.averageScore' },
                    totalQuizzesCompleted: { $sum: '$overallStats.totalQuizzes' },
                    totalBadgesEarned: { $sum: '$badgeStats.totalBadges' },
                    activeStudents: {
                        $sum: {
                            $cond: [{ $gte: ['$overallStats.totalQuizzes', 1] }, 1, 0]
                        }
                    }
                }
            }
        ]);
        
        const topPerformers = await StudentRanking.find({ 
            institution: req.user._id 
        })
        .populate('student', 'name class division')
        .sort({ rankingScore: -1 })
        .limit(10)
        .select('student rankingScore overallStats.averageScore badgeStats.totalBadges');
        
        res.json({
            summary: rankingStats[0] || {
                totalStudents: 0,
                averageRankingScore: 0,
                averageQuizScore: 0,
                totalQuizzesCompleted: 0,
                totalBadgesEarned: 0,
                activeStudents: 0
            },
            topPerformers: topPerformers.map((ranking, index) => ({
                position: index + 1,
                student: {
                    name: ranking.student.name,
                    class: ranking.student.class,
                    division: ranking.student.division
                },
                rankingScore: ranking.rankingScore,
                averageScore: ranking.overallStats.averageScore,
                totalBadges: ranking.badgeStats.totalBadges
            }))
        });
    } catch (error) {
        console.error("Error fetching ranking statistics:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// =========================================================
// === INSTITUTION ROUTES (Student Progress Viewing) ===
// =========================================================

// GET a specific student's progress for an institution
router.get('/institution/students/:studentId/progress', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const studentProgress = await StudentProgress.find({ student: req.params.studentId })
            .populate('module', 'title thumbnail');
        
        res.json(studentProgress);
    } catch (error) {
        console.error("Error fetching student progress:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

//A student can view their personal progress without needing a studentId in the URL.
router.get('/student/progress', authMiddleware, studentOnly, async (req, res) => {
    try {
        const studentProgress = await StudentProgress.find({ student: req.user._id }).populate('module', 'title thumbnail');
        res.json(studentProgress);
    } catch (error) {
        console.error("Error fetching student's own progress:", error);
        res.status(500).json({ message: "Internal server error." });
        
    }
});

//This allows you to edit a specific text, video, or image block within a chapter without needing to recreate the whole chapter.
router.put('/institution/modules/:moduleId/chapters/:chapterId/contents/:contentId', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const { type, body, videoUrl, imageUrl } = req.body;
        const updatedModule = await Module.findOneAndUpdate(
            { "_id": req.params.moduleId, "chapters._id": req.params.chapterId },
            { "$set": { "chapters.$.contents.$[contentElem].type": type, "chapters.$.contents.$[contentElem].body": body, "chapters.$.contents.$[contentElem].videoUrl": videoUrl, "chapters.$.contents.$[contentElem].imageUrl": imageUrl } },
            { new: true, arrayFilters: [{ "contentElem._id": req.params.contentId }] }
        );

        if (!updatedModule) {
            return res.status(404).json({ message: "Module, chapter, or content not found." });
        }
        res.json(updatedModule);
    } catch (error) {
        console.error("Error updating content:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

//This route lets you remove a specific text block or video from a chapter.
router.delete('/institution/modules/:moduleId/chapters/:chapterId/contents/:contentId', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const updatedModule = await Module.findByIdAndUpdate(
            req.params.moduleId,
            { "$pull": { "chapters.$.contents": { "_id": req.params.contentId } } },
            { new: true }
        );
        if (!updatedModule) {
            return res.status(404).json({ message: "Module or content not found." });
        }
        res.json({ message: "Content deleted successfully." });
    } catch (error) {
        console.error("Error deleting content:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// =========================================================
// === CLOUDINARY VIDEO UPLOAD ROUTES ===
// =========================================================

const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadVideo, uploadVideoFromUrl, deleteVideo, validateVideoFile, cleanupLocalFile } = require('../utils/uploadVideo');
const { testCloudinaryConnection } = require('../config/cloudinary');

// Configure multer for video uploads
const upload = multer({
    dest: 'uploads/videos/',
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'), false);
        }
    }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Test Cloudinary connection
router.get('/institution/cloudinary/test', authMiddleware, institutionOnly, async (req, res) => {
    try {
        const isConnected = await testCloudinaryConnection();
        res.json({ 
            connected: isConnected, 
            message: isConnected ? 'Cloudinary connection successful' : 'Cloudinary connection failed'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error testing Cloudinary connection',
            error: error.message 
        });
    }
});

// Upload video file to Cloudinary
router.post('/institution/upload-video', 
    authMiddleware, 
    institutionOnly, 
    upload.single('video'), 
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No video file uploaded' });
            }

            // Validate video file
            const validation = validateVideoFile(req.file);
            if (!validation.isValid) {
                cleanupLocalFile(req.file.path);
                return res.status(400).json({ message: validation.error });
            }

            console.log('📹 Uploading video to Cloudinary...', {
                filename: req.file.originalname,
                size: `${Math.round(req.file.size / (1024 * 1024))}MB`
            });

            // Upload to Cloudinary
            const uploadResult = await uploadVideo(req.file.path, {
                public_id: `video_${Date.now()}_${req.file.originalname.split('.')[0]}`,
                tags: ['safeed', 'educational', 'institution'],
                context: {
                    alt: req.body.title || req.file.originalname,
                    caption: req.body.description || 'Educational video'
                }
            });

            // Clean up local file
            cleanupLocalFile(req.file.path);

            if (!uploadResult.success) {
                return res.status(500).json({ 
                    message: 'Failed to upload video to Cloudinary',
                    error: uploadResult.error 
                });
            }

            console.log('✅ Video uploaded successfully:', uploadResult.publicId);

            res.json({
                message: 'Video uploaded successfully',
                video: {
                    url: uploadResult.url,
                    optimizedUrl: uploadResult.optimizedUrl,
                    thumbnailUrl: uploadResult.thumbnailUrl,
                    publicId: uploadResult.publicId,
                    duration: uploadResult.duration,
                    size: uploadResult.size,
                    width: uploadResult.width,
                    height: uploadResult.height,
                    format: uploadResult.format,
                    uploadedAt: uploadResult.createdAt
                }
            });
        } catch (error) {
            // Clean up local file in case of error
            if (req.file && req.file.path) {
                cleanupLocalFile(req.file.path);
            }
            
            console.error('❌ Video upload failed:', error);
            res.status(500).json({ 
                message: 'Upload failed',
                error: error.message 
            });
        }
    }
);

// Upload video from URL (for migrating YouTube URLs)
router.post('/institution/upload-video-from-url', 
    authMiddleware, 
    institutionOnly, 
    async (req, res) => {
        try {
            const { videoUrl, title, description } = req.body;

            if (!videoUrl) {
                return res.status(400).json({ message: 'Video URL is required' });
            }

            console.log('📹 Uploading video from URL to Cloudinary:', videoUrl);

            const uploadResult = await uploadVideoFromUrl(videoUrl, {
                public_id: `video_${Date.now()}_${title?.replace(/[^a-zA-Z0-9]/g, '_') || 'imported'}`,
                tags: ['safeed', 'educational', 'imported'],
                context: {
                    alt: title || 'Imported video',
                    caption: description || 'Educational video'
                }
            });

            if (!uploadResult.success) {
                return res.status(500).json({ 
                    message: 'Failed to upload video from URL',
                    error: uploadResult.error 
                });
            }

            console.log('✅ Video from URL uploaded successfully:', uploadResult.publicId);

            res.json({
                message: 'Video uploaded successfully from URL',
                video: {
                    url: uploadResult.url,
                    publicId: uploadResult.publicId,
                    duration: uploadResult.duration,
                    size: uploadResult.size,
                    width: uploadResult.width,
                    height: uploadResult.height
                }
            });
        } catch (error) {
            console.error('❌ Video URL upload failed:', error);
            res.status(500).json({ 
                message: 'Upload from URL failed',
                error: error.message 
            });
        }
    }
);

// Delete video from Cloudinary
router.delete('/institution/video/:publicId', 
    authMiddleware, 
    institutionOnly, 
    async (req, res) => {
        try {
            const { publicId } = req.params;
            
            console.log('🗑️ Deleting video from Cloudinary:', publicId);
            
            const deleteResult = await deleteVideo(publicId);
            
            if (!deleteResult.success) {
                return res.status(500).json({ 
                    message: 'Failed to delete video',
                    error: deleteResult.error 
                });
            }
            
            console.log('✅ Video deleted successfully:', publicId);
            
            res.json({
                message: 'Video deleted successfully',
                publicId,
                result: deleteResult.result
            });
        } catch (error) {
            console.error('❌ Video deletion failed:', error);
            res.status(500).json({ 
                message: 'Delete failed',
                error: error.message 
            });
        }
    }
);

// Get video details from Cloudinary
router.get('/institution/video/:publicId', 
    authMiddleware, 
    institutionOnly, 
    async (req, res) => {
        try {
            const { publicId } = req.params;
            const { getVideoDetails } = require('../utils/uploadVideo');
            
            const videoDetails = await getVideoDetails(publicId);
            
            if (!videoDetails.success) {
                return res.status(404).json({ 
                    message: 'Video not found',
                    error: videoDetails.error 
                });
            }
            
            res.json({
                message: 'Video details retrieved successfully',
                video: videoDetails.video
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Failed to get video details',
                error: error.message 
            });
        }
    }
);

// Batch migrate YouTube URLs to Cloudinary
router.post('/institution/migrate-youtube-videos', 
    authMiddleware, 
    institutionOnly, 
    async (req, res) => {
        try {
            const { moduleId } = req.body;
            
            if (!moduleId) {
                return res.status(400).json({ message: 'Module ID is required' });
            }
            
            const module = await Module.findById(moduleId);
            if (!module) {
                return res.status(404).json({ message: 'Module not found' });
            }
            
            console.log('🔄 Starting YouTube to Cloudinary migration for module:', module.title);
            
            let migratedCount = 0;
            let errors = [];
            
            // Process each chapter
            for (let chapterIndex = 0; chapterIndex < module.chapters.length; chapterIndex++) {
                const chapter = module.chapters[chapterIndex];
                
                // Process each content item
                for (let contentIndex = 0; contentIndex < chapter.contents.length; contentIndex++) {
                    const content = chapter.contents[contentIndex];
                    
                    // Check if it's a video with YouTube URL
                    if (content.type === 'video' && content.videoUrl && content.videoUrl.includes('youtube.com')) {
                        try {
                            console.log(`📹 Migrating video: ${content.videoUrl}`);
                            
                            const uploadResult = await uploadVideoFromUrl(content.videoUrl, {
                                public_id: `migrated_${Date.now()}_${chapterIndex}_${contentIndex}`,
                                tags: ['safeed', 'educational', 'migrated'],
                                context: {
                                    alt: `${chapter.title} - Video content`,
                                    caption: `Educational video from ${chapter.title}`
                                }
                            });
                            
                            if (uploadResult.success) {
                                // Update the content with new Cloudinary URL
                                module.chapters[chapterIndex].contents[contentIndex].videoUrl = uploadResult.url;
                                module.chapters[chapterIndex].contents[contentIndex].videoMetadata = {
                                    publicId: uploadResult.publicId,
                                    duration: uploadResult.duration,
                                    width: uploadResult.width,
                                    height: uploadResult.height,
                                    size: uploadResult.size,
                                    uploadedAt: new Date()
                                };
                                
                                migratedCount++;
                                console.log(`✅ Migrated video ${migratedCount}: ${uploadResult.publicId}`);
                            } else {
                                errors.push({
                                    chapter: chapter.title,
                                    contentIndex,
                                    originalUrl: content.videoUrl,
                                    error: uploadResult.error
                                });
                            }
                        } catch (error) {
                            errors.push({
                                chapter: chapter.title,
                                contentIndex,
                                originalUrl: content.videoUrl,
                                error: error.message
                            });
                        }
                    }
                }
            }
            
            // Save the updated module
            if (migratedCount > 0) {
                await module.save();
                console.log(`💾 Saved module with ${migratedCount} migrated videos`);
            }
            
            res.json({
                message: `Migration completed. ${migratedCount} videos migrated successfully.`,
                migratedCount,
                totalErrors: errors.length,
                errors: errors.slice(0, 5) // Return first 5 errors only
            });
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            res.status(500).json({ 
                message: 'Migration failed',
                error: error.message 
            });
        }
    }
);

module.exports = router;
