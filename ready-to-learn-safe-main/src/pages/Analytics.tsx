import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Trophy,
  BookOpen,
  Target,
  AlertCircle,
  Download,
  Calendar,
  Filter,
  Eye,
  CheckCircle2
} from 'lucide-react';

// Mock data for analytics
const studentEngagementData = [
  { month: 'Jan', active: 145, completed: 89, started: 178 },
  { month: 'Feb', active: 162, completed: 102, started: 195 },
  { month: 'Mar', active: 189, completed: 134, started: 223 },
  { month: 'Apr', active: 201, completed: 156, started: 241 },
  { month: 'May', active: 218, completed: 178, started: 267 },
  { month: 'Jun', active: 234, completed: 198, started: 289 },
];

const modulePopularityData = [
  { name: 'Fire Safety', students: 324, completion: 89, avgScore: 92 },
  { name: 'Earthquake Prep', students: 298, completion: 85, avgScore: 88 },
  { name: 'Flood Response', students: 276, completion: 78, avgScore: 85 },
  { name: 'Workplace Safety', students: 245, completion: 82, avgScore: 90 },
  { name: 'First Aid', students: 201, completion: 91, avgScore: 94 },
];

const completionDistribution = [
  { name: 'Completed', value: 68, color: '#4CAF50' },
  { name: 'In Progress', value: 22, color: '#FF9800' },
  { name: 'Not Started', value: 10, color: '#F44336' }
];

const performanceMetrics = [
  { metric: 'Quiz Scores', current: 87, target: 85, improvement: '+2%' },
  { metric: 'Completion Rate', current: 68, target: 70, improvement: '-2%' },
  { metric: 'Engagement Time', current: 24, target: 20, improvement: '+20%' },
  { metric: 'Active Users', current: 234, target: 200, improvement: '+17%' },
];

const riskAssessmentData = [
  { subject: 'Fire Safety', current: 92, benchmark: 85 },
  { subject: 'Earthquake', current: 88, benchmark: 80 },
  { subject: 'Flood', current: 85, benchmark: 82 },
  { subject: 'First Aid', current: 94, benchmark: 90 },
  { subject: 'Workplace', current: 90, benchmark: 88 },
];

const weeklyActivityData = [
  { day: 'Mon', videoViews: 45, quizTaken: 23, discussions: 12 },
  { day: 'Tue', videoViews: 52, quizTaken: 31, discussions: 18 },
  { day: 'Wed', videoViews: 48, quizTaken: 28, discussions: 15 },
  { day: 'Thu', videoViews: 61, quizTaken: 35, discussions: 22 },
  { day: 'Fri', videoViews: 38, quizTaken: 19, discussions: 8 },
  { day: 'Sat', videoViews: 29, quizTaken: 14, discussions: 6 },
  { day: 'Sun', videoViews: 25, quizTaken: 11, discussions: 4 },
];

const topPerformers = [
  { name: 'Alice Johnson', department: 'Engineering', score: 98, modules: 5, badge: 'Safety Expert' },
  { name: 'Michael Chen', department: 'Operations', score: 96, modules: 4, badge: 'Fire Safety Pro' },
  { name: 'Sarah Davis', department: 'Admin', score: 94, modules: 5, badge: 'Safety Champion' },
  { name: 'Robert Kim', department: 'IT', score: 92, modules: 3, badge: 'Emergency Ready' },
  { name: 'Lisa Wilson', department: 'HR', score: 90, modules: 4, badge: 'Safety Advocate' },
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  const getMetricColor = (current: number, target: number) => {
    if (current >= target) return 'text-green-600';
    if (current >= target * 0.9) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 85) return 'bg-green-100 text-green-800';
    if (completion >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="admin">Administration</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-gradient-to-r from-primary to-accent text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
            <p className="text-xl text-muted-foreground">
              Comprehensive insights into your organization's safety training performance
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                    <Badge variant={metric.current >= metric.target ? 'default' : 'destructive'}>
                      {metric.improvement}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getMetricColor(metric.current, metric.target)}`}>
                      {metric.metric === 'Engagement Time' ? `${metric.current}min` : 
                       metric.metric === 'Active Users' ? metric.current : `${metric.current}%`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {metric.metric === 'Engagement Time' ? `${metric.target}min` : 
                          metric.metric === 'Active Users' ? metric.target : `${metric.target}%`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Analytics Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="modules">Module Performance</TabsTrigger>
              <TabsTrigger value="students">Student Analytics</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Student Engagement Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Student Engagement Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={studentEngagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="active" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="completed" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Completion Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-accent" />
                      Overall Completion Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={completionDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {completionDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4">
                      {completionDistribution.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}: {item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Activity Pattern */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    Weekly Activity Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="videoViews" fill="#8884d8" name="Video Views" />
                      <Bar dataKey="quizTaken" fill="#82ca9d" name="Quizzes Taken" />
                      <Bar dataKey="discussions" fill="#ffc658" name="Discussions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Module Performance Tab */}
            <TabsContent value="modules" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Module Popularity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Module Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {modulePopularityData.map((module, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{module.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {module.students} students
                              </span>
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {module.avgScore}% avg score
                              </span>
                            </div>
                          </div>
                          <Badge className={getCompletionColor(module.completion)}>
                            {module.completion}% complete
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Assessment Radar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-accent" />
                      Safety Readiness Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={riskAssessmentData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar name="Current" dataKey="current" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                        <Radar name="Benchmark" dataKey="benchmark" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Student Analytics Tab */}
            <TabsContent value="students" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Top Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-secondary" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topPerformers.map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-primary'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{student.name}</h4>
                              <p className="text-sm text-muted-foreground">{student.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{student.score}%</div>
                            <Badge variant="outline" className="text-xs">
                              {student.modules} modules
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Learning Progress Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={studentEngagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={3} />
                        <Line type="monotone" dataKey="active" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* AI Recommendations */}
                <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-accent" />
                      AI-Powered Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-800">Strong Performance Detected</h4>
                          <p className="text-sm text-green-700">Fire Safety module shows excellent engagement (92% completion rate). Consider using this as a template for other modules.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Engagement Drop Detected</h4>
                          <p className="text-sm text-yellow-700">Flood Response module has 22% lower engagement on weekends. Consider sending reminder notifications or gamification elements.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Optimization Opportunity</h4>
                          <p className="text-sm text-blue-700">Students perform 15% better on quizzes taken between 10-11 AM. Consider scheduling important assessments during peak attention hours.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-purple-800">Personalization Suggestion</h4>
                          <p className="text-sm text-purple-700">Engineering department shows preference for technical content. Recommend adding more detailed technical safety procedures.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Predictive Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-secondary" />
                      Predictive Outcomes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Completion Forecast</h4>
                      <div className="text-2xl font-bold text-green-600 mb-1">+12%</div>
                      <p className="text-sm text-muted-foreground">Expected improvement in overall completion rates by end of quarter based on current trends.</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">At-Risk Students</h4>
                      <div className="text-2xl font-bold text-red-600 mb-1">18</div>
                      <p className="text-sm text-muted-foreground">Students likely to drop out based on engagement patterns. Intervention recommended.</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Optimal Learning Path</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Fire Safety → First Aid</span>
                          <span className="text-green-600">87% success rate</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Earthquake → Workplace</span>
                          <span className="text-green-600">82% success rate</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
