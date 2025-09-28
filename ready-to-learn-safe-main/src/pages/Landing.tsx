import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Shield, BookOpen, Trophy, Users, LogIn, UserPlus, Star, ArrowRight, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-students-safety.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              <span className="text-xl md:text-2xl font-bold text-primary">Raksha Setu</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />
              {!isMobile && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/auth")}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate("/auth")}
                    className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Button>
                </>
              )}
              {isMobile && (
                <Button 
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg gap-1 px-3"
                >
                  <UserPlus className="h-4 w-4" />
                  Join
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-6 lg:space-y-8 animate-fade-in text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Star className="h-4 w-4 mr-2" />
                Trusted by 1000+ students
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Be Disaster{' '}
                <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Ready!
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
                Learn. Prepare. Stay Safe.
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                Interactive disaster preparedness education for students. 
                Build essential safety skills through engaging modules, quizzes, and real-world scenarios.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size={isMobile ? "default" : "lg"}
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              {!isMobile && (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Join as Institution
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 pt-6 lg:pt-8">
              <div className="text-center">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-secondary mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-bold text-foreground">5</div>
                <div className="text-xs md:text-sm text-muted-foreground">Disaster Types</div>
              </div>
              <div className="text-center">
                <Trophy className="h-6 w-6 md:h-8 md:w-8 text-accent mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-bold text-foreground">50+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Quiz Questions</div>
              </div>
              <div className="text-center">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-bold text-foreground">1000+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Students Trained</div>
              </div>
            </div>
          </div>

          <div className="animate-scale-in order-first lg:order-last">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Students learning disaster preparedness in classroom"
                className="w-full h-auto rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-2xl opacity-20 -z-10"></div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">Interactive Learning</h3>
            <p className="text-muted-foreground">
              Engaging modules covering earthquakes, floods, fires, cyclones, and pandemics with visual guides and videos.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">Gamified Quizzes</h3>
            <p className="text-muted-foreground">
              Test your knowledge with fun quizzes, earn badges, and track your progress as you become disaster-ready.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">Emergency Resources</h3>
            <p className="text-muted-foreground">
              Access emergency contacts, downloadable checklists, and official safety resources all in one place.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-border">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Raksha Setu - Disaster Preparedness Education System</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;