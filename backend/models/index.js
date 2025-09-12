// Import and register all models to ensure proper dependencies
// This file should be required early in the application startup

// Base models (no dependencies)
const Institution = require('./Institution');

// Models that depend on Institution
const Student = require('./Student');
const Alert = require('./Alert');
const Weather = require('./Weather');

// Other models (if any)
try {
  const StudentProgress = require('./StudentProgress');
} catch (error) {
  // StudentProgress might not exist yet
}

try {
  const QuizAttempt = require('./QuizAttempt');
} catch (error) {
  // QuizAttempt might not exist yet
}

try {
  const StudentRanking = require('./StudentRanking');
} catch (error) {
  // StudentRanking might not exist yet
}

try {
  const Badge = require('./Badge');
} catch (error) {
  // Badge might not exist yet
}

module.exports = {
  Institution,
  Student,
  Alert,
  Weather
};
