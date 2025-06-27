import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
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
  Building2
} from "lucide-react";

interface NavigationItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  href: string;
  roles?: string[];
  badge?: string;
  color: string;
}

export default function NavigationBar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      subtitle: "Overview & Analytics",
      icon: Home,
      href: "/",
      color: "from-green-500 to-green-600"
    },
    {
      id: "users",
      title: "Users",
      subtitle: "Employee Management",
      icon: Users,
      href: "/users",
      roles: ["admin"],
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "interviews",
      title: "Employee Reviews",
      subtitle: "& Evaluations",
      icon: Calendar,
      href: "/interviews",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "todos",
      title: "Employee Affairs",
      subtitle: "Tasks & Management",
      icon: CheckSquare,
      href: "/todos",
      color: "from-orange-500 to-orange-600"
    },
    {
      id: "feedback",
      title: "Feedback",
      subtitle: "& Reviews",
      icon: MessageSquare,
      href: "/feedback",
      color: "from-pink-500 to-pink-600"
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
      roles: ["admin", "manager"],
      color: "from-indigo-500 to-indigo-600"
    },
    {
      id: "archive",
      title: "Archive",
      subtitle: "Historical Data",
      icon: Archive,
      href: "/archive",
      roles: ["admin", "manager"],
      color: "from-gray-500 to-gray-600"
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    setLocation(href);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo/Brand Section */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Navigation</h2>
            </div>
          </div>

          {/* Navigation Items */}
          <div 
            className="flex items-center space-x-1 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth touch-scroll"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onWheel={(e) => {
              e.currentTarget.scrollLeft += e.deltaY;
            }}
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
                  className={`
                    relative flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 group
                    ${isItemActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105` 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105'
                    }
                    ${isHovered ? 'shadow-md' : ''}
                  `}
                >
                  {/* Icon with animation */}
                  <div className={`
                    flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300
                    ${isItemActive 
                      ? 'bg-white/20 text-white' 
                      : `bg-gradient-to-r ${item.color} text-white opacity-80 group-hover:opacity-100`
                    }
                    ${isHovered ? 'scale-110 rotate-3' : ''}
                  `}>
                    <item.icon className="h-4 w-4" />
                  </div>

                  {/* Text content */}
                  <div className="hidden lg:flex flex-col items-start min-w-0">
                    <span className={`
                      text-xs font-medium truncate
                      ${isItemActive ? 'text-white' : 'text-gray-900 dark:text-white'}
                    `}>
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className={`
                        text-xs truncate
                        ${isItemActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}
                      `}>
                        {item.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 text-xs bg-white/20 text-white border-white/30"
                    >
                      {item.badge}
                    </Badge>
                  )}

                  {/* Active indicator */}
                  {isItemActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                  )}

                  {/* Hover arrow */}
                  {isHovered && !isItemActive && (
                    <ChevronRight className="h-3 w-3 text-gray-400 transition-all duration-300 animate-pulse" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* User role indicator */}
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className="hidden sm:flex text-xs px-2 py-1 bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
            >
              {user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} View` : 'Guest View'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Mobile scrollable navigation */}
      <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
        <div 
          className="flex items-center space-x-1 p-2 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth touch-scroll"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY;
          }}
        >
          {filteredItems.map((item) => {
            const isItemActive = isActive(item.href);
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.href)}
                className={`
                  flex-shrink-0 flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300
                  ${isItemActive 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-md` 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <div className={`
                  flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300
                  ${isItemActive 
                    ? 'bg-white/20 text-white' 
                    : `bg-gradient-to-r ${item.color} text-white opacity-80`
                  }
                `}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className={`
                  text-xs font-medium truncate max-w-16
                  ${isItemActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}
                `}>
                  {item.title.split(' ')[0]}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}