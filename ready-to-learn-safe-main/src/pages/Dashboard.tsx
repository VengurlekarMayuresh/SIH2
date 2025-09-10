import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/Sidebar";
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
  LogOut
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token || userType !== 'student') {
      navigate('/auth');
      return;
    }
    
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
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

  const userStats = {
    name: userData?.name || "Student",
    level: 12,
    streak: 7,
    nextBadge: "Disaster Master",
    progress: 68,
    todayGoal: 3,
    completedToday: 1
  };

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
                  <AvatarImage src="/placeholder.svg" alt={userStats.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Welcome back, {userStats.name.split(' ')[0]}!</h1>
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Today's Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      {userStats.completedToday}/{userStats.todayGoal} activities completed
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <Progress 
                  value={(userStats.completedToday / userStats.todayGoal) * 100} 
                  className="h-2 mb-2" 
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Keep going!</span>
                  <span className="text-primary font-medium">
                    {Math.round((userStats.completedToday / userStats.todayGoal) * 100)}% complete
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-primary">Modules Completed</p>
                    <p className="text-2xl font-bold text-primary">3/5</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">2 more to go!</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-secondary">Average Quiz Score</p>
                    <p className="text-2xl font-bold text-secondary">85%</p>
                  </div>
                  <Award className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform" />
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Excellent work!</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-accent">Badges Earned</p>
                    <p className="text-2xl font-bold text-accent">4/8</p>
                  </div>
                  <Award className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
                </div>
                <Progress value={50} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Next: {userStats.nextBadge}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-primary">Study Time</p>
                    <p className="text-2xl font-bold text-primary">2.5h</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <Progress value={userStats.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">This week</p>
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

          {/* Recent Activity & Quick Stats */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {userStats.streak} day streak 🔥
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Earned "Fire Safety Hero" badge</p>
                      <p className="text-sm text-muted-foreground">Completed Fire Safety module with 90% score • 2h ago</p>
                    </div>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">New!</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Completed Earthquake Safety module</p>
                      <p className="text-sm text-muted-foreground">Learned about before, during, and after safety measures • Yesterday</p>
                    </div>
                    <Progress value={100} className="w-16 h-2" />
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <HelpCircle className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Took Flood Safety quiz</p>
                      <p className="text-sm text-muted-foreground">Scored 85% - Great job! • 2 days ago</p>
                    </div>
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">85%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Flame className="h-5 w-5 text-secondary" />
                    This Week's Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">68%</div>
                    <Progress value={68} className="h-3 mb-3" />
                    <p className="text-sm text-muted-foreground">Complete 2 more modules to reach your goal!</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Next Badge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{userStats.nextBadge}</h3>
                    <p className="text-sm text-muted-foreground mb-3">Complete all disaster modules</p>
                    <Progress value={60} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">3/5 modules completed</p>
                  </div>
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