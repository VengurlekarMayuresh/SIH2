import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/Sidebar";
import InstituteDashboard from "@/components/InstituteDashboard";
import {
  User,
  School,
  LogOut,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Bell,
  Calendar,
  Target,
  Clock,
  HelpCircle,
  FileText,
  ChevronRight,
  Eye,
  Flame
} from 'lucide-react';

// API Base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  institutionId?: string;
  rollNo?: string;
  class?: string;
  division?: string;
  phone?: string;
  location?: any;
}

interface AuthResponse {
  token: string;
  student?: User;
  institution?: User;
  message: string;
}

// Institution Sign-up form data
interface InstitutionSignUpData {
  name: string;
  institutionId: string;
  email: string;
  password: string;
  phone: string;
  location: {
    state: string;
    district: string;
    city: string;
    pincode: string;
    address: string;
  };
}

// Student Sign-up form data
interface StudentSignUpData {
  name: string;
  institutionId: string;
  rollNo: string;
  class: string;
  division: string;
  email: string;
  password: string;
  phone: string;
  parentPhone: string;
}

// Main AuthSystem Component
const AuthSystem = () => {
  const [currentPage, setCurrentPage] = useState<'auth' | 'studentMainPage' | 'institutionDashboard'>('auth');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'student' | 'institution' | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Auth form states
  const [activeTab, setActiveTab] = useState<'student' | 'institution'>('student');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Sign-in form states
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  // Institution sign-up form states
  const [institutionSignUpData, setInstitutionSignUpData] = useState<InstitutionSignUpData>({
    name: '',
    institutionId: '',
    email: '',
    password: '',
    phone: '',
    location: {
      state: '',
      district: '',
      city: '',
      pincode: '',
      address: ''
    }
  });
  
  // Student sign-up form states
  const [studentSignUpData, setStudentSignUpData] = useState<StudentSignUpData>({
    name: '',
    institutionId: '',
    rollNo: '',
    class: '',
    division: '',
    email: '',
    password: '',
    phone: '',
    parentPhone: ''
  });
  
  const [hasInstituteCode, setHasInstituteCode] = useState<boolean>(true);

  // Check for existing session on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData');
    const storedUserType = localStorage.getItem('userType');
    
    if (token && storedUserData && storedUserType) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUserData));
      setUserType(storedUserType as 'student' | 'institution');
      setCurrentPage(storedUserType === 'student' ? 'studentMainPage' : 'institutionDashboard');
    }
  }, []);

  // API call functions
  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const endpoint = activeTab === 'student' 
        ? `${API_BASE_URL}/student/login`
        : `${API_BASE_URL}/institution/login`;
      
      const response = await axios.post<AuthResponse>(endpoint, signInData);
      const { token, student, institution, message } = response.data;
      
      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userType', activeTab);
      
      const user = student || institution;
      if (user) {
        localStorage.setItem('userData', JSON.stringify(user));
        setUserData(user);
      }
      
      setUserType(activeTab);
      setIsLoggedIn(true);
      setCurrentPage(activeTab === 'student' ? 'studentMainPage' : 'institutionDashboard');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionSignUp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/institution/register`, 
        institutionSignUpData
      );
      const { token, institution, message } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userType', 'institution');
      
      if (institution) {
        localStorage.setItem('userData', JSON.stringify(institution));
        setUserData(institution);
      }
      
      setUserType('institution');
      setIsLoggedIn(true);
      setCurrentPage('institutionDashboard');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSignUp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/student/register`, 
        studentSignUpData
      );
      const { token, student, message } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userType', 'student');
      
      if (student) {
        localStorage.setItem('userData', JSON.stringify(student));
        setUserData(student);
      }
      
      setUserType('student');
      setIsLoggedIn(true);
      setCurrentPage('studentMainPage');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    
    setIsLoggedIn(false);
    setUserData(null);
    setUserType(null);
    setCurrentPage('auth');
    
    // Reset form data
    setSignInData({ email: '', password: '' });
    setInstitutionSignUpData({
      name: '', institutionId: '', email: '', password: '', phone: '',
      location: { state: '', district: '', city: '', pincode: '', address: '' }
    });
    setStudentSignUpData({
      name: '', institutionId: '', rollNo: '', class: '', division: '',
      email: '', password: '', phone: '', parentPhone: ''
    });
    setHasInstituteCode(true);
    setError('');
  };

  const resetForm = () => {
    setError('');
    setSignInData({ email: '', password: '' });
    setHasInstituteCode(true);
  };

  // Auth Page Component
  const AuthPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">SafeEd Platform</h1>
          <p className="text-muted-foreground">Disaster Preparedness Education</p>
        </div>

        <Card className="w-full shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant={isSignUp ? "outline" : "default"}
                size="sm"
                onClick={() => { setIsSignUp(false); resetForm(); }}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                variant={isSignUp ? "default" : "outline"}
                size="sm"
                onClick={() => { setIsSignUp(true); resetForm(); }}
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as 'student' | 'institution');
              resetForm();
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="institution" className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Institution
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Student Tab */}
              <TabsContent value="student" className="space-y-4 mt-4">
                {!isSignUp ? (
                  // Student Sign In
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-email">Email</Label>
                      <Input
                        id="student-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password</Label>
                      <Input
                        id="student-password"
                        type="password"
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleSignIn}
                      disabled={loading || !signInData.email || !signInData.password}
                    >
                      {loading ? 'Signing In...' : 'Sign In as Student'}
                    </Button>
                  </div>
                ) : (
                  // Student Sign Up
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-name">Full Name *</Label>
                      <Input
                        id="student-name"
                        placeholder="e.g. John Smith"
                        value={studentSignUpData.name}
                        onChange={(e) => setStudentSignUpData({...studentSignUpData, name: e.target.value})}
                      />
                    </div>
                    
                    {/* Institute Code Toggle */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has-institute-code"
                          checked={hasInstituteCode}
                          onChange={(e) => {
                            setHasInstituteCode(e.target.checked);
                            if (!e.target.checked) {
                              setStudentSignUpData({...studentSignUpData, institutionId: '', rollNo: '', class: '', division: ''});
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="has-institute-code" className="text-sm font-medium">
                          I have an institution code
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {hasInstituteCode 
                          ? "Your institution will be able to monitor your progress" 
                          : "You can still use the platform independently"}
                      </p>
                    </div>

                    {hasInstituteCode && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="student-inst-id">Institution Code *</Label>
                          <Input
                            id="student-inst-id"
                            placeholder="e.g. ABC123, SCHOOL001"
                            value={studentSignUpData.institutionId}
                            onChange={(e) => setStudentSignUpData({...studentSignUpData, institutionId: e.target.value})}
                          />
                          <p className="text-xs text-muted-foreground">
                            Get this code from your institution
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-roll">Roll Number *</Label>
                          <Input
                            id="student-roll"
                            placeholder="e.g. 2024001, A123"
                            value={studentSignUpData.rollNo}
                            onChange={(e) => setStudentSignUpData({...studentSignUpData, rollNo: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-class">Class/Grade *</Label>
                          <Input
                            id="student-class"
                            placeholder="e.g. 10, Grade 9, Class XII"
                            value={studentSignUpData.class}
                            onChange={(e) => setStudentSignUpData({...studentSignUpData, class: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-division">Section/Division *</Label>
                          <Input
                            id="student-division"
                            placeholder="e.g. A, B, Alpha, Beta"
                            value={studentSignUpData.division}
                            onChange={(e) => setStudentSignUpData({...studentSignUpData, division: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="student-email-signup">Email Address *</Label>
                      <Input
                        id="student-email-signup"
                        type="email"
                        placeholder="student@example.com"
                        value={studentSignUpData.email}
                        onChange={(e) => setStudentSignUpData({...studentSignUpData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-password-signup">Password *</Label>
                      <Input
                        id="student-password-signup"
                        type="password"
                        placeholder="Create a strong password"
                        value={studentSignUpData.password}
                        onChange={(e) => setStudentSignUpData({...studentSignUpData, password: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters with letters and numbers
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-phone">Phone Number</Label>
                      <Input
                        id="student-phone"
                        placeholder="+91 98765 43210 (optional)"
                        value={studentSignUpData.phone}
                        onChange={(e) => setStudentSignUpData({...studentSignUpData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-parent-phone">Parent/Guardian Phone</Label>
                      <Input
                        id="student-parent-phone"
                        placeholder="+91 98765 43210 (optional)"
                        value={studentSignUpData.parentPhone}
                        onChange={(e) => setStudentSignUpData({...studentSignUpData, parentPhone: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleStudentSignUp}
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Student Account'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      * Required fields
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Institution Tab */}
              <TabsContent value="institution" className="space-y-4 mt-4">
                {!isSignUp ? (
                  // Institution Sign In
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inst-email">Email</Label>
                      <Input
                        id="inst-email"
                        type="email"
                        placeholder="Enter institution email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-password">Password</Label>
                      <Input
                        id="inst-password"
                        type="password"
                        placeholder="Enter institution password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleSignIn}
                      disabled={loading || !signInData.email || !signInData.password}
                    >
                      {loading ? 'Signing In...' : 'Sign In as Institution'}
                    </Button>
                  </div>
                ) : (
                  // Institution Sign Up
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inst-name">Institution Name *</Label>
                      <Input
                        id="inst-name"
                        placeholder="e.g. ABC High School, XYZ College"
                        value={institutionSignUpData.name}
                        onChange={(e) => setInstitutionSignUpData({...institutionSignUpData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-id">Institution Code *</Label>
                      <Input
                        id="inst-id"
                        placeholder="e.g. ABC123, SCHOOL001 (unique identifier)"
                        value={institutionSignUpData.institutionId}
                        onChange={(e) => setInstitutionSignUpData({...institutionSignUpData, institutionId: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Students will use this code to register under your institution
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-email-signup">Official Email *</Label>
                      <Input
                        id="inst-email-signup"
                        type="email"
                        placeholder="admin@school.edu, info@college.org"
                        value={institutionSignUpData.email}
                        onChange={(e) => setInstitutionSignUpData({...institutionSignUpData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-password-signup">Password *</Label>
                      <Input
                        id="inst-password-signup"
                        type="password"
                        placeholder="Create a strong password"
                        value={institutionSignUpData.password}
                        onChange={(e) => setInstitutionSignUpData({...institutionSignUpData, password: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-phone">Contact Phone *</Label>
                      <Input
                        id="inst-phone"
                        placeholder="+91 98765 43210"
                        value={institutionSignUpData.phone}
                        onChange={(e) => setInstitutionSignUpData({...institutionSignUpData, phone: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Institution Address</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="inst-state">State *</Label>
                          <Input
                            id="inst-state"
                            placeholder="e.g. Maharashtra, Delhi"
                            value={institutionSignUpData.location.state}
                            onChange={(e) => setInstitutionSignUpData({
                              ...institutionSignUpData, 
                              location: {...institutionSignUpData.location, state: e.target.value}
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inst-district">District *</Label>
                          <Input
                            id="inst-district"
                            placeholder="e.g. Pune, Mumbai"
                            value={institutionSignUpData.location.district}
                            onChange={(e) => setInstitutionSignUpData({
                              ...institutionSignUpData, 
                              location: {...institutionSignUpData.location, district: e.target.value}
                            })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="inst-city">City *</Label>
                          <Input
                            id="inst-city"
                            placeholder="e.g. Pune, Delhi"
                            value={institutionSignUpData.location.city}
                            onChange={(e) => setInstitutionSignUpData({
                              ...institutionSignUpData, 
                              location: {...institutionSignUpData.location, city: e.target.value}
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inst-pincode">Pincode *</Label>
                          <Input
                            id="inst-pincode"
                            placeholder="e.g. 411001"
                            value={institutionSignUpData.location.pincode}
                            onChange={(e) => setInstitutionSignUpData({
                              ...institutionSignUpData, 
                              location: {...institutionSignUpData.location, pincode: e.target.value}
                            })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inst-address">Complete Address *</Label>
                        <Input
                          id="inst-address"
                          placeholder="Building, Street, Area"
                          value={institutionSignUpData.location.address}
                          onChange={(e) => setInstitutionSignUpData({
                            ...institutionSignUpData, 
                            location: {...institutionSignUpData.location, address: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleInstitutionSignUp}
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Institution Account'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      * Required fields
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Student Dashboard (using your existing Dashboard component structure)
  const StudentMainPage = () => {
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
        color: "primary",
      },
      {
        title: "Take Safety Quiz",
        description: "Test your knowledge and earn badges",
        icon: HelpCircle,
        color: "secondary",
      },
      {
        title: "Check Resources",
        description: "Access emergency contacts and safety guides",
        icon: FileText,
        color: "accent",
      },
      {
        title: "View Progress",
        description: "Track your learning journey and achievements",
        icon: TrendingUp,
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
                    <h1 className="text-3xl font-bold text-foreground">
                      Welcome back, {userStats.name.split(' ')[0]}!
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      {userData?.institutionId ? (
                        // Student linked to institution
                        <>
                          <Badge variant="secondary" className="font-medium">
                            {userData?.class && `Class ${userData.class}`}
                          </Badge>
                          {userData?.rollNo && (
                            <Badge variant="outline" className="border-accent text-accent">
                              Roll No: {userData.rollNo}
                            </Badge>
                          )}
                          {userData?.institution && (
                            <Badge variant="default" className="bg-primary/10 text-primary">
                              <School className="h-3 w-3 mr-1" />
                              {userData.institution.name}
                            </Badge>
                          )}
                        </>
                      ) : (
                        // Independent student
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Independent Learner
                        </Badge>
                      )}
                    </div>
                    {!userData?.institutionId && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Learning independently • Progress tracked privately
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="relative">
                    <Bell className="h-4 w-4 mr-1" />
                    Notifications
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

            {/* Quick Actions */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground">Continue Learning</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Card 
                    key={index} 
                    className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
                  >
                    <CardHeader className="pb-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-primary/10 to-primary/20">
                        <action.icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {action.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-sm mb-4">
                        {action.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Start Now
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-primary">Modules Completed</p>
                      <p className="text-2xl font-bold text-primary">3/5</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">2 more to go!</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-accent">Average Quiz Score</p>
                      <p className="text-2xl font-bold text-accent">85%</p>
                    </div>
                    <Award className="h-8 w-8 text-accent" />
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Excellent work!</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-secondary">Badges Earned</p>
                      <p className="text-2xl font-bold text-secondary">4/8</p>
                    </div>
                    <Award className="h-8 w-8 text-secondary" />
                  </div>
                  <Progress value={50} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Next: {userStats.nextBadge}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-primary">Study Time</p>
                      <p className="text-2xl font-bold text-primary">2.5h</p>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <Progress value={userStats.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">This week</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // Institution Dashboard using the new enhanced component
  const InstitutionDashboard = () => {
    return (
      <InstituteDashboard 
        institutionData={userData} 
        onLogout={handleLogout} 
      />
    );
  };

  // Main render logic
  if (currentPage === 'auth') {
    return <AuthPage />;
  } else if (currentPage === 'studentMainPage') {
    return <StudentMainPage />;
  } else if (currentPage === 'institutionDashboard') {
    return <InstitutionDashboard />;
  }

  return <AuthPage />;
};

export default AuthSystem;
