import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, BookOpen, Trophy, Users, LogIn, UserPlus } from "lucide-react";
import heroImage from "@/assets/hero-students-safety.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">SafeEd</span>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-secondary to-accent text-white hover:shadow-lg flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Be Disaster 
                <span className="text-primary block">Ready!</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Learn. Prepare. Stay Safe.
              </p>
              <p className="text-lg text-muted-foreground">
                Interactive disaster preparedness education for students. 
                Build essential safety skills through engaging modules, quizzes, and real-world scenarios.
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Get Started Now
                <Shield className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white px-8 py-6 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Join as Institution
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <BookOpen className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">5</div>
                <div className="text-sm text-muted-foreground">Disaster Types</div>
              </div>
              <div className="text-center">
                <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Quiz Questions</div>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">1000+</div>
                <div className="text-sm text-muted-foreground">Students Trained</div>
              </div>
            </div>
          </div>

          <div className="animate-scale-in">
            <img 
              src={heroImage} 
              alt="Students learning disaster preparedness in classroom"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
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
          <p>&copy; 2024 SafeEd - Disaster Preparedness Education System</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;