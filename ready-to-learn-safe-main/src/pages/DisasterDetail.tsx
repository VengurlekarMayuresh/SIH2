import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, Clock, Users, AlertTriangle, CheckCircle, BookOpen, Loader2, Play, FileText, ChevronRight, Calendar, Award } from "lucide-react";

// API Base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Types for the dynamic module data
interface Content {
  _id: string;
  type: 'text' | 'video' | 'image';
  body?: string;
  videoUrl?: string;
  imageUrl?: string;
}

interface Chapter {
  _id: string;
  title: string;
  contents: Content[];
}

interface Module {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  chapters: Chapter[];
}

// Content type icon mapping
const getContentIcon = (type: string) => {
  switch (type) {
    case 'video': return Play;
    case 'image': return FileText;
    case 'text':
    default: return FileText;
  }
};

// Extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Component for rendering YouTube videos
const YouTubeEmbed: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const videoId = getYouTubeVideoId(videoUrl);
  
  if (!videoId) {
    return (
      <div className="bg-muted p-3 rounded border">
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Watch Video
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

const DisasterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userType = localStorage.getItem('userType');
      setIsAuthenticated(!!token && userType === 'student');
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchModule = async () => {
      if (!id) {
        setError('Module ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('authToken');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'student') {
          setError('Please log in as a student to view module content.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/modules/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setModule(response.data);
      } catch (err: any) {
        console.error('Error fetching module:', err);
        if (err.response?.status === 404) {
          setError('Module not found. It may have been removed or the link is incorrect.');
        } else if (err.response?.status === 401) {
          setError('Please log in as a student to view this module.');
        } else {
          setError(err.response?.data?.message || 'Failed to load module. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [id]);

  const markModuleAsCompleted = async () => {
    if (!module || !isAuthenticated) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_BASE_URL}/student/progress`, {
        moduleId: module._id,
        completed: true
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success message (you could add a toast notification here)
      alert('Module marked as completed! 🎉');
    } catch (err) {
      console.error('Error marking module as completed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Loading Module...</h2>
            <p className="text-muted-foreground">Please wait while we fetch the module content.</p>
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
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Unable to Load Module</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate("/modules")}>Back to Modules</Button>
              {!isAuthenticated && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/auth")}
                >
                  Login as Student
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Module Not Found</h1>
            <Button onClick={() => navigate("/modules")}>Back to Modules</Button>
          </div>
        </main>
      </div>
    );
  }

  const currentChapter = module.chapters[selectedChapter] || module.chapters[0];
  const completedChapters = selectedChapter + 1;
  const progressPercentage = Math.round((completedChapters / module.chapters.length) * 100);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/modules")}
              className="border-white/20 text-white hover:bg-white/10 bg-white/10 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">{module.title}</h1>
          <p className="text-red-100 text-lg">{module.description}</p>
        </div>

        {/* Main Content Area */}
        <div className="flex">
          {/* Left Content Area */}
          <div className="flex-1 p-8">
            {/* Progress Bar */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
                <span className="text-sm text-gray-500">{completedChapters}/{module.chapters.length} Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{progressPercentage}% Complete</p>
            </div>

            {/* Current Chapter Content */}
            {currentChapter && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentChapter.title}</h2>
                      <p className="text-gray-600">Chapter {selectedChapter + 1} of {module.chapters.length}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {currentChapter.contents.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 italic">No content available for this chapter yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {currentChapter.contents.map((content, contentIndex) => (
                        <div key={content._id} className="">
                          {content.type === 'text' && content.body && (
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Points:</h4>
                              <div className="prose max-w-none">
                                {content.body.split('\n').map((paragraph, pIndex) => {
                                  if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('✓')) {
                                    return (
                                      <div key={pIndex} className="flex items-start gap-3 mb-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">
                                          {paragraph.replace(/^[•✓]\s*/, '')}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return (
                                    <p key={pIndex} className="text-gray-700 leading-relaxed mb-4">
                                      {paragraph}
                                    </p>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {content.type === 'video' && content.videoUrl && (
                            <div className="">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Video Tutorial:</h4>
                              <YouTubeEmbed videoUrl={content.videoUrl} />
                            </div>
                          )}
                          
                          {content.type === 'image' && content.imageUrl && (
                            <div className="">
                              <img 
                                src={content.imageUrl} 
                                alt="Module content" 
                                className="w-full h-auto rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedChapter(Math.max(0, selectedChapter - 1))}
                      disabled={selectedChapter === 0}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    
                    {selectedChapter === module.chapters.length - 1 ? (
                      <Button 
                        onClick={markModuleAsCompleted}
                        className="bg-red-600 hover:bg-red-700 text-white px-6"
                      >
                        Mark Complete
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setSelectedChapter(Math.min(module.chapters.length - 1, selectedChapter + 1))}
                        className="bg-red-600 hover:bg-red-700 text-white px-6"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - All Lessons */}
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">All Lessons</h3>
              
              <div className="space-y-3">
                {module.chapters.map((chapter, index) => (
                  <div
                    key={chapter._id}
                    onClick={() => setSelectedChapter(index)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedChapter === index
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index <= selectedChapter
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{chapter.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {chapter.contents.length} content{chapter.contents.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {index < selectedChapter && (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button 
                  onClick={() => navigate("/quiz")}
                  className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Take Quiz
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/resources")}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  View Resources
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DisasterDetail;