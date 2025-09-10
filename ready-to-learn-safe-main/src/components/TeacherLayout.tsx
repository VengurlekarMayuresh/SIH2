import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TeacherLayoutProps {
  children: ReactNode;
}

const TeacherLayout = ({ children }: TeacherLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Teacher Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <span className="text-2xl font-bold text-primary">SafeEd</span>
                <span className="ml-2 text-sm text-muted-foreground bg-secondary/20 px-2 py-1 rounded-full">
                  Teacher Portal
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default TeacherLayout;