import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trophy, Star, BookOpen, Award, TrendingUp, Calendar, Loader2, ArrowLeft, BarChart3, Users, Target, Clock, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface ProgressStats {
  completedModules: number;
  totalModules: number;
  latestQuizScore: number;
  earnedBadges: number;
  overallProgress: number;
}

interface QuizScoreData {
  date: string;
  score: number;
}

interface ModuleProgressData {
  module: string;
  progress: number;
  color: string;
}

interface Badge {
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  date: string | Date;
}

interface ProgressData {
  stats: ProgressStats;
  quizScoreData: QuizScoreData[];
  moduleProgressData: ModuleProgressData[];
  badges: Badge[];
  joinedDate: string;
  improvement: number;
}

const Progress = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Please log in to view your progress');
          return;
        }

        const response = await axios.get('/api/student/progress-dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProgressData(response.data);
      } catch (err: any) {
        console.error('Error fetching progress data:', err);
        setError(err.response?.data?.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <ResponsiveLayout
        title="Loading Progress..."
        user={userData?.name ? {
          name: userData.name,
          email: userData.email,
          type: 'student'
        } : undefined}
        onLogout={handleLogout}
        maxWidth="6xl"
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading your progress...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error || !progressData) {
    return (
      <ResponsiveLayout
        title="Progress Error"
        user={userData?.name ? {
          name: userData.name,
          email: userData.email,
          type: 'student'
        } : undefined}
        onLogout={handleLogout}
        maxWidth="6xl"
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Error Loading Progress</h2>
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

  const { stats, quizScoreData, moduleProgressData, badges, joinedDate, improvement } = progressData;
  const joinedDate_formatted = new Date(joinedDate);
  const timeAgo = Math.floor((Date.now() - joinedDate_formatted.getTime()) / (1000 * 60 * 60 * 24 * 7));

  const formatBadgeDate = (date: string | Date) => {
    if (typeof date === 'string' && (date === 'Not earned' || date === 'Locked' || date === 'In Progress')) {
      return date;
    }
    try {
      const badgeDate = new Date(date);
      const daysAgo = Math.floor((Date.now() - badgeDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo === 0) return 'Today';
      if (daysAgo === 1) return '1 day ago';
      if (daysAgo < 7) return `${daysAgo} days ago`;
      if (daysAgo < 14) return '1 week ago';
      if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
      return `${Math.floor(daysAgo / 30)} month${Math.floor(daysAgo / 30) === 1 ? '' : 's'} ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <ResponsiveLayout
      title="Progress Tracking"
      user={userData?.name ? {
        name: userData.name,
        email: userData.email,
        type: 'student'
      } : undefined}
      onLogout={handleLogout}
      maxWidth="6xl"
    >
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">Progress Tracking</h1>
            </div>
            {!isMobile && (
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
          </div>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground">Track your learning journey and celebrate your achievements!</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto mb-2 md:mb-3" />
              <div className="text-xl md:text-2xl font-bold text-primary mb-1">{stats.completedModules}/{stats.totalModules}</div>
              <p className="text-xs md:text-sm text-muted-foreground">Modules Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-secondary mx-auto mb-2 md:mb-3" />
              <div className="text-xl md:text-2xl font-bold text-secondary mb-1">{Math.round(stats.latestQuizScore)}%</div>
              <p className="text-xs md:text-sm text-muted-foreground">Latest Quiz Score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <Award className="h-6 w-6 md:h-8 md:w-8 text-accent mx-auto mb-2 md:mb-3" />
              <div className="text-xl md:text-2xl font-bold text-accent mb-1">{stats.earnedBadges}</div>
              <p className="text-xs md:text-sm text-muted-foreground">Badges Earned</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <Star className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto mb-2 md:mb-3" />
              <div className="text-xl md:text-2xl font-bold text-primary mb-1">{stats.overallProgress}%</div>
              <p className="text-xs md:text-sm text-muted-foreground">Overall Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Quiz Scores Over Time */}
          <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Quiz Scores Over Time
                </CardTitle>
              </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                  <LineChart data={quizScoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Module Progress */}
          <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  Module Progress
                </CardTitle>
              </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                  <BarChart data={moduleProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="module" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="progress" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="mb-6 md:mb-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Award className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
              Achievement Badges
            </CardTitle>
            <p className="text-sm md:text-base text-muted-foreground">Collect badges as you master different aspects of disaster preparedness</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {badges.map((badge, index) => (
                <div 
                  key={index}
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all duration-300 ${
                    badge.earned 
                      ? `border-${badge.color}/20 bg-gradient-to-br from-${badge.color}/10 to-${badge.color}/5 hover:shadow-lg hover:-translate-y-1` 
                      : "border-muted bg-muted/20 opacity-60"
                  }`}
                >
                  <div className="text-center mb-3">
                    <div className={`text-3xl md:text-4xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                      {badge.icon}
                    </div>
                    <h3 className={`text-sm md:text-base font-semibold ${badge.earned ? `text-${badge.color}` : 'text-muted-foreground'}`}>
                      {badge.title}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground text-center mb-3">
                    {badge.description}
                  </p>
                  <div className="text-center">
                    <Badge 
                      variant={badge.earned ? "default" : "secondary"} 
                      className={`text-xs ${
                        badge.earned 
                          ? `bg-${badge.color}/20 text-${badge.color} hover:bg-${badge.color}/30` 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {badge.earned ? `Earned ${formatBadgeDate(badge.date)}` : formatBadgeDate(badge.date)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">Great job! You're getting safer every day! 🌟</h3>
            <p className="text-base md:text-lg text-muted-foreground mb-4">
              You've made excellent progress in your disaster preparedness journey. 
              Keep learning and stay prepared!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Started {timeAgo > 0 ? `${timeAgo} week${timeAgo === 1 ? '' : 's'} ago` : 'recently'}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>{improvement >= 0 ? '+' : ''}{improvement}% improvement</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Button onClick={() => navigate('/modules')} className="w-full sm:w-auto">
                <BookOpen className="h-4 w-4 mr-2" />
                Continue Learning
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full sm:w-auto">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default Progress;