import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  School,
  AlertCircle,
  ArrowLeft,
  Shield,
  BookOpen,
  Users
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

const AuthPage = () => {
  const navigate = useNavigate();
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

  // Optional: Check for existing session on component mount
  // Commented out to allow users to access auth page even if logged in
  // useEffect(() => {
  //   const token = localStorage.getItem('authToken');
  //   const storedUserType = localStorage.getItem('userType');
  //   
  //   if (token && storedUserType) {
  //     // Redirect to appropriate dashboard if already logged in
  //     if (storedUserType === 'student') {
  //       navigate('/dashboard');
  //     } else {
  //       navigate('/teacher');
  //     }
  //   }
  // }, [navigate]);

  // API call functions
  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const endpoint = activeTab === 'student' 
        ? `${API_BASE_URL}/student/login`
        : `${API_BASE_URL}/institution/login`;
      
      const response = await axios.post<AuthResponse>(endpoint, signInData);
      const { token, student, institution } = response.data;
      
      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userType', activeTab);
      
      const user = student || institution;
      if (user) {
        localStorage.setItem('userData', JSON.stringify(user));
      }
      
      // Navigate to appropriate dashboard
      if (activeTab === 'student') {
        navigate('/dashboard');
      } else {
        navigate('/institution');
      }
      
    } catch (err: any) {
      console.error('Login Error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
      const { token, institution } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userType', 'institution');
      
      if (institution) {
        localStorage.setItem('userData', JSON.stringify(institution));
      }
      
      navigate('/institution');
      
    } catch (err: any) {
      console.error('Institution Registration Error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Add specific field information if available
        if (errorData.field) {
          errorMessage += ` (${errorData.field}: ${errorData.value})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
      const { token, student } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userType', 'student');
      
      if (student) {
        localStorage.setItem('userData', JSON.stringify(student));
      }
      
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('Student Registration Error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Add specific field information if available
        if (errorData.field) {
          errorMessage += ` (${errorData.field}: ${errorData.value})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setSignInData({ email: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-60 animate-bounce"></div>
      <div className="absolute top-1/2 left-0 w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
      
      {/* Back Button - Floating */}
      <Button 
        variant="outline" 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Main Auth Container */}
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary via-secondary to-accent p-8 items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              <div className="relative z-10 text-center text-white">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Welcome to SafeEd</h2>
                <p className="text-lg opacity-90 leading-relaxed">
                  Join our community of learners and educators dedicated to disaster preparedness and safety education.
                </p>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Interactive Learning Modules</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Community of Educators</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Safety First Approach</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Forms */}
            <div className="w-full lg:w-3/5 p-8">
              <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h1>
                  <p className="text-gray-600">
                    {isSignUp ? 'Join the SafeEd community today' : 'Sign in to your account'}
                  </p>
                </div>

                {/* Sign In/Up Toggle */}
                <div className="flex items-center justify-center gap-1 mb-8 bg-gray-100 rounded-xl p-1">
                  <Button
                    variant={isSignUp ? "ghost" : "default"}
                    size="sm"
                    onClick={() => { setIsSignUp(false); resetForm(); }}
                    className={`flex-1 h-10 text-sm font-medium rounded-lg transition-all ${
                      !isSignUp 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant={isSignUp ? "default" : "ghost"}
                    size="sm"
                    onClick={() => { setIsSignUp(true); resetForm(); }}
                    className={`flex-1 h-10 text-sm font-medium rounded-lg transition-all ${
                      isSignUp 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    Sign Up
                  </Button>
                </div>
                {/* User Type Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => {
                  setActiveTab(value as 'student' | 'institution');
                  resetForm();
                }} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 rounded-xl p-1 mb-6">
                    <TabsTrigger 
                      value="student" 
                      className="flex items-center gap-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <User className="h-4 w-4" />
                      Student
                    </TabsTrigger>
                    <TabsTrigger 
                      value="institution" 
                      className="flex items-center gap-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <School className="h-4 w-4" />
                      Institution
                    </TabsTrigger>
                  </TabsList>

                  {error && (
                    <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Student Tab */}
                  <TabsContent value="student" className="space-y-0 mt-0">
                    {!isSignUp ? (
                      // Student Sign In
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="student-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                          <Input
                            id="student-email"
                            type="email"
                            placeholder="student@example.com"
                            value={signInData.email}
                            onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                            className="h-11 text-base border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-password" className="text-sm font-medium text-gray-700">Password</Label>
                          <Input
                            id="student-password"
                            type="password"
                            placeholder="••••••••"
                            value={signInData.password}
                            onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                            className="h-11 text-base border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                          />
                        </div>
                        <Button 
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl" 
                          onClick={handleSignIn}
                          disabled={loading || !signInData.email || !signInData.password}
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Signing In...
                            </div>
                          ) : (
                            'Sign In as Student'
                          )}
                        </Button>
                      </div>
                    ) : (
                      // Student Sign Up
                      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="student-name" className="text-sm font-medium text-gray-700">Full Name</Label>
                            <Input
                              id="student-name"
                              placeholder="John Doe"
                              value={studentSignUpData.name}
                              onChange={(e) => setStudentSignUpData({...studentSignUpData, name: e.target.value})}
                              className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-inst-id" className="text-sm font-medium text-gray-700">Institution ID</Label>
                            <Input
                              id="student-inst-id"
                              placeholder="SCHOOL001"
                              value={studentSignUpData.institutionId}
                              onChange={(e) => setStudentSignUpData({...studentSignUpData, institutionId: e.target.value})}
                              className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="student-roll" className="text-sm font-medium text-gray-700">Roll No</Label>
                            <Input
                              id="student-roll"
                              placeholder="001"
                              value={studentSignUpData.rollNo}
                              onChange={(e) => setStudentSignUpData({...studentSignUpData, rollNo: e.target.value})}
                              className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-class" className="text-sm font-medium text-gray-700">Class</Label>
                            <Input
                              id="student-class"
                              placeholder="10"
                              value={studentSignUpData.class}
                              onChange={(e) => setStudentSignUpData({...studentSignUpData, class: e.target.value})}
                              className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-division" className="text-sm font-medium text-gray-700">Division</Label>
                            <Input
                              id="student-division"
                              placeholder="A"
                              value={studentSignUpData.division}
                              onChange={(e) => setStudentSignUpData({...studentSignUpData, division: e.target.value})}
                              className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-email-signup" className="text-sm font-medium text-gray-700">Email Address</Label>
                          <Input
                            id="student-email-signup"
                            type="email"
                            placeholder="student@example.com"
                            value={studentSignUpData.email}
                            onChange={(e) => setStudentSignUpData({...studentSignUpData, email: e.target.value})}
                            className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-password-signup" className="text-sm font-medium text-gray-700">Password</Label>
                          <Input
                            id="student-password-signup"
                            type="password"
                            placeholder="Strong password (min 8 chars)"
                            value={studentSignUpData.password}
                            onChange={(e) => setStudentSignUpData({...studentSignUpData, password: e.target.value})}
                            className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
                          />
                          <p className="text-xs text-gray-500 mt-1">Must be a strong password (min 8 characters, uppercase, lowercase, number, symbol)</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="student-phone" className="text-sm font-medium text-gray-700">Phone (Optional)</Label>
                            <Input
                              id="student-phone"
                              placeholder="9876543210"
                              value={studentSignUpData.phone}
                              onChange={(e) => setStudentSignUpData({...studentSignUpData, phone: e.target.value})}
                              className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-parent-phone" className="text-sm font-medium text-gray-700">Parent Phone (Optional)</Label>
                            <Input
                              id="student-parent-phone"
                              placeholder="9876543210"
                              value={studentSignUpData.parentPhone}
                              onChange={(e) => setStudentSignUpData({...studentSignUpData, parentPhone: e.target.value})}
                              className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="pt-2">
                          <Button 
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl" 
                            onClick={handleStudentSignUp}
                            disabled={loading}
                          >
                            {loading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating Account...
                              </div>
                            ) : (
                              'Create Student Account'
                            )}
                          </Button>
                        </div>
                      </div>
                  )}
                  </TabsContent>

                  {/* Institution Tab */}
                  <TabsContent value="institution" className="space-y-0 mt-0">
                    {!isSignUp ? (
                      // Institution Sign In
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="inst-email" className="text-sm font-medium text-gray-700">Institution Email</Label>
                          <Input
                            id="inst-email"
                            type="email"
                            placeholder="admin@school.edu"
                            value={signInData.email}
                            onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                            className="h-11 text-base border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inst-password" className="text-sm font-medium text-gray-700">Password</Label>
                          <Input
                            id="inst-password"
                            type="password"
                            placeholder="••••••••"
                            value={signInData.password}
                            onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                            className="h-11 text-base border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-xl"
                          />
                        </div>
                        <Button 
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl" 
                          onClick={handleSignIn}
                          disabled={loading || !signInData.email || !signInData.password}
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Signing In...
                            </div>
                          ) : (
                            'Sign In as Institution'
                          )}
                        </Button>
                      </div>
                    ) : (
                      // Institution Sign Up
                      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="inst-name" className="text-sm font-medium text-gray-700">Institution Name</Label>
                            <Input
                              id="inst-name"
                              placeholder="ABC High School"
                              value={institutionSignUpData.name}
                              onChange={(e) => setInstitutionSignUpData({...institutionSignUpData, name: e.target.value})}
                              className="h-10 border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="inst-id" className="text-sm font-medium text-gray-700">Institution ID</Label>
                            <Input
                              id="inst-id"
                              placeholder="SCHOOL001"
                              value={institutionSignUpData.institutionId}
                              onChange={(e) => setInstitutionSignUpData({...institutionSignUpData, institutionId: e.target.value})}
                              className="h-10 border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inst-email-signup" className="text-sm font-medium text-gray-700">Institution Email</Label>
                          <Input
                            id="inst-email-signup"
                            type="email"
                            placeholder="admin@school.edu"
                            value={institutionSignUpData.email}
                            onChange={(e) => setInstitutionSignUpData({...institutionSignUpData, email: e.target.value})}
                            className="h-10 border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-lg"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="inst-password-signup" className="text-sm font-medium text-gray-700">Password</Label>
                            <Input
                              id="inst-password-signup"
                              type="password"
                              placeholder="Strong password (min 6 chars, 1 lowercase)"
                              value={institutionSignUpData.password}
                              onChange={(e) => setInstitutionSignUpData({...institutionSignUpData, password: e.target.value})}
                              className="h-10 border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters with 1 lowercase letter</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="inst-phone" className="text-sm font-medium text-gray-700">Phone</Label>
                            <Input
                              id="inst-phone"
                              placeholder="9876543210 (10 digits, no spaces/+)"
                              value={institutionSignUpData.phone}
                              onChange={(e) => setInstitutionSignUpData({...institutionSignUpData, phone: e.target.value})}
                              className="h-10 border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Indian mobile number format (10 digits)</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-secondary to-accent rounded"></div>
                            Institution Location
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="inst-state" className="text-sm font-medium text-gray-700">State</Label>
                              <Input
                                id="inst-state"
                                placeholder="Maharashtra"
                                value={institutionSignUpData.location.state}
                                onChange={(e) => setInstitutionSignUpData({
                                  ...institutionSignUpData, 
                                  location: {...institutionSignUpData.location, state: e.target.value}
                                })}
                                className="h-10 border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="inst-district" className="text-sm font-medium text-gray-700">District</Label>
                              <Input
                                id="inst-district"
                                placeholder="Mumbai"
                                value={institutionSignUpData.location.district}
                                onChange={(e) => setInstitutionSignUpData({
                                  ...institutionSignUpData, 
                                  location: {...institutionSignUpData.location, district: e.target.value}
                                })}
                                className="h-10 border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="inst-city" className="text-sm font-medium text-gray-700">City</Label>
                              <Input
                                id="inst-city"
                                placeholder="Mumbai"
                                value={institutionSignUpData.location.city}
                                onChange={(e) => setInstitutionSignUpData({
                                  ...institutionSignUpData, 
                                  location: {...institutionSignUpData.location, city: e.target.value}
                                })}
                                className="h-10 border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="inst-pincode" className="text-sm font-medium text-gray-700">Pincode</Label>
                              <Input
                                id="inst-pincode"
                                placeholder="400001"
                                value={institutionSignUpData.location.pincode}
                                onChange={(e) => setInstitutionSignUpData({
                                  ...institutionSignUpData, 
                                  location: {...institutionSignUpData.location, pincode: e.target.value}
                                })}
                                className="h-10 border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="inst-address" className="text-sm font-medium text-gray-700">Complete Address</Label>
                            <Input
                              id="inst-address"
                              placeholder="123 School Street, Area Name"
                              value={institutionSignUpData.location.address}
                              onChange={(e) => setInstitutionSignUpData({
                                ...institutionSignUpData, 
                                location: {...institutionSignUpData.location, address: e.target.value}
                              })}
                              className="h-10 border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl" 
                            onClick={handleInstitutionSignUp}
                            disabled={loading}
                          >
                            {loading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating Account...
                              </div>
                            ) : (
                              'Create Institution Account'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    
  );
};

export default AuthPage;
