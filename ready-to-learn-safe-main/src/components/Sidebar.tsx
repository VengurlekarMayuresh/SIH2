import { NavLink } from "react-router-dom";
import { Home, BookOpen, HelpCircle, FileText, TrendingUp, Shield, Cloud, Zap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/modules", icon: BookOpen, label: "Disaster Modules" },
  { href: "/virtual-drills", icon: Zap, label: "Virtual Drills" },
  { href: "/quiz", icon: HelpCircle, label: "Quizzes" },
  { href: "/weather-safety", icon: Cloud, label: "Weather & Safety" },
  { href: "/resources", icon: FileText, label: "Resources" },
  { href: "/progress", icon: TrendingUp, label: "Progress" },
];

interface SidebarProps {
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">SafeEd</span>
        </div>
        
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-hover",
                  isActive && "bg-primary text-primary-foreground font-medium hover:bg-primary hover:text-primary-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Logout Button at the bottom */}
      {onLogout && (
        <div className="p-6 border-t border-border">
          <Button 
            variant="destructive" 
            className="w-full justify-start bg-red-600 hover:bg-red-700 text-white" 
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;