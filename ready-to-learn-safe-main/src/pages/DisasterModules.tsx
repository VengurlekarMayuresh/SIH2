import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { Zap, Waves, Flame, Wind, Shield, BookOpen, Loader2, Users, ArrowLeft } from "lucide-react";

// API Base URL
const API_BASE_URL = 'http://localhost:5001/api';

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
  if (titleLower.includes('earthquake')) return { color: "primary", gradient: "from-primary/20 to-primary/5" };
  if (titleLower.includes('flood')) return { color: "accent", gradient: "from-accent/20 to-accent/5" };
  if (titleLower.includes('fire')) return { color: "secondary", gradient: "from-secondary/20 to-secondary/5" };
  if (titleLower.includes('cyclone')) return { color: "primary", gradient: "from-primary/20 to-primary/5" };
  if (titleLower.includes('pandemic')) return { color: "accent", gradient: "from-accent/20 to-accent/5" };
  
  // Cycle through colors for other modules
  const colors = [
    { color: "primary", gradient: "from-primary/20 to-primary/5" },
    { color: "secondary", gradient: "from-secondary/20 to-secondary/5" },
    { color: "accent", gradient: "from-accent/20 to-accent/5" }
  ];
  return colors[index % colors.length];
};

const DisasterModules = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userProgress, setUserProgress] = useState<any[]>([]);

  // Fetch modules on component mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch modules (public endpoint)
        const modulesResponse = await axios.get(`${API_BASE_URL}/modules`);
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
        setError(err.response?.data?.message || 'Failed to load modules. Please try again.');
      } finally {
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
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Loading Modules...</h2>
            <p className="text-muted-foreground">Please wait while we fetch the latest disaster safety modules.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Unable to Load Modules</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Disaster Modules</h1>
            <p className="text-xl text-muted-foreground">
              Choose a disaster type to learn about safety measures and preparedness
              {modules.length > 0 && ` • ${modules.length} modules available`}
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Modules Available</h3>
              <p className="text-muted-foreground">Disaster safety modules will appear here once they are created.</p>
            </div>
          ) : (
            <>
              {/* Enhanced Module Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="group cursor-pointer transition-all duration-300 hover:-translate-y-2"
                      onClick={() => navigate(`/modules/${module._id}`)}
                    >
                      <Card className="h-full bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        {/* Module Image with Difficulty Badge */}
                        <div className="relative h-48 overflow-hidden">
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
                          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-white text-xs font-bold ${difficultyColor}`}>
                            {difficultyLevel}
                          </div>
                          
                          {/* Completion Badge */}
                          {isCompleted && (
                            <div className="absolute top-3 left-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">✓</span>
                            </div>
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        
                        {/* Card Content */}
                        <CardContent className="p-6">
                          <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {module.title}
                          </CardTitle>
                          
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                            {module.description}
                          </p>
                          
                          {/* Stats Row */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{completedCount > 0 ? `${completedCount} completed` : '0 completed'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{totalChapters} lessons</span>
                            </div>
                          </div>
                          
                          {/* Learn More Button */}
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${
                              isCompleted ? 'text-green-600' : 'text-blue-600'
                            }`}>
                              {isCompleted ? 'Completed' : 'Start Learning'}
                            </span>
                            <div className="flex items-center gap-2 text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                              <span>Learn More</span>
                              <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Progress Overview */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Your Learning Progress</CardTitle>
                  <p className="text-muted-foreground">
                    {userProgress.length > 0 
                      ? `${userProgress.filter(p => p.completed).length} of ${modules.length} modules completed`
                      : 'Track your progress by logging in as a student'
                    }
                  </p>
                </CardHeader>
                <CardContent>
                  <div className={`grid ${modules.length > 5 ? 'md:grid-cols-4 lg:grid-cols-6' : `md:grid-cols-${modules.length}`} gap-4`}>
                    {modules.slice(0, 6).map((module, index) => {
                      const IconComponent = getModuleIcon(module.title);
                      const moduleColor = getModuleColor(module.title, index);
                      const isCompleted = isModuleCompleted(module._id);
                      
                      return (
                        <div key={module._id} className="text-center">
                          <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            isCompleted 
                              ? `bg-green-500 text-white` 
                              : `bg-${moduleColor.color}/10 text-${moduleColor.color}`
                          }`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium truncate" title={module.title}>
                            {module.title.length > 12 ? module.title.substring(0, 12) + '...' : module.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isCompleted ? "Completed" : "Not Started"}
                          </p>
                        </div>
                      );
                    })}
                    {modules.length > 6 && (
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-muted text-muted-foreground">
                          <span className="text-sm font-bold">+{modules.length - 6}</span>
                        </div>
                        <p className="text-sm font-medium">More</p>
                        <p className="text-xs text-muted-foreground">Modules</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DisasterModules;