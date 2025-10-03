import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { PAGE_PERMISSIONS } from "@shared/schema";
import { 
  Home, 
  Users, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  BarChart3, 
  Archive, 
  Database,
  FileText,
  ChevronRight,
  Building2,
  Bell
} from "lucide-react";

interface NavigationItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  href: string;
  badge?: string;
  color: string;
}

export default function NavigationBar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = user?.role === 'admin';
  
  const hasPermission = (href: string): boolean => {
    if (isAdmin) return true;
    
    const permissionKey = PAGE_PERMISSIONS[href as keyof typeof PAGE_PERMISSIONS];
    if (!permissionKey) return false;
    
    const permissions = user?.permissions as Record<string, boolean> | undefined;
    return permissions?.[permissionKey] === true;
  };

  // Enhanced wheel scrolling with proper event handling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const scrollAmount = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const element = e.currentTarget as HTMLElement;
      element.scrollLeft += scrollAmount * 3; // Increased sensitivity
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const element = e.currentTarget as HTMLElement;
        const scrollAmount = e.key === 'ArrowLeft' ? -100 : 100;
        element.scrollTo({
          left: element.scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    const desktopElement = desktopScrollRef.current;
    const mobileElement = mobileScrollRef.current;

    if (desktopElement) {
      desktopElement.addEventListener('wheel', handleWheel, { passive: false });
      desktopElement.addEventListener('keydown', handleKeyDown);
      desktopElement.setAttribute('tabindex', '0');
    }
    if (mobileElement) {
      mobileElement.addEventListener('wheel', handleWheel, { passive: false });
      mobileElement.addEventListener('keydown', handleKeyDown);
      mobileElement.setAttribute('tabindex', '0');
    }

    return () => {
      if (desktopElement) {
        desktopElement.removeEventListener('wheel', handleWheel);
        desktopElement.removeEventListener('keydown', handleKeyDown);
      }
      if (mobileElement) {
        mobileElement.removeEventListener('wheel', handleWheel);
        mobileElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      subtitle: "Overview",
      icon: Home,
      href: "/",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "interviews",
      title: "Employee Reviews",
      subtitle: "Evaluations",
      icon: Calendar,
      href: "/interviews",
      color: "from-green-500 to-green-600"
    },
    {
      id: "todos",
      title: "Daily Tasks",
      subtitle: "Management",
      icon: CheckSquare,
      href: "/todos",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "reminders",
      title: "Reminders",
      subtitle: "Alerts",
      icon: Bell,
      href: "/reminders",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      id: "feedback",
      title: "Feedback",
      subtitle: "Reviews",
      icon: MessageSquare,
      href: "/feedback",
      color: "from-orange-500 to-orange-600"
    },
    {
      id: "metrics",
      title: "Employee Tracking",
      subtitle: "Data Entry",
      icon: BarChart3,
      href: "/metrics",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      id: "users",
      title: "Employee Management",
      subtitle: "Administration",
      icon: Users,
      href: "/users",
      color: "from-red-500 to-red-600"
    },
    {
      id: "data-view",
      title: "Employee Tracking",
      subtitle: "Data View",
      icon: Database,
      href: "/data-view",
      color: "from-teal-500 to-teal-600"
    },
    {
      id: "reports",
      title: "Management Reports",
      subtitle: "Analytics",
      icon: BarChart3,
      href: "/reports",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      id: "archive",
      title: "Archive",
      subtitle: "Historical Data",
      icon: Archive,
      href: "/archive",
      color: "from-gray-500 to-gray-600"
    }
  ];

  const filteredItems = navigationItems.filter(item => hasPermission(item.href));

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    setLocation(href);
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo/Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Building2 className="h-5 w-5 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Quick Access
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Navigate efficiently</p>
            </div>
          </div>

          {/* Enhanced Navigation Items */}
          <div className="relative flex-1 mx-4">
            <div 
              ref={desktopScrollRef}
              className="flex items-center space-x-2 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth touch-scroll focus:outline-none py-2"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              title="Use mouse wheel or arrow keys to scroll horizontally"
            >
              {filteredItems.map((item) => {
                const isItemActive = isActive(item.href);
                const isHovered = hoveredItem === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => handleNavigation(item.href)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    data-testid={`nav-${item.id}`}
                    className={`
                      relative flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all duration-300 group min-w-fit
                      ${isItemActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-purple-500/25 scale-105 border border-white/20` 
                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:scale-102 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                      }
                      ${isHovered ? 'shadow-lg' : 'shadow-sm'}
                    `}
                  >
                    {/* Enhanced Icon with glassmorphism */}
                    <div className={`
                      relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300
                      ${isItemActive 
                        ? 'bg-white/20 text-white backdrop-blur-sm' 
                        : `bg-gradient-to-br ${item.color} text-white opacity-90 group-hover:opacity-100 shadow-sm`
                      }
                      ${isHovered ? 'scale-110 rotate-6 shadow-md' : ''}
                    `}>
                      <item.icon className="h-4 w-4" />
                      {isItemActive && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
                      )}
                    </div>

                    {/* Enhanced Text content */}
                    <div className="hidden lg:flex flex-col items-start min-w-0">
                      <span className={`
                        text-sm font-semibold truncate
                        ${isItemActive ? 'text-white' : 'text-gray-900 dark:text-white'}
                      `}>
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className={`
                          text-xs opacity-75 truncate
                          ${isItemActive ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}
                        `}>
                          {item.subtitle}
                        </span>
                      )}
                    </div>

                    {/* Enhanced Badge */}
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 text-xs px-2 py-1 rounded-full ${
                          isItemActive 
                            ? 'bg-white/20 text-white border-white/30 backdrop-blur-sm' 
                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {/* Enhanced Active indicator */}
                    {isItemActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg" />
                    )}

                    {/* Enhanced Hover effect */}
                    {isHovered && !isItemActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl animate-pulse" />
                    )}
                  </Button>
                );
              })}
            </div>
            
            {/* Gradient fade edges for better UX */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
          </div>

          {/* Enhanced User role indicator */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <Badge 
                variant="outline" 
                className="text-xs px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-medium rounded-full shadow-sm"
              >
                {user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} Access` : 'Guest Mode'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile scrollable navigation */}
      <div className="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
        <div 
          ref={mobileScrollRef}
          className="flex items-center space-x-2 p-3 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth touch-scroll focus:outline-none"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          title="Swipe to scroll horizontally"
        >
          {filteredItems.map((item) => {
            const isItemActive = isActive(item.href);
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.href)}
                data-testid={`mobile-nav-${item.id}`}
                className={`
                  flex-shrink-0 flex flex-col items-center space-y-2 p-3 rounded-2xl transition-all duration-300 min-w-fit
                  ${isItemActive 
                    ? `bg-gradient-to-br ${item.color} text-white shadow-lg shadow-purple-500/20 scale-105 border border-white/20` 
                    : 'hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-105 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 backdrop-blur-sm'
                  }
                `}
              >
                <div className={`
                  relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 shadow-sm
                  ${isItemActive 
                    ? 'bg-white/20 text-white backdrop-blur-sm' 
                    : `bg-gradient-to-br ${item.color} text-white opacity-90`
                  }
                `}>
                  <item.icon className="h-4 w-4" />
                  {isItemActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
                  )}
                </div>
                <span className={`
                  text-xs font-semibold truncate max-w-20
                  ${isItemActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}
                `}>
                  {item.title.split(' ')[0]}
                </span>
                {isItemActive && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}