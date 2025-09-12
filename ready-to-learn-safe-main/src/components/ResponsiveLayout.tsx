import { ReactNode, useState } from 'react';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import Sidebar from '@/components/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X, User, LogOut, Settings, Shield } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: ReactNode;
  title?: string;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    type: 'student' | 'institution';
  };
  onLogout?: () => void;
  notifications?: number;
  showNavbar?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl', 
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-none'
};

export function ResponsiveLayout({ 
  children, 
  title,
  user, 
  onLogout, 
  notifications = 0,
  showNavbar = true,
  maxWidth = 'xl',
  className = ''
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isMobile) {
    // Mobile layout: toggleable sidebar with hamburger button
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header with Hamburger */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-primary">SafeEd</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 z-50 h-full w-64">
              <Sidebar />
            </div>
          </>
        )}
        
        <main className={`p-4 ${className}`}>
          <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                  {title}
                </h1>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Desktop layout: show sidebar + main content (exactly like original)
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className={`flex-1 p-6 lg:p-8 ${className}`}>
        <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
          {title && (
            <div className="mb-6 lg:mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                {title}
              </h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

export default ResponsiveLayout;
