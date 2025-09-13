import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  TrendingUp,
  BookOpen,
  Award,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Clock,
  Target,
  School,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  User
} from 'lucide-react';
import AlertManagement from './AlertManagement';
import LiveStatsCard from './LiveStatsCard';
import RecentActivityFeed from './RecentActivityFeed';
import { useLiveStats, useStatsRefresh } from '../hooks/useLiveStats';
import { ThemeToggle } from './theme-toggle';

const API_BASE_URL = 'http://localhost:5001/api';

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  class: string;
  division: string;
  email: string;
  phone?: string;
  createdAt: string;
  progress: {
    modulesCompleted: number;
    quizzesTaken: number;
    averageScore: number;
    lastActive: string;
  };
}

interface Analytics {
  totalStudents: number;
  studentsThisMonth: number;
  classwiseBreakdown: Record<string, number>;
  divisionwiseBreakdown: Record<string, number>;
  registrationTrends: {
    lastWeek: number;
    lastMonth: number;
    last3Months: number;
  };
}

interface InstituteDashboardProps {
  institutionData: any;
  onLogout: () => void;
}

const InstituteDashboard: React.FC<InstituteDashboardProps> = ({ institutionData, onLogout }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Live statistics hook (refreshes every 30 seconds)
  const { stats: liveStats, activities, loading: statsLoading, error: statsError, refreshStats } = useLiveStats(30000);
  const { isRefreshing, refresh } = useStatsRefresh();

  // Fetch students with progress data
  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (selectedClass !== 'all') params.append('class', selectedClass);
      if (selectedDivision !== 'all') params.append('division', selectedDivision);

      const response = await axios.get(
        `${API_BASE_URL}/institution/students-progress?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStudents(response.data.students);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${API_BASE_URL}/institution/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(response.data.analytics);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAnalytics();
  }, [currentPage, selectedClass, selectedDivision]);

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUniqueClasses = () => {
    const classes = [...new Set(students.map(s => s.class))];
    return classes.sort();
  };

  const getUniqueDivisions = () => {
    const divisions = [...new Set(students.map(s => s.division))];
    return divisions.sort();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <School className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {institutionData?.name || 'Institution Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Code: {institutionData?.institutionId} • Monitor student progress
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-1" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress Tracking
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Live Statistics */}
          <TabsContent value="overview" className="space-y-6">
            {/* Live Statistics Cards */}
            <LiveStatsCard 
              stats={liveStats}
              loading={statsLoading}
              error={statsError}
              onRefresh={() => refresh(refreshStats)}
              isRefreshing={isRefreshing}
            />

            {/* Recent Activity Feed */}
            <RecentActivityFeed 
              activities={activities}
              loading={statsLoading}
              error={statsError}
            />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students by name, roll number, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Classes</option>
                    {getUniqueClasses().map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Divisions</option>
                    {getUniqueDivisions().map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Students List */}
            <Card>
              <CardHeader>
                <CardTitle>Students ({filteredStudents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading students...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStudents.map((student) => (
                      <div key={student._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{student.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Roll: {student.rollNo}</span>
                                <span>Class: {student.class}-{student.division}</span>
                                <span>{student.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex gap-2 mb-2">
                                <Badge variant="secondary">
                                  {student.progress.modulesCompleted} modules
                                </Badge>
                                <Badge variant="outline">
                                  {student.progress.averageScore}% avg
                                </Badge>
                              </div>
                              <Progress 
                                value={(student.progress.modulesCompleted / 5) * 100} 
                                className="w-24 h-2"
                              />
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <AlertManagement institutionData={institutionData} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Class-wise Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.classwiseBreakdown && (
                    <div className="space-y-3">
                      {Object.entries(analytics.classwiseBreakdown).map(([className, count]) => (
                        <div key={className} className="flex justify-between items-center">
                          <span className="font-medium">Class {className}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(count / analytics.totalStudents) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Registration Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-secondary/20 rounded">
                      <span>Last Week</span>
                      <Badge variant="secondary">{analytics?.registrationTrends.lastWeek || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded">
                      <span>Last Month</span>
                      <Badge variant="default">{analytics?.registrationTrends.lastMonth || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent/20 rounded">
                      <span>Last 3 Months</span>
                      <Badge variant="outline">{analytics?.registrationTrends.last3Months || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round((students.reduce((acc, s) => acc + s.progress.modulesCompleted, 0) / (students.length * 5)) * 100)}%
                    </div>
                    <p className="text-muted-foreground">Average Module Completion</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">
                      {Math.round(students.reduce((acc, s) => acc + s.progress.averageScore, 0) / students.length) || 0}%
                    </div>
                    <p className="text-muted-foreground">Average Quiz Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">
                      {students.filter(s => s.progress.quizzesTaken > 0).length}
                    </div>
                    <p className="text-muted-foreground">Active Learners</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students
                    .sort((a, b) => b.progress.averageScore - a.progress.averageScore)
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student._id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-secondary text-secondary-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.class}-{student.division}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {student.progress.averageScore}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InstituteDashboard;
