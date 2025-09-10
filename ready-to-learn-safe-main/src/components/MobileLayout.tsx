import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Home, 
  BookOpen, 
  Users, 
  TrendingUp, 
  HelpCircle, 
  Settings,
  Bell,
  Download,
  Wifi,
  WifiOff,
  Search,
  ArrowLeft,
  Share2,
  Bookmark,
  X
} from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  actions?: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  onBackClick,
  actions
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // PWA and network detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      setTimeout(() => setShowOfflineBanner(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for app updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
          setHasUpdates(true);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', badge: null },
    { icon: BookOpen, label: 'Modules', href: '/modules', badge: null },
    { icon: TrendingUp, label: 'Progress', href: '/progress', badge: null },
    { icon: Users, label: 'Community', href: '/community', badge: '12' },
    { icon: HelpCircle, label: 'Help', href: '/help', badge: null },
    { icon: Settings, label: 'Settings', href: '/settings', badge: null },
  ];

  const handleInstallPWA = () => {
    // PWA installation logic
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installed');
        }
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ready to Learn Safe',
          text: 'Check out this awesome safety training platform!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBackClick}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <MobileSidebar 
                    menuItems={menuItems} 
                    onClose={() => setSidebarOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            )}
            
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground truncate">
                {title}
              </h1>
              {!isOnline && <WifiOff className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Share */}
            <Button variant="ghost" size="sm" className="p-2" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Offline Banner */}
        {showOfflineBanner && (
          <div className="bg-orange-100 border-b border-orange-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-orange-800">
                <WifiOff className="h-4 w-4" />
                <span>You're offline. Content may be limited.</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-orange-800"
                onClick={() => setShowOfflineBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Update Available Banner */}
        {hasUpdates && (
          <div className="bg-blue-100 border-b border-blue-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Download className="h-4 w-4" />
                <span>New version available!</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-800 text-xs"
                  onClick={() => window.location.reload()}
                >
                  Update
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-blue-800"
                  onClick={() => setHasUpdates(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          {menuItems.slice(0, 5).map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2 px-1 relative"
              onClick={() => window.location.href = item.href}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs truncate">{item.label}</span>
              {item.badge && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </nav>

      {/* PWA Install Prompt */}
      <PWAInstallBanner onInstall={handleInstallPWA} />
    </div>
  );
};

interface MobileSidebarProps {
  menuItems: Array<{
    icon: any;
    label: string;
    href: string;
    badge: string | null;
  }>;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ menuItems, onClose }) => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Sidebar Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Safety Learning</h2>
            <p className="text-sm text-muted-foreground">Stay prepared, stay safe</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start gap-3 relative"
            onClick={() => {
              window.location.href = item.href;
              onClose();
            }}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
            {item.badge && (
              <Badge className="ml-auto h-5 px-2 text-xs">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>Ready to Learn Safe v2.0</p>
          <p className="text-xs mt-1">Making safety accessible everywhere</p>
        </div>
      </div>
    </div>
  );
};

interface PWAInstallBannerProps {
  onInstall: () => void;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onInstall }) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Hide banner if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40">
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">Install App</h4>
              <p className="text-xs text-muted-foreground">
                Install for offline access and faster loading
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowBanner(false)}>
                Later
              </Button>
              <Button size="sm" onClick={onInstall}>
                Install
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Higher-order component for mobile responsiveness
export const withMobileLayout = (WrappedComponent: React.ComponentType<any>) => {
  return function MobileLayoutWrapper(props: any) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
      return (
        <MobileLayout 
          title={props.title || 'Safety Learning'}
          showBackButton={props.showBackButton}
          onBackClick={props.onBackClick}
          actions={props.actions}
        >
          <WrappedComponent {...props} />
        </MobileLayout>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default MobileLayout;
