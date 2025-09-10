import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import TeacherLayout from "@/components/TeacherLayout";
import {
  Users,
  TrendingUp,
  Award,
  BookOpen,
  Download,
  Mail,
  Search,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  FileText,
  Settings,
  Bell,
  LogOut
} from "lucide-react";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [userData, setUserData] = useState<any>(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token || userType !== 'institution') {
      navigate('/auth');
      return;
    }
    
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [navigate]);

  const handleLogout = () => {
    console.log('Logging out institution...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    // Clear any other potential auth-related items
    localStorage.clear();
    console.log('LocalStorage cleared, redirecting to home...');
    navigate('/');
  };

  // Teacher data from authentication
  const teacherInfo = {
    name: userData?.name || "Institution",
    email: userData?.email || "",
    classes: ["Grade 8A", "Grade 8B", "Grade 9A"],
    totalStudents: 72
  };

  // Mock student data
  const studentsData = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@email.com",
      class: "Grade 8A",
      avatar: "/api/placeholder/32/32",
      quizzesCompleted: 8,
      totalQuizzes: 12,
      averageScore: 87,
      lastActive: "2 hours ago",
      streak: 5,
      badges: 3,
      moduleProgress: {
        earthquake: 100,
        flood: 75,
        fire: 60,
        storm: 40
      }
    },
    {
      id: "2", 
      name: "Bob Smith",
      email: "bob@email.com",
      class: "Grade 8A",
      avatar: "/api/placeholder/32/32",
      quizzesCompleted: 6,
      totalQuizzes: 12,
      averageScore: 92,
      lastActive: "1 day ago",
      streak: 3,
      badges: 2,
      moduleProgress: {
        earthquake: 85,
        flood: 90,
        fire: 30,
        storm: 20
      }
    },
    {
      id: "3",
      name: "Carol Davis",
      email: "carol@email.com", 
      class: "Grade 8B",
      avatar: "/api/placeholder/32/32",
      quizzesCompleted: 12,
      totalQuizzes: 12,
      averageScore: 95,
      lastActive: "30 minutes ago",
      streak: 12,
      badges: 5,
      moduleProgress: {
        earthquake: 100,
        flood: 100,
        fire: 100,
        storm: 85
      }
    },
    {
      id: "4",
      name: "David Wilson",
      email: "david@email.com",
      class: "Grade 9A",
      avatar: "/api/placeholder/32/32",
      quizzesCompleted: 4,
      totalQuizzes: 12,
      averageScore: 78,
      lastActive: "3 days ago",
      streak: 0,
      badges: 1,
      moduleProgress: {
        earthquake: 60,
        flood: 40,
        fire: 25,
        storm: 10
      }
    }
  ];

  // Chart data
  const classPerformanceData = [
    { class: "Grade 8A", average: 82, completed: 67 },
    { class: "Grade 8B", average: 88, completed: 78 },
    { class: "Grade 9A", average: 85, completed: 72 }
  ];

  const moduleCompletionData = [
    { name: "Earthquake", completed: 85, total: 100 },
    { name: "Flood", completed: 78, total: 100 },
    { name: "Fire", completed: 65, total: 100 },
    { name: "Storm", completed: 52, total: 100 }
  ];

  const progressOverTimeData = [
    { week: "Week 1", completion: 20 },
    { week: "Week 2", completion: 35 },
    { week: "Week 3", completion: 50 },
    { week: "Week 4", completion: 68 },
    { week: "Week 5", completion: 72 }
  ];

  const pieChartData = [
    { name: "Completed", value: 68, color: "hsl(var(--accent))" },
    { name: "In Progress", value: 22, color: "hsl(var(--secondary))" },
    { name: "Not Started", value: 10, color: "hsl(var(--muted))" }
  ];

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "all" || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const getStudentStatus = (student: any) => {
    const completionRate = (student.quizzesCompleted / student.totalQuizzes) * 100;
    if (completionRate === 100) return { status: "excellent", color: "bg-accent", text: "Excellent" };
    if (completionRate >= 70) return { status: "good", color: "bg-primary", text: "Good" };
    if (completionRate >= 40) return { status: "average", color: "bg-secondary", text: "Needs Focus" };
    return { status: "poor", color: "bg-red-500", text: "At Risk" };
  };

  return (
    <TeacherLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/api/placeholder/64/64" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {teacherInfo.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {teacherInfo.name}</h1>
              <p className="text-muted-foreground">Managing {teacherInfo.totalStudents} students across {teacherInfo.classes.length} classes</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Reports
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send Updates
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary-light to-primary/20 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-dark font-medium">Total Students</p>
                <p className="text-3xl font-bold text-primary">{teacherInfo.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-accent-light to-accent/20 border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-foreground font-medium">Average Score</p>
                <p className="text-3xl font-bold text-accent">85%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-secondary-light to-secondary/20 border-secondary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-foreground font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-secondary">72%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-secondary" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-muted to-muted/50 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground font-medium">Active Today</p>
                <p className="text-3xl font-bold text-foreground">24</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        </div>
      </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Class Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer 
                    config={{
                      average: { label: "Average Score", color: "hsl(var(--primary))" },
                      completed: { label: "Completion %", color: "hsl(var(--accent))" }
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="class" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="average" fill="hsl(var(--primary))" radius={4} />
                        <Bar dataKey="completed" fill="hsl(var(--accent))" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Progress Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-secondary" />
                    Student Progress Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer 
                    config={{
                      completed: { label: "Completed", color: "hsl(var(--accent))" },
                      inProgress: { label: "In Progress", color: "hsl(var(--secondary))" },
                      notStarted: { label: "Not Started", color: "hsl(var(--muted))" }
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Progress Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Class Progress Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={{
                    completion: { label: "Completion Rate %", color: "hsl(var(--primary))" }
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressOverTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="completion" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {teacherInfo.classes.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Student Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Quizzes</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const status = getStudentStatus(student);
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={student.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{student.class}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                {student.quizzesCompleted}/{student.totalQuizzes}
                              </p>
                              <Progress 
                                value={(student.quizzesCompleted / student.totalQuizzes) * 100} 
                                className="h-2 w-20"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{student.averageScore}%</span>
                              {student.averageScore >= 90 && <Star className="h-4 w-4 text-yellow-500" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} text-white`}>
                              {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {student.lastActive}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedStudent(student.id)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Module Completion Rates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    Module Completion Rates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {moduleCompletionData.map((module, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{module.name}</span>
                        <span className="text-sm text-muted-foreground">{module.completed}%</span>
                      </div>
                      <Progress value={module.completed} className="h-3" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Strong Performance</p>
                      <p className="text-sm text-muted-foreground">45% of students scoring above 85%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="font-medium">Needs Attention</p>
                      <p className="text-sm text-muted-foreground">12% of students at risk (below 60%)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Top Performers</p>
                      <p className="text-sm text-muted-foreground">Carol Davis leads with 95% average</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Class Summary Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">Overall class performance and completion rates</p>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Individual Progress</h3>
                  <p className="text-sm text-muted-foreground mb-4">Detailed breakdown per student</p>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Weekly Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-4">Trends and improvements over time</p>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>
            </div>
        </TabsContent>
      </Tabs>
    </TeacherLayout>
  );
};

export default TeacherDashboard;