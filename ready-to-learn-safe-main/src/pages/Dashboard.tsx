import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/Sidebar";
import AlertsWidget from "@/components/AlertsWidget";
import axios from "axios";
import { 
  BookOpen, 
  HelpCircle, 
  FileText, 
  TrendingUp, 
  Award, 
  Clock, 
  Bell, 
  Target, 
  Flame, 
  Calendar,
  ChevronRight,
  User,
  LogOut,
  Loader2
} from "lucide-react";

interface DashboardActivity {
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  badge?: string;
  progress?: number;
}

interface NextBadge {
  name: string;
  description: string;
  icon: string;
  progress: number;
  requirement: string;
}

interface TodayProgress {
  completed: number;
  goal: number;
  percentage: number;
  breakdown: {
    quizzes: number;
    modules: number;
    badges: number;
  };
}

interface DashboardData {
  streak: number;
  recentActivity: DashboardActivity[];
  todayProgress: TodayProgress;
  nextBadge: NextBadge | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No token in fetchDashboardData, redirecting');
        navigate('/auth');
        return;
      }

      console.log('Making API call to /api/student/dashboard-data');
      const response = await axios.get('/api/student/dashboard-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Dashboard data received:', response.data);
      setDashboardData(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      console.log('Dashboard data fetch completed, setting loading to false');
      setLoading(false);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    console.log('Dashboard component mounted');
    
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const storedUserData = localStorage.getItem('userData');
    
    console.log('Dashboard auth check:', { 
      token: token ? 'exists' : 'missing', 
      userType, 
      userData: storedUserData ? 'exists' : 'missing' 
    });
    
    if (!token || userType !== 'student') {
      console.log('No valid auth, redirecting to /auth');
      navigate('/auth');
      return;
    }
    
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Fetch dashboard data
    console.log('Starting to fetch dashboard data...');
    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    console.log('Logging out student...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    // Clear any other potential auth-related items
    localStorage.clear();
    console.log('LocalStorage cleared, redirecting to home...');
    navigate('/');
  };

  const getActivityIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Award': Award,
      'BookOpen': BookOpen,
      'HelpCircle': HelpCircle,
      'Trophy': Award,
      'Target': Target
    };
    return iconMap[iconName] || Award;
  };

  const formatTimeAgo = (timeString: string) => {
    const now = new Date();
    const time = new Date(timeString);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return time.toLocaleDateString();
  };

  const userName = userData?.name || "Student";

  const quickActions = [
    {
      title: "Learn about Disasters",
      description: "Explore interactive modules on different disaster types",
      icon: BookOpen,
      onClick: () => navigate("/modules"),
      color: "primary",
    },
    {
      title: "Take Safety Quiz",
      description: "Test your knowledge and earn badges",
      icon: HelpCircle,
      onClick: () => navigate("/quiz"),
      color: "secondary",
    },
    {
      title: "Check Resources",
      description: "Access emergency contacts and safety guides",
      icon: FileText,
      onClick: () => navigate("/resources"),
      color: "accent",
    },
    {
      title: "View Progress",
      description: "Track your learning journey and achievements",
      icon: TrendingUp,
      onClick: () => navigate("/progress"),
      color: "primary",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with User Profile */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src="/placeholder.svg" alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName.split(' ')[0]}!</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className="font-medium">
                      {userData?.class && `Class ${userData.class}`}
                    </Badge>
                    {userData?.rollNo && (
                      <Badge variant="outline" className="border-accent text-accent">
                        Roll No: {userData.rollNo}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4 mr-1" />
                  Notifications
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full"></div>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
            
            {/* Daily Progress */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                {loading ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-2 w-full mb-2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ) : dashboardData ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">Today's Progress</h3>
                        <p className="text-sm text-muted-foreground">
                          {dashboardData.todayProgress.completed}/{dashboardData.todayProgress.goal} activities completed
                        </p>
                        {dashboardData.todayProgress.breakdown && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {dashboardData.todayProgress.breakdown.modules > 0 && `${dashboardData.todayProgress.breakdown.modules} modules `}
                            {dashboardData.todayProgress.breakdown.quizzes > 0 && `${dashboardData.todayProgress.breakdown.quizzes} quizzes `}
                            {dashboardData.todayProgress.breakdown.badges > 0 && `${dashboardData.todayProgress.breakdown.badges} badges`}
                          </p>
                        )}
                      </div>
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <Progress 
                      value={Math.min(dashboardData.todayProgress.percentage, 100)} 
                      className="h-2 mb-2" 
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {dashboardData.todayProgress.completed >= dashboardData.todayProgress.goal ? 
                          "Goal achieved! 🎉" : "Keep going!"}
                      </span>
                      <span className="text-primary font-medium">
                        {Math.min(dashboardData.todayProgress.percentage, 100)}% complete
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Unable to load today's progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>


          {/* Enhanced Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Continue Learning</h2>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/50"
                  onClick={action.onClick}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-${action.color}/10 to-${action.color}/20 group-hover:from-${action.color}/20 group-hover:to-${action.color}/30 transition-all duration-300`}>
                      <action.icon className={`h-7 w-7 text-${action.color} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm mb-4 group-hover:text-foreground/80 transition-colors duration-300">
                      {action.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`w-full border-${action.color}/50 text-${action.color} hover:bg-${action.color} hover:text-white hover:border-${action.color} transition-all duration-300 group-hover:shadow-md`}
                    >
                      Start Now
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Alerts Section */}
          <div className="mb-8">
            <AlertsWidget maxAlerts={3} showWeather={true} />
          </div>

          {/* Recent Activity & Next Badge */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
                  {dashboardData && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {dashboardData.streak} day streak 🔥
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-3 w-64" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Unable to load recent activity</p>
                  </div>
                ) : dashboardData && dashboardData.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivity.map((activity, index) => {
                      const IconComponent = getActivityIcon(activity.icon);
                      return (
                        <div key={index} className={`flex items-center gap-4 p-4 bg-gradient-to-r from-${activity.color}/5 to-${activity.color}/10 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group`}>
                          <div className={`w-12 h-12 bg-gradient-to-br from-${activity.color}/20 to-${activity.color}/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className={`h-6 w-6 text-${activity.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description} • {formatTimeAgo(activity.time)}
                            </p>
                          </div>
                          {activity.badge && (
                            <Badge variant="outline" className={`bg-${activity.color}/10 text-${activity.color} border-${activity.color}/20`}>
                              {activity.badge}
                            </Badge>
                          )}
                          {activity.progress && (
                            <Progress value={activity.progress} className="w-16 h-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity yet. Start learning to see your progress!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Badge */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Next Badge</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center">
                      <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
                      <Skeleton className="h-4 w-24 mx-auto mb-2" />
                      <Skeleton className="h-3 w-32 mx-auto mb-3" />
                      <Skeleton className="h-2 w-full mb-2" />
                      <Skeleton className="h-3 w-20 mx-auto" />
                    </div>
                  ) : dashboardData?.nextBadge ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <div className="text-2xl">{dashboardData.nextBadge.icon}</div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{dashboardData.nextBadge.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{dashboardData.nextBadge.description}</p>
                      <Progress value={dashboardData.nextBadge.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">{dashboardData.nextBadge.requirement}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="h-8 w-8 text-accent" />
                      </div>
                      <p className="text-sm text-muted-foreground">Great job! You've earned all available badges!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;