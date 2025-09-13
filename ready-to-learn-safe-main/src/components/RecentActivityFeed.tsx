import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  HelpCircle, 
  Clock, 
  TrendingUp,
  CheckCircle,
  User,
  AlertTriangle
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  class: string;
  division: string;
  rollNo: string;
}

interface Activity {
  type: 'quiz' | 'module';
  student: Student;
  title: string;
  score?: number;
  timestamp: string;
  icon: string;
}

interface RecentActivityFeedProps {
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ 
  activities, 
  loading, 
  error 
}) => {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return activityTime.toLocaleDateString();
  };

  const getActivityIcon = (type: string, score?: number) => {
    if (type === 'quiz') {
      return <HelpCircle className="h-4 w-4 text-blue-600" />;
    } else if (type === 'module') {
      return <BookOpen className="h-4 w-4 text-green-600" />;
    }
    return <CheckCircle className="h-4 w-4 text-gray-600" />;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, label: 'Excellent', color: 'text-green-700' };
    if (score >= 80) return { variant: 'secondary' as const, label: 'Good', color: 'text-blue-700' };
    if (score >= 60) return { variant: 'outline' as const, label: 'Pass', color: 'text-yellow-700' };
    return { variant: 'destructive' as const, label: 'Needs Work', color: 'text-red-700' };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Student Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Activity Feed Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Student Activity
          <Badge variant="outline" className="ml-auto">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-80 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Student activities will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow bg-gradient-to-r from-background to-muted/20"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {activity.student ? getInitials(activity.student.name) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityIcon(activity.type, activity.score)}
                    <p className="font-medium text-sm truncate">
                      {activity.student?.name || 'Unknown Student'}
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1 truncate">
                    {activity.type === 'quiz' ? 'Completed quiz:' : 'Finished module:'}{' '}
                    <span className="font-medium">{activity.title}</span>
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {activity.student?.class && activity.student?.division 
                        ? `${activity.student.class}-${activity.student.division}`
                        : 'Class Unknown'
                      }
                    </span>
                    <span>•</span>
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {activity.type === 'quiz' && activity.score !== undefined && (
                    <>
                      <Badge 
                        variant={getScoreBadge(activity.score).variant}
                        className="text-xs"
                      >
                        {activity.score}%
                      </Badge>
                      <span className={`text-xs ${getScoreBadge(activity.score).color}`}>
                        {getScoreBadge(activity.score).label}
                      </span>
                    </>
                  )}
                  
                  {activity.type === 'module' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-xs">Done</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {activities.length > 0 && (
        <div className="px-6 pb-4 pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {activities.length} recent activities</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-updating</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecentActivityFeed;