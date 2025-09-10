import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { Trophy, Star, BookOpen, Award, TrendingUp, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const quizScoreData = [
  { date: "Week 1", score: 65 },
  { date: "Week 2", score: 72 },
  { date: "Week 3", score: 78 },
  { date: "Week 4", score: 85 },
  { date: "Week 5", score: 88 },
  { date: "Week 6", score: 92 },
];

const moduleProgressData = [
  { module: "Earthquake", progress: 100, color: "#3A7CA5" },
  { module: "Fire", progress: 100, color: "#FF914D" },
  { module: "Flood", progress: 85, color: "#4CAF50" },
  { module: "Cyclone", progress: 60, color: "#3A7CA5" },
  { module: "Pandemic", progress: 30, color: "#4CAF50" },
];

const badges = [
  {
    title: "Earthquake Expert",
    description: "Completed Earthquake Safety module with 95% score",
    icon: "🏆",
    color: "accent",
    earned: true,
    date: "2 weeks ago"
  },
  {
    title: "Fire Safety Hero", 
    description: "Mastered fire safety protocols and prevention",
    icon: "🔥",
    color: "secondary",
    earned: true,
    date: "1 week ago"
  },
  {
    title: "First Aid Champion",
    description: "Completed basic first aid training module",
    icon: "🩹",
    color: "primary",
    earned: true,
    date: "3 days ago"
  },
  {
    title: "Safety Educator",
    description: "Shared safety knowledge with 5+ people",
    icon: "👨‍🏫",
    color: "accent",
    earned: true,
    date: "1 day ago"
  },
  {
    title: "Flood Preparedness",
    description: "Complete flood safety module with 90% score",
    icon: "🌊",
    color: "primary",
    earned: false,
    date: "In Progress"
  },
  {
    title: "Disaster Master",
    description: "Complete all disaster modules with 85%+ average",
    icon: "🎯",
    color: "secondary",
    earned: false,
    date: "Locked"
  }
];

const Progress = () => {
  const totalModules = moduleProgressData.length;
  const completedModules = moduleProgressData.filter(m => m.progress === 100).length;
  const averageScore = quizScoreData[quizScoreData.length - 1]?.score || 0;
  const earnedBadges = badges.filter(b => b.earned).length;
  const overallProgress = Math.round((moduleProgressData.reduce((sum, m) => sum + m.progress, 0) / totalModules));

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
                <div className="text-2xl font-bold text-primary mb-1">{completedModules}/{totalModules}</div>
                <p className="text-sm text-muted-foreground">Modules Completed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-secondary mx-auto mb-3" />
                <div className="text-2xl font-bold text-secondary mb-1">{averageScore}%</div>
                <p className="text-sm text-muted-foreground">Latest Quiz Score</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-accent mb-1">{earnedBadges}</div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">{overallProgress}%</div>
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
                        {badge.earned ? `Earned ${badge.date}` : badge.date}
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
                  <span>Started 6 weeks ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>27% improvement</span>
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