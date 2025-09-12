import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle, SimpleThemeToggle } from '@/components/theme-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Menu,
  X,
  Shield,
  Home,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Award,
  Users,
  Settings,
  LogOut,
  User,
  Bell,
  Search,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  description?: string;
}

interface ResponsiveNavbarProps {
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    type: 'student' | 'institution';
  };
  onLogout?: () => void;
  notifications?: number;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview of your progress'
  },
  {
    title: 'Modules',
    href: '/modules',
    icon: BookOpen,
    description: 'Learn about disasters'
  },
  {
    title: 'Quiz',
    href: '/quiz',
    icon: HelpCircle,
    description: 'Test your knowledge'
  },
  {
    title: 'Progress',
    href: '/progress',
    icon: TrendingUp,
    description: 'Track your learning'
  },
  {
    title: 'Badges',
    href: '/badges',
    icon: Award,
    description: 'Your achievements'
  },
  {
    title: 'Leaderboard',
    href: '/leaderboard',
    icon: Users,
    description: 'Compare with others'
  },
];

export function ResponsiveNavbar({ user, onLogout, notifications = 0 }: ResponsiveNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavigation = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => location.pathname === href;

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <Button
            key={item.href}
            variant={active ? 'default' : 'ghost'}
            className={`${mobile 
              ? 'w-full justify-start gap-3 px-4 py-3 h-auto' 
              : 'gap-2 px-3'
            } ${active 
              ? 'bg-primary text-primary-foreground shadow-md' 
              : 'text-muted-foreground hover:text-foreground'
            } transition-all duration-200`}
            onClick={() => handleNavigation(item.href)}
          >
            <Icon className={mobile ? 'h-5 w-5' : 'h-4 w-4'} />
            <span className={mobile ? 'text-base' : 'text-sm font-medium'}>
              {item.title}
            </span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        );
      })}
    </>
  );

  const UserMenu = ({ mobile = false }: { mobile?: boolean }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`${mobile ? 'w-full justify-start gap-3 px-4 py-3 h-auto' : 'gap-2 px-2'} hover:bg-accent`}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className={`flex flex-col ${mobile ? 'items-start' : 'items-start'} ${mobile ? '' : 'hidden sm:flex'}`}>
            <span className="text-sm font-medium truncate max-w-[120px]">
              {user?.name || 'User'}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {user?.type || 'Student'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 ml-auto opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="pb-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleNavigation('/profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onLogout} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isMobile) {
    return (
      <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-md shadow-md' 
          : 'bg-background/95 backdrop-blur-sm'
      }`}>
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-primary">SafeEd</span>
          </div>

          {/* Right side - Notifications, Theme, Menu */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle */}
            <SimpleThemeToggle />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-primary" />
                      <span className="text-lg font-bold text-primary">SafeEd</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* User Section */}
                  {user && (
                    <div className="p-4 border-b">
                      <UserMenu mobile />
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                      <NavItems mobile />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t">
                    <div className="text-center text-sm text-muted-foreground">
                      <p>SafeEd v2.0</p>
                      <p className="text-xs">Disaster Preparedness Education</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    );
  }

  // Desktop Navigation
  return (
    <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
      scrolled 
        ? 'bg-background/80 backdrop-blur-md shadow-md' 
        : 'bg-background/95 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">SafeEd</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavItems />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button variant="ghost" size="sm" className="gap-2 px-3">
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline text-sm">Search</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {user && <UserMenu />}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default ResponsiveNavbar;
