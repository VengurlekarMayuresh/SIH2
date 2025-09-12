import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Trophy, 
  Star, 
  RefreshCw, 
  Clock, 
  Target, 
  BookOpen, 
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Timer,
  BarChart3,
  Award,
  TrendingUp,
  PlayCircle,
  PauseCircle,
  Medal,
  Crown,
  Zap
} from "lucide-react";

// Updated interfaces for new backend
interface QuizQuestion {
  _id: string;
  question: string;
  options: {
    _id: string;
    text: string;
    // isCorrect is not sent to frontend for security
  }[];
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  points: number;
  timeLimit?: number;
  hints?: { text: string; penalty: number }[];
}

interface QuizData {
  _id: string;
  title: string;
  description: string;
  moduleId: string;
  questions: QuizQuestion[];
  settings: {
    timeLimit: number; // in minutes
    passingScore: number;
    maxAttempts: number;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    showCorrectAnswers: boolean;
    allowRetake: boolean;
    retakeDelay: number;
  };
  status: string;
}

interface EarnedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  earnedAt: string;
}

interface QuizResult {
  score: {
    raw: number;
    percentage: number;
    passed: boolean;
  };
  timing: {
    startTime: string;
    endTime: string;
    totalTimeSpent: number;
  };
  analytics: {
    totalQuestions: number;
    correctAnswers: number;
    averageTimePerQuestion: number;
    averageConfidence: number;
    totalHintsUsed: number;
  };
  badges: EarnedBadge[];
  correctAnswers?: {
    questionId: string;
    correctOptions: string[];
    explanation: string;
  }[];
}

const InteractiveQuiz = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Get user data for navbar
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem('userData') || '{}');
    } catch {
      return {};
    }
  })();
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    navigate('/');
  };
  
  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'student') {
      navigate('/auth');
      return;
    }
  }, [navigate]);
  
  // Quiz State
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string[] }>({});
  const [confidence, setConfidence] = useState<{ [questionId: string]: number }>({});
  const [hintsUsed, setHintsUsed] = useState<{ [questionId: string]: number }>({});
  const [questionTimes, setQuestionTimes] = useState<{ [questionId: string]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);
  
  // Results State
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadges, setNewBadges] = useState<EarnedBadge[]>([]);
  
  // Quiz attempt state
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(attemptId || null);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/quizzes/${quizId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz data');
        }

        const data: QuizData = await response.json();
        setQuizData(data);
        
        // Set initial time limit (convert minutes to seconds)
        setTimeLeft(data.settings.timeLimit * 60);
        setQuestionStartTime(Date.now());
        
        // Initialize empty answers for all questions
        const initialAnswers: { [key: string]: string[] } = {};
        const initialConfidence: { [key: string]: number } = {};
        const initialHintsUsed: { [key: string]: number } = {};
        
        data.questions.forEach(q => {
          initialAnswers[q._id] = [];
          initialConfidence[q._id] = 3; // Default confidence
          initialHintsUsed[q._id] = 0;
        });
        
        setSelectedAnswers(initialAnswers);
        setConfidence(initialConfidence);
        setHintsUsed(initialHintsUsed);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  // Start quiz attempt
  const startQuizAttempt = async () => {
    if (!quizData) return;
    
    try {
      const response = await fetch('/api/student/quiz/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quizId: quizData._id })
      });

      if (!response.ok) {
        throw new Error('Failed to start quiz attempt');
      }

      const data = await response.json();
      setCurrentAttemptId(data.attemptId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
    }
  };

  // Timer effect
  useEffect(() => {
    if (!quizData || isPaused || quizCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz(true); // Auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData, isPaused, quizCompleted, timeLeft]);

  // Track time per question
  useEffect(() => {
    if (!quizData || quizCompleted) return;
    
    setQuestionStartTime(Date.now());
    
    return () => {
      if (quizData.questions[currentQuestion]) {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        const questionId = quizData.questions[currentQuestion]._id;
        setQuestionTimes(prev => ({
          ...prev,
          [questionId]: (prev[questionId] || 0) + timeSpent
        }));
      }
    };
  }, [currentQuestion, quizData, quizCompleted]);

  const handleAnswerSelect = (questionId: string, optionId: string, multiSelect = false) => {
    setSelectedAnswers(prev => {
      if (multiSelect) {
        const current = prev[questionId] || [];
        const isSelected = current.includes(optionId);
        return {
          ...prev,
          [questionId]: isSelected 
            ? current.filter(id => id !== optionId)
            : [...current, optionId]
        };
      } else {
        return {
          ...prev,
          [questionId]: [optionId]
        };
      }
    });
  };

  const handleConfidenceChange = (questionId: string, confidenceLevel: number) => {
    setConfidence(prev => ({
      ...prev,
      [questionId]: confidenceLevel
    }));
  };

  const useHint = (questionId: string) => {
    setHintsUsed(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + 1
    }));
  };

  const handleSubmitQuiz = async (timedOut = false) => {
    if (!quizData) {
      setError('Quiz data not available');
      return;
    }
    
    if (!currentAttemptId) {
      setError('Quiz attempt not initialized. Please refresh and try again.');
      return;
    }

    try {
      // Prepare answers in the format expected by backend
      const answers = quizData.questions.map(question => {
        const questionTime = questionTimes[question._id] || 0;
        const timeSpent = currentQuestion === quizData.questions.indexOf(question)
          ? questionTime + Math.floor((Date.now() - questionStartTime) / 1000)
          : questionTime;

        return {
          questionId: question._id,
          selectedOptions: selectedAnswers[question._id] || [],
          timeSpent,
          confidence: confidence[question._id] || 3,
          hintsUsed: hintsUsed[question._id] || 0
        };
      });

      console.log('Submitting quiz with:', {
        attemptId: currentAttemptId,
        answers: answers
      });

      const response = await fetch('/api/student/quiz/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attemptId: currentAttemptId,
          answers
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Submit error:', errorText);
        throw new Error(`Failed to submit quiz: ${response.status} ${response.statusText}`);
      }

      const result: QuizResult = await response.json();
      console.log('Quiz submitted successfully:', result);
      setResult(result);
      setQuizCompleted(true);

      // Show badge modal if badges were earned
      if (result.badges && result.badges.length > 0) {
        setNewBadges(result.badges);
        setShowBadgeModal(true);
      }

    } catch (err) {
      console.error('Submit quiz error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    }
  };

  const nextQuestion = () => {
    if (!quizData || currentQuestion >= quizData.questions.length - 1) return;
    setCurrentQuestion(prev => prev + 1);
  };

  const prevQuestion = () => {
    if (currentQuestion <= 0) return;
    setCurrentQuestion(prev => prev - 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'bronze': return <Medal className="h-8 w-8 text-amber-600" />;
      case 'silver': return <Medal className="h-8 w-8 text-gray-400" />;
      case 'gold': return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'platinum': return <Crown className="h-8 w-8 text-purple-500" />;
      case 'diamond': return <Star className="h-8 w-8 text-blue-500" />;
      default: return <Award className="h-8 w-8 text-gray-500" />;
    }
  };

  // Start quiz attempt when component mounts (if not already started)
  useEffect(() => {
    if (quizData && !currentAttemptId && !quizCompleted) {
      startQuizAttempt();
    }
  }, [quizData]);

  if (loading) {
    return (
      <ResponsiveLayout
        title="Loading Quiz..."
        user={userData?.name ? {
          name: userData.name,
          email: userData.email,
          type: 'student'
        } : undefined}
        onLogout={handleLogout}
        maxWidth="xl"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout
        title="Quiz Error"
        user={userData?.name ? {
          name: userData.name,
          email: userData.email,
          type: 'student'
        } : undefined}
        onLogout={handleLogout}
        maxWidth="xl"
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Quiz Error</h2>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">{error}</p>
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!quizData) return null;

  // Show results screen
  if (quizCompleted && result) {
    return (
      <ResponsiveLayout
        title="Quiz Results"
        user={userData?.name ? {
          name: userData.name,
          email: userData.email,
          type: 'student'
        } : undefined}
        onLogout={handleLogout}
        maxWidth="4xl"
      >
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {result.score.passed ? (
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {result.score.passed ? 'Congratulations!' : 'Quiz Complete'}
              </h1>
              <p className="text-gray-600">
                {result.score.passed ? 'You passed the quiz!' : 'Better luck next time!'}
              </p>
            </div>

            {/* Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2" style={{
                      color: result.score.percentage >= quizData.settings.passingScore ? '#22c55e' : '#ef4444'
                    }}>
                      {result.score.percentage}%
                    </div>
                    <p className="text-gray-600">Final Score</p>
                    <p className="text-sm text-gray-500">
                      {result.analytics.correctAnswers} out of {result.analytics.totalQuestions} correct
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2 text-blue-600">
                      {formatTime(result.timing.totalTimeSpent)}
                    </div>
                    <p className="text-gray-600">Time Spent</p>
                    <p className="text-sm text-gray-500">
                      Avg: {formatTime(Math.round(result.analytics.averageTimePerQuestion))} per question
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2 text-purple-600">
                      {result.analytics.averageConfidence.toFixed(1)}/5
                    </div>
                    <p className="text-gray-600">Avg Confidence</p>
                    <p className="text-sm text-gray-500">
                      {result.analytics.totalHintsUsed} hints used
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Badges Alert */}
            {result.badges && result.badges.length > 0 && (
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">🎉 New Badges Earned!</h3>
                      <p className="text-gray-600">You've earned {result.badges.length} new badge{result.badges.length > 1 ? 's' : ''}!</p>
                    </div>
                    <Button onClick={() => setShowBadgeModal(true)} variant="outline">
                      View Badges
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-4">
              <Button onClick={() => navigate(`/quiz/${quizId}/overview`)} variant="outline">
                Back to Quiz Overview
              </Button>
              {quizData.settings.allowRetake && (
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              )}
              <Button onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>
      </ResponsiveLayout>
    );
  }

  const currentQuestionData = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <ResponsiveLayout
      title={quizData.title}
      user={userData?.name ? {
        name: userData.name,
        email: userData.email,
        type: 'student'
      } : undefined}
      onLogout={handleLogout}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{quizData.title}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{quizData.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-red-500">
              <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-mono font-bold text-sm sm:text-base">{formatTime(timeLeft)}</span>
            </div>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={() => setIsPaused(!isPaused)}
              disabled={quizCompleted}
            >
              {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Badge variant="outline" className="self-start">
                {currentQuestionData.difficulty}
              </Badge>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">{currentQuestionData.points} pts</span>
              </div>
            </div>
            <CardTitle className="text-lg md:text-xl">{currentQuestionData.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Options */}
            <div className="space-y-3">
              {currentQuestionData.options.map((option) => {
                const isSelected = selectedAnswers[currentQuestionData._id]?.includes(option._id);
                return (
                  <div
                    key={option._id}
                    className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestionData._id, option._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-white" />}
                      </div>
                      <span className="flex-1 text-sm md:text-base">{option.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Confidence Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Confidence Level: {confidence[currentQuestionData._id]}/5</label>
              <input
                type="range"
                min="1"
                max="5"
                value={confidence[currentQuestionData._id] || 3}
                onChange={(e) => handleConfidenceChange(currentQuestionData._id, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not Sure</span>
                <span>Very Confident</span>
              </div>
            </div>

            {/* Hints */}
            {currentQuestionData.hints && currentQuestionData.hints.length > 0 && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useHint(currentQuestionData._id)}
                  disabled={(hintsUsed[currentQuestionData._id] || 0) >= currentQuestionData.hints.length}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Use Hint ({hintsUsed[currentQuestionData._id] || 0}/{currentQuestionData.hints.length})
                </Button>
                
                {(hintsUsed[currentQuestionData._id] || 0) > 0 && (
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      {currentQuestionData.hints[Math.min((hintsUsed[currentQuestionData._id] || 1) - 1, currentQuestionData.hints.length - 1)].text}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentQuestion === quizData.questions.length - 1 ? (
                  <Button
                    onClick={() => handleSubmitQuiz()}
                    disabled={!selectedAnswers[currentQuestionData._id]?.length}
                    size={isMobile ? "sm" : "default"}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    disabled={!selectedAnswers[currentQuestionData._id]?.length}
                    size={isMobile ? "sm" : "default"}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Navigation */}
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
              {quizData.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-blue-500 text-white'
                      : selectedAnswers[quizData.questions[index]._id]?.length
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Badge Modal */}
        <Dialog open={showBadgeModal} onOpenChange={setShowBadgeModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                New Badges Earned!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {newBadges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{badge.name}</h4>
                      {getBadgeIcon(badge.type)}
                    </div>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{badge.points} points</p>
                  </div>
                </div>
              ))}
              <Button 
                onClick={() => navigate('/badges')} 
                className="w-full"
              >
                View All Badges
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </ResponsiveLayout>
  );
};

export default InteractiveQuiz;
