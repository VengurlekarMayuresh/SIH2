import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Zap, Waves, Flame, Wind, Shield, BookOpen, Loader2, Users, ArrowRight, ArrowLeft, Filter, Search, Grid, List } from "lucide-react";

// API Base URL (using vite proxy)
const API_BASE_URL = '/api';

// Types
interface Module {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  chapters?: any[];
}

// Icon mapping for different disaster types
const getModuleIcon = (title: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('earthquake')) return Zap;
  if (titleLower.includes('flood')) return Waves;
  if (titleLower.includes('fire')) return Flame;
  if (titleLower.includes('cyclone') || titleLower.includes('storm')) return Wind;
  if (titleLower.includes('pandemic') || titleLower.includes('health')) return Shield;
  return BookOpen; // Default icon
};

// Color mapping for different disaster types
const getModuleColor = (title: string, index: number) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('earthquake')) return { color: "blue", bgClass: "bg-blue-100", textClass: "text-blue-600" };
  if (titleLower.includes('flood')) return { color: "cyan", bgClass: "bg-cyan-100", textClass: "text-cyan-600" };
  if (titleLower.includes('fire')) return { color: "red", bgClass: "bg-red-100", textClass: "text-red-600" };
  if (titleLower.includes('cyclone')) return { color: "purple", bgClass: "bg-purple-100", textClass: "text-purple-600" };
  if (titleLower.includes('pandemic')) return { color: "green", bgClass: "bg-green-100", textClass: "text-green-600" };
  
  // Cycle through colors for other modules
  const colors = [
    { color: "blue", bgClass: "bg-blue-100", textClass: "text-blue-600" },
    { color: "orange", bgClass: "bg-orange-100", textClass: "text-orange-600" },
    { color: "purple", bgClass: "bg-purple-100", textClass: "text-purple-600" }
  ];
  return colors[index % colors.length];
};

const DisasterModules = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user data for navbar
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem('userData') || '{}');
    } catch {
      return {};
    }
  })();
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    navigate('/');
  };

  // Fetch modules on component mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch modules (public endpoint)
        console.log('Fetching modules from:', `${API_BASE_URL}/modules`);
        const modulesResponse = await axios.get(`${API_BASE_URL}/modules`);
        console.log('Modules fetched successfully:', modulesResponse.data);
        setModules(modulesResponse.data);
        
        // Try to fetch user progress if authenticated
        const token = localStorage.getItem('authToken');
        const userType = localStorage.getItem('userType');
        
        if (token && userType === 'student') {
          try {
            const progressResponse = await axios.get(`${API_BASE_URL}/student/progress`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            setUserProgress(progressResponse.data);
          } catch (progressError) {
            // Progress fetch failed, continue without progress data
            console.log('Could not fetch progress:', progressError);
          }
        }
        
      } catch (err: any) {
        console.error('Error fetching modules:', err);
        console.error('API URL:', `${API_BASE_URL}/modules`);
        console.error('Error details:', err.response);
        setError(err.response?.data?.message || 'Failed to load modules. Please try again.');
      } finally {
        console.log('Finished loading, modules count:', modules.length);
        setLoading(false);
      }
    };
    
    fetchModules();
  }, []);

  // Check if a module is completed
  const isModuleCompleted = (moduleId: string) => {
    return userProgress.some(progress => progress.module._id === moduleId && progress.completed);
  };

  if (loading) {
    return (
      <ResponsiveLayout 
        user={userData?.name ? {
          name: userData.name,
          email: userData.email,
          type: 'student'
        } : undefined}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Loading Modules...</h2>
            <p className="text-muted-foreground text-sm md:text-base">Please wait while we fetch the latest disaster safety modules.</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout 
        user={userData?.name ? {
          name: userData.name,
          email: userData.email,
          type: 'student'
        } : undefined}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Unable to Load Modules</h2>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      title="Disaster Modules"
      user={userData?.name ? {
        name: userData.name,
        email: userData.email,
        type: 'student'
      } : undefined}
      onLogout={handleLogout}
      maxWidth="2xl"
    >
      <div className="mb-6 md:mb-8">
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
          Choose a disaster type to learn about safety measures and preparedness
          {modules.length > 0 && (
            <span className="block sm:inline">
              <span className="hidden sm:inline"> • </span>
              <span className="sm:hidden"><br /></span>
              {modules.length} modules available
            </span>
          )}
        </p>
      </div>

          {modules.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">No Modules Available</h3>
              <p className="text-sm md:text-base text-muted-foreground px-4">Disaster safety modules will appear here once they are created.</p>
            </div>
          ) : (
            <>
              {/* Enhanced Module Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {modules.map((module, index) => {
                  const IconComponent = getModuleIcon(module.title);
                  const moduleColor = getModuleColor(module.title, index);
                  const isCompleted = isModuleCompleted(module._id);
                  
                  // Get completion stats
                  const completedCount = userProgress.filter(p => p.module._id === module._id && p.completed).length;
                  const totalChapters = module.chapters?.length || 0;
                  const difficultyLevel = totalChapters > 8 ? 'HIGH' : totalChapters > 5 ? 'MEDIUM' : 'LOW';
                  const difficultyColor = difficultyLevel === 'HIGH' ? 'bg-red-500' : difficultyLevel === 'MEDIUM' ? 'bg-orange-500' : 'bg-green-500';
                  
                  return (
                    <div
                      key={module._id}
                      className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-2 active:scale-95"
                      onClick={() => navigate(`/modules/${module._id}`)}
                    >
                      <Card className="h-full bg-card backdrop-blur-sm border rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        {/* Module Image with Difficulty Badge */}
                        <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                          <img 
                            src={module.thumbnail} 
                            alt={module.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // Fallback based on module type
                              const titleLower = module.title.toLowerCase();
                              if (titleLower.includes('fire')) {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
                              } else if (titleLower.includes('earthquake')) {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop';
                              } else if (titleLower.includes('flood')) {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop';
                              } else if (titleLower.includes('cyclone')) {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1527482797697-8795b05a13da?w=400&h=300&fit=crop';
                              } else {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&h=300&fit=crop';
                              }
                            }}
                          />
                          
                          {/* Difficulty Badge */}
                          <div className={`absolute top-2 md:top-3 right-2 md:right-3 px-2 py-1 rounded-full text-white text-xs font-bold ${difficultyColor}`}>
                            {difficultyLevel}
                          </div>
                          
                          {/* Completion Badge */}
                          {isCompleted && (
                            <div className="absolute top-2 md:top-3 left-2 md:left-3 w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs md:text-sm font-bold">✓</span>
                            </div>
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        
                        {/* Card Content */}
                        <CardContent className="p-4 md:p-6">
                          <CardTitle className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3 group-hover:text-primary transition-colors">
                            {module.title}
                          </CardTitle>
                          
                          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                            {module.description}
                          </p>
                          
                          {/* Stats Row */}
                          <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="truncate">{completedCount > 0 ? `${completedCount} completed` : '0 completed'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                              <span>{totalChapters} lessons</span>
                            </div>
                          </div>
                          
                          {/* Learn More Button */}
                          <div className="flex items-center justify-between">
                            <span className={`text-xs md:text-sm font-medium ${
                              isCompleted ? 'text-green-600' : 'text-primary'
                            }`}>
                              {isCompleted ? 'Completed' : 'Start Learning'}
                            </span>
                            <div className="flex items-center gap-1 md:gap-2 text-foreground font-medium group-hover:text-primary transition-colors">
                              <span className="text-xs md:text-sm">Learn More</span>
                              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Progress Overview */}
              <Card className="mt-8 md:mt-12">
                <CardHeader className="pb-4 md:pb-6">
                  <CardTitle className="text-lg md:text-xl lg:text-2xl font-semibold">Your Learning Progress</CardTitle>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {userProgress.length > 0 
                      ? `${userProgress.filter(p => p.completed).length} of ${modules.length} modules completed`
                      : 'Track your progress by logging in as a student'
                    }
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {modules.slice(0, 6).map((module, index) => {
                      const IconComponent = getModuleIcon(module.title);
                      const moduleColor = getModuleColor(module.title, index);
                      const isCompleted = isModuleCompleted(module._id);
                      
                      return (
                        <div key={module._id} className="text-center">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            isCompleted 
                              ? `bg-green-500 text-white` 
                              : `${moduleColor.bgClass} ${moduleColor.textClass}`
                          }`}>
                            <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          <p className="text-xs md:text-sm font-medium truncate" title={module.title}>
                            {module.title.length > 10 ? module.title.substring(0, 10) + '...' : module.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isCompleted ? "Completed" : "Not Started"}
                          </p>
                        </div>
                      );
                    })}
                    {modules.length > 6 && (
                      <div className="text-center">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-muted text-muted-foreground">
                          <span className="text-xs md:text-sm font-bold">+{modules.length - 6}</span>
                        </div>
                        <p className="text-xs md:text-sm font-medium">More</p>
                        <p className="text-xs text-muted-foreground">Modules</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
    </ResponsiveLayout>
  );
};

export default DisasterModules;