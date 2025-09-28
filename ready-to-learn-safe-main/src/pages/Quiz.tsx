import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Search,
  Filter,
  Clock,
  Target,
  BookOpen,
  Star,
  Users,
  Trophy,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Zap
} from "lucide-react";

interface QuizCard {
  id: string;
  title: string;
  description: string;
  module: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  source: string; // 'system' for global content
  questionCount: number;
  timeLimit: number;
  passingScore: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  attemptCount: number;
  lastScore: number | null;
  lastTime: number | null;
  canAttempt: boolean;
  createdAt: string;
}

interface QuizCardsData {
  quizzes: QuizCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}


const QuizCards = () => {
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
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'student') {
      navigate('/auth');
      return;
    }
  }, [navigate]);
  
  // State
  const [quizzes, setQuizzes] = useState<QuizCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<QuizCardsData['pagination'] | null>(null);

  // Fetch quizzes
  const fetchQuizzes = async (page = 1, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters
      });

      const response = await apiClient.get(`/student/quizzes?${params}`);

      const data: QuizCardsData = response.data;
      setQuizzes(data.quizzes);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchQuizzes(1);
      setLoading(false);
    };

    loadData();
  }, []);

  // Handle filtering
  useEffect(() => {
    const filters: Record<string, string> = {};
    if (selectedDifficulty !== 'all') filters.difficulty = selectedDifficulty;
    if (selectedModule !== 'all') filters.moduleId = selectedModule;

    fetchQuizzes(1, filters);
    setCurrentPage(1);
  }, [selectedDifficulty, selectedModule]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search logic here - for now just filter locally
    // In production, you'd want to implement backend search
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      case 'mixed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  const startQuiz = async (quizId: string) => {
    try {
      // Start quiz attempt
      const response = await apiClient.post('/student/quiz/start', { quizId });
      const data = response.data;
      // Navigate to quiz taking interface
      navigate(`/quiz/${quizId}/attempt/${data.attemptId}`);
    } catch (err) {
      console.error('Error starting quiz:', err);
      // Show error toast or modal
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout 
        title="Quiz Library"
        user={userData?.name ? {
          name: userData.name,
          email: userData.email,
          type: 'student'
        } : undefined}
        onLogout={handleLogout}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quiz Library</h1>
              <p className="text-muted-foreground text-sm md:text-base">Loading available quizzes...</p>
            </div>
          </div>

          {/* Quiz Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
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
        title="Quiz Library"
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
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Unable to Load Quizzes</h2>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.module.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ResponsiveLayout 
      title="Quiz Library"
      user={userData?.name ? {
        name: userData.name,
        email: userData.email,
        type: 'student'
      } : undefined}
      onLogout={handleLogout}
    >
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quiz Library</h1>
              <p className="text-muted-foreground text-sm md:text-base">Discover and take quizzes to test your knowledge</p>
            </div>
          </div>
        </div>


        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img 
                  src={quiz.module.thumbnail} 
                  alt={quiz.module.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-quiz.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className={`mb-2 ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </Badge>
                  <h3 className="text-white font-semibold text-lg line-clamp-2">{quiz.title}</h3>
                </div>
              </div>

              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">{quiz.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{quiz.questionCount} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(quiz.timeLimit)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{quiz.passingScore}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{quiz.module.title}</span>
                      <br />
                      <span className="text-xs">Global Content</span>
                    </div>
                  </div>

                  {/* Previous Attempts */}
                  {quiz.attemptCount > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Performance:</span>
                        <div className="flex items-center gap-2">
                          {quiz.lastScore !== null && (
                            <Badge 
                              variant={quiz.lastScore >= quiz.passingScore ? "default" : "secondary"}
                              className={quiz.lastScore >= quiz.passingScore ? "bg-green-500" : "bg-red-500"}
                            >
                              {quiz.lastScore}%
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{quiz.attemptCount} attempts</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {quiz.lastScore === 100 && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                      {quiz.attemptCount === 0 && (
                        <Badge variant="outline" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => navigate(`/quiz/${quiz.id}/overview`)}
                      className="flex items-center gap-2"
                      size={isMobile ? "sm" : "default"}
                    >
                      <PlayCircle className="h-4 w-4" />
                      {quiz.attemptCount > 0 ? 'View Quiz' : 'Take Quiz'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
            <Button
              variant="outline"
              onClick={() => {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                fetchQuizzes(newPage);
              }}
              disabled={currentPage === 1}
              size={isMobile ? "sm" : "default"}
            >
              Previous
            </Button>
            
            <span className="px-2 md:px-4 py-2 text-sm text-muted-foreground">
              Page {currentPage} of {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => {
                const newPage = currentPage + 1;
                setCurrentPage(newPage);
                fetchQuizzes(newPage);
              }}
              disabled={currentPage === pagination.pages}
              size={isMobile ? "sm" : "default"}
            >
              Next
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredQuizzes.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No quizzes found</h3>
            <p className="text-muted-foreground text-sm md:text-base">
              {searchTerm ? 'Try adjusting your search terms' : 'No quizzes available at the moment'}
            </p>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default QuizCards;
