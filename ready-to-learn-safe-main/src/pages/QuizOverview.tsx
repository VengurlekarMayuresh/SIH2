import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Clock,
  Target,
  BookOpen,
  Trophy,
  Users,
  PlayCircle,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Star,
  Timer,
  Award,
  RefreshCw,
  ArrowLeft,
  Lightbulb,
  Zap,
  TrendingUp,
  Calendar,
  Medal,
  Crown
} from "lucide-react";

interface QuizData {
  _id: string;
  title: string;
  description: string;
  moduleId: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  questions: Array<{
    _id: string;
    question: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    timeLimit?: number;
    hints?: Array<{ text: string; penalty: number }>;
  }>;
  settings: {
    timeLimit: number;
    passingScore: number;
    maxAttempts: number;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    showCorrectAnswers: boolean;
    allowRetake: boolean;
    retakeDelay: number;
  };
  status: string;
  createdAt: string;
}

interface QuizAttempt {
  _id: string;
  attemptNumber: number;
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
  status: 'in_progress' | 'submitted' | 'timed_out';
  createdAt: string;
}

interface QuizStats {
  totalAttempts: number;
  bestScore: number | null;
  averageScore: number | null;
  lastAttemptDate: string | null;
  canAttempt: boolean;
  nextAttemptAvailable: string | null;
}

const QuizOverview = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Get user data for navbar
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
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

  // State
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [startingQuiz, setStartingQuiz] = useState(false);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;

      try {
        setLoading(true);
        
        // Fetch quiz details
        const quizResponse = await fetch(`/api/quizzes/${quizId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!quizResponse.ok) {
          throw new Error('Failed to fetch quiz data');
        }

        const quizData = await quizResponse.json();
        setQuiz(quizData);

        // Fetch student's attempts
        const attemptsResponse = await fetch(`/api/student/quiz/attempts?quizId=${quizId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (attemptsResponse.ok) {
          const attemptsData = await attemptsResponse.json();
          setAttempts(attemptsData);

          // Calculate stats
          const totalAttempts = attemptsData.length;
          const bestScore = totalAttempts > 0 ? Math.max(...attemptsData.map((a: QuizAttempt) => a.score.percentage)) : null;
          const averageScore = totalAttempts > 0 ? attemptsData.reduce((sum: number, a: QuizAttempt) => sum + a.score.percentage, 0) / totalAttempts : null;
          const lastAttemptDate = totalAttempts > 0 ? attemptsData[0].createdAt : null;
          const canAttempt = totalAttempts < quizData.settings.maxAttempts;

          setStats({
            totalAttempts,
            bestScore,
            averageScore,
            lastAttemptDate,
            canAttempt,
            nextAttemptAvailable: null
          });
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const handleStartQuiz = async () => {
    if (!quiz) return;

    try {
      setStartingQuiz(true);
      
      // Start quiz attempt
      const response = await fetch('/api/student/quiz/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quizId: quiz._id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start quiz');
      }

      const data = await response.json();
      
      // Navigate to quiz page with attempt ID
      navigate(`/quiz/${quiz._id}/attempt/${data.attemptId}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
      setStartingQuiz(false);
      setShowStartModal(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOverallDifficulty = () => {
    if (!quiz) return 'medium';
    
    const difficulties = quiz.questions.map(q => q.difficulty);
    const easyCount = difficulties.filter(d => d === 'easy').length;
    const hardCount = difficulties.filter(d => d === 'hard').length;
    
    if (hardCount > difficulties.length / 2) return 'hard';
    if (easyCount > difficulties.length / 2) return 'easy';
    return 'medium';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ResponsiveLayout 
        title="Quiz Overview"
        user={userData?.name ? {
          name: userData.name,
          email: userData.email,
          type: 'student'
        } : undefined}
        onLogout={handleLogout}
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 md:p-8">
            <Skeleton className="h-8 w-full max-w-96 mb-4 bg-white/20" />
            <Skeleton className="h-4 w-full max-w-2xl bg-white/20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 md:p-6">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-6 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout 
        title="Quiz Overview"
        user={userData?.name ? {
          name: userData.name,
          email: userData.email,
          type: 'student'
        } : undefined}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Unable to Load Quiz</h2>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">{error}</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!quiz) return null;

  const overallDifficulty = getOverallDifficulty();
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <ResponsiveLayout 
      title={quiz.title}
      user={userData?.name ? {
        name: userData.name,
        email: userData.email,
        type: 'student'
      } : undefined}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button 
            onClick={() => navigate(`/modules/${quiz.moduleId._id}`)} 
            className="hover:text-primary transition-colors"
          >
            {quiz.moduleId.title}
          </button>
          <span>/</span>
          <span className="text-foreground">{quiz.title}</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {quiz.moduleId.title}
                  </Badge>
                  <Badge className={`${getDifficultyColor(overallDifficulty)} text-opacity-100`}>
                    {overallDifficulty}
                  </Badge>
                </div>
                
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{quiz.title}</h1>
                <p className="text-base md:text-lg lg:text-xl text-primary-foreground/90 max-w-3xl leading-relaxed">
                  {quiz.description}
                </p>

                {stats && stats.bestScore !== null && (
                  <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-2 text-sm">
                      <Trophy className="h-4 w-4 text-yellow-300" />
                      <span className="font-semibold">Best: {stats.bestScore}%</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-2 text-sm">
                      <Target className="h-4 w-4" />
                      <span>Attempts: {stats.totalAttempts}/{quiz.settings.maxAttempts}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:block">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 lg:h-16 lg:w-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground mb-1">
                {quiz.settings.timeLimit} min
              </div>
              <p className="text-muted-foreground text-xs md:text-sm">Time Limit</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground mb-1">
                {quiz.settings.passingScore}%
              </div>
              <p className="text-muted-foreground text-xs md:text-sm">Passing Score</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground mb-1">
                {quiz.questions.length}
              </div>
              <p className="text-muted-foreground text-xs md:text-sm">Questions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground mb-1">
                {totalPoints}
              </div>
              <p className="text-muted-foreground text-xs md:text-sm">Total Points</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quiz Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Quiz Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div key="time-management" className="flex items-center gap-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
                      <Timer className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Time Management</p>
                        <p className="text-sm text-muted-foreground">You have {quiz.settings.timeLimit} minutes to complete</p>
                      </div>
                    </div>

                    <div key="attempts" className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <RefreshCw className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-foreground">Attempts</p>
                        <p className="text-sm text-muted-foreground">Up to {quiz.settings.maxAttempts} attempts allowed</p>
                      </div>
                    </div>

                    <div key="passing-grade" className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-foreground">Passing Grade</p>
                        <p className="text-sm text-muted-foreground">Score {quiz.settings.passingScore}% or higher to pass</p>
                      </div>
                    </div>

                    <div key="auto-save" className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <Zap className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-foreground">Auto-Save</p>
                        <p className="text-sm text-muted-foreground">Progress is saved automatically</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2 text-foreground">Additional Rules:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• {quiz.settings.randomizeQuestions ? 'Questions will be randomized' : 'Questions appear in set order'}</li>
                      <li>• {quiz.settings.randomizeOptions ? 'Answer options will be shuffled' : 'Answer options are in fixed order'}</li>
                      <li>• {quiz.settings.showCorrectAnswers ? 'Correct answers shown after submission' : 'Answers not revealed immediately'}</li>
                      <li>• Once submitted, you cannot change your answers</li>
                      <li>• Make sure you have a stable internet connection</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Question Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['easy', 'medium', 'hard'].map(difficulty => {
                    const count = quiz.questions.filter(q => q.difficulty === difficulty).length;
                    const percentage = (count / quiz.questions.length) * 100;
                    
                    if (count === 0) return null;
                    
                    return (
                      <div key={difficulty} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(difficulty)}>
                              {difficulty}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{count} questions</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{percentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Start Quiz Card */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-foreground mb-2">Ready to Start?</h3>
                  {stats && !stats.canAttempt ? (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You have used all {quiz.settings.maxAttempts} attempts for this quiz.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <p className="text-muted-foreground text-sm mb-4">
                      {stats && stats.totalAttempts > 0 
                        ? `This will be attempt ${stats.totalAttempts + 1} of ${quiz.settings.maxAttempts}`
                        : 'Take your first attempt at this quiz'
                      }
                    </p>
                  )}
                  </div>

                <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full mb-3" 
                      size={isMobile ? "default" : "lg"}
                      disabled={stats && !stats.canAttempt}
                    >
                      <PlayCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      {stats && stats.totalAttempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start Quiz Attempt</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>Are you ready to start "{quiz.title}"?</p>
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span>Time Limit:</span>
                            <span className="font-medium">{quiz.settings.timeLimit} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Questions:</span>
                            <span className="font-medium">{quiz.questions.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Passing Score:</span>
                            <span className="font-medium">{quiz.settings.passingScore}%</span>
                          </div>
                          {stats && (
                            <div className="flex justify-between">
                              <span>Attempts Used:</span>
                              <span className="font-medium">{stats.totalAttempts}/{quiz.settings.maxAttempts}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => setShowStartModal(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button onClick={handleStartQuiz} disabled={startingQuiz} className="flex-1">
                            {startingQuiz ? 'Starting...' : 'Start Now'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/quiz/${quiz._id}/leaderboard`)}
                    className="w-full"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Leaderboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate(`/modules/${quiz.moduleId._id}`)}
                    className="w-full"
                    size={isMobile ? "sm" : "default"}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Module
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance History */}
            {stats && stats.totalAttempts > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Your Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-xl md:text-2xl font-bold text-green-600">
                          {stats.bestScore}%
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-400">Best Score</p>
                      </div>
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <div className="text-xl md:text-2xl font-bold text-primary">
                          {stats.averageScore?.toFixed(0)}%
                        </div>
                        <p className="text-xs text-primary/70">Average</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2 text-foreground">Recent Attempts</h4>
                      <div className="space-y-2">
                        {attempts.slice(0, 3).map((attempt, index) => (
                          <div key={attempt._id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              {index === 0 && attempt.score.percentage === stats.bestScore && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="text-sm text-foreground">Attempt {attempt.attemptNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                attempt.score.passed 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }>
                                {attempt.score.percentage}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {stats.lastAttemptDate && (
                      <p className="text-xs text-muted-foreground">
                        Last attempt: {formatDate(stats.lastAttemptDate)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default QuizOverview;
