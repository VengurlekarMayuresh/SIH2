import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { Trophy, Star, BookOpen, Award, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useEffect, useState } from "react";
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
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading your progress...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Progress</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </main>
      </div>
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Progress Tracking</h1>
            </div>
            <p className="text-xl text-muted-foreground">Track your learning journey and celebrate your achievements!</p>
          </div>

          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">{stats.completedModules}/{stats.totalModules}</div>
                <p className="text-sm text-muted-foreground">Modules Completed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-secondary mx-auto mb-3" />
                <div className="text-2xl font-bold text-secondary mb-1">{Math.round(stats.latestQuizScore)}%</div>
                <p className="text-sm text-muted-foreground">Latest Quiz Score</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-accent mb-1">{stats.earnedBadges}</div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">{stats.overallProgress}%</div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Quiz Scores Over Time */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Quiz Scores Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  Module Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Award className="h-6 w-6 text-secondary" />
                Achievement Badges
              </CardTitle>
              <p className="text-muted-foreground">Collect badges as you master different aspects of disaster preparedness</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      badge.earned 
                        ? `border-${badge.color}/20 bg-gradient-to-br from-${badge.color}/10 to-${badge.color}/5 hover:shadow-lg hover:-translate-y-1` 
                        : "border-muted bg-muted/20 opacity-60"
                    }`}
                  >
                    <div className="text-center mb-3">
                      <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                        {badge.icon}
                      </div>
                      <h3 className={`font-semibold ${badge.earned ? `text-${badge.color}` : 'text-muted-foreground'}`}>
                        {badge.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground text-center mb-3">
                      {badge.description}
                    </p>
                    <div className="text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        badge.earned 
                          ? `bg-${badge.color}/20 text-${badge.color}` 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {badge.earned ? `Earned ${formatBadgeDate(badge.date)}` : formatBadgeDate(badge.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Motivational Message */}
          <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Great job! You're getting safer every day! 🌟</h3>
              <p className="text-lg text-muted-foreground mb-4">
                You've made excellent progress in your disaster preparedness journey. 
                Keep learning and stay prepared!
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Started {timeAgo > 0 ? `${timeAgo} week${timeAgo === 1 ? '' : 's'} ago` : 'recently'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{improvement >= 0 ? '+' : ''}{improvement}% improvement</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Progress;