import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  Activity,
  Target,
  BookOpen,
  Award,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface LiveStatsCardProps {
  stats: {
    totalStudents: number;
    averageProgress: number;
    activeToday: number;
    completionRate: number;
    totalModulesCompleted: number;
    totalQuizzesTaken: number;
    averageQuizScore: number;
    studentsActiveThisWeek: number;
    lastUpdated: string;
  } | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const LiveStatsCard: React.FC<LiveStatsCardProps> = ({
  stats,
  loading,
  error,
  onRefresh,
  isRefreshing = false
}) => {
  const formatLastUpdated = (dateString: string) => {
    const now = new Date();
    const updated = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return updated.toLocaleDateString();
  };

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
              <div className="h-2 bg-muted rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && !stats) {
    return (
      <Card className="col-span-full border-destructive/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error loading statistics</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'primary',
      trend: '+12 this month',
      bgGradient: 'from-blue-500/10 to-blue-600/20',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Avg. Progress',
      value: `${stats.averageProgress}%`,
      icon: TrendingUp,
      color: 'accent',
      trend: stats.totalModulesCompleted > 0 ? 'Active learning' : 'No progress yet',
      bgGradient: 'from-green-500/10 to-green-600/20',
      borderColor: 'border-green-200',
      progress: stats.averageProgress
    },
    {
      title: 'Active Today',
      value: stats.activeToday,
      icon: Activity,
      color: 'secondary',
      trend: `${stats.studentsActiveThisWeek} this week`,
      bgGradient: 'from-purple-500/10 to-purple-600/20',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: Target,
      color: 'primary',
      trend: stats.completionRate >= 70 ? 'Excellent' : stats.completionRate >= 50 ? 'Good' : 'Needs improvement',
      bgGradient: 'from-orange-500/10 to-orange-600/20',
      borderColor: 'border-orange-200',
      progress: stats.completionRate
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Live Dashboard</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            {stats.lastUpdated && (
              <span>Updated {formatLastUpdated(stats.lastUpdated)}</span>
            )}
            <div className="flex items-center gap-1 ml-2">
              <div className={`w-2 h-2 rounded-full ${stats.activeToday > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs">Live</span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={index} 
              className={`bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor} transition-all hover:shadow-lg hover:scale-105`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <IconComponent className="h-8 w-8 text-primary opacity-80" />
                </div>
                
                {stat.progress !== undefined && (
                  <Progress 
                    value={stat.progress} 
                    className="h-2 mt-3 mb-2" 
                  />
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {stat.trend}
                  </span>
                  {stat.title === 'Completion Rate' && stat.progress && (
                    <Badge 
                      variant={stat.progress >= 70 ? "default" : stat.progress >= 50 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {stat.progress >= 70 ? 'Great' : stat.progress >= 50 ? 'Good' : 'Low'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional detailed stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-700">Modules Completed</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalModulesCompleted}</p>
                <p className="text-xs text-blue-600">Total across all students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-700">Quizzes Taken</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalQuizzesTaken}</p>
                <p className="text-xs text-green-600">Total quiz attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-700">Avg. Quiz Score</p>
                <p className="text-2xl font-bold text-purple-900">{stats.averageQuizScore}%</p>
                <Badge 
                  variant={stats.averageQuizScore >= 80 ? "default" : stats.averageQuizScore >= 60 ? "secondary" : "destructive"}
                  className="text-xs mt-1"
                >
                  {stats.averageQuizScore >= 80 ? 'Excellent' : stats.averageQuizScore >= 60 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveStatsCard;