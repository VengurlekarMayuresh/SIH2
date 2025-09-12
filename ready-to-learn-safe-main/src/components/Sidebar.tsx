import { NavLink } from "react-router-dom";
import { Home, BookOpen, HelpCircle, FileText, TrendingUp, Shield, Cloud, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/modules", icon: BookOpen, label: "Disaster Modules" },
  { href: "/virtual-drills", icon: Zap, label: "Virtual Drills" },
  { href: "/quiz", icon: HelpCircle, label: "Quizzes" },
  { href: "/weather-safety", icon: Cloud, label: "Weather & Safety" },
  { href: "/resources", icon: FileText, label: "Resources" },
  { href: "/progress", icon: TrendingUp, label: "Progress" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
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
    </aside>
  );
};

export default Sidebar;