import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Calendar,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Archive,
  FileText,
  Database,
  Activity,
  PieChart,
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  Clock,
  BookOpen,
  Shield,
  Target,
  Settings,
  LogOut,
  Bell,
  TestTube
} from "lucide-react";

interface NavigationItem {
  kind?: 'header' | 'divider';
  segment?: string;
  title?: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  roles?: string[];
}

const NAVIGATION: NavigationItem[] = [
  {
    kind: 'header',
    title: 'Main Navigation',
  },
  {
    segment: '',
    title: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
  },
  {
    segment: 'users',
    title: 'Employee Management',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin', 'manager'],
  },
  {
    segment: 'todos',
    title: 'Task Management',
    icon: <CheckSquare className="w-5 h-5" />,
  },
  {
    segment: 'interviews',
    title: 'Employee Reviews',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Analytics & Reports',
  },
  {
    segment: 'reports',
    title: 'Management Reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['admin', 'manager'],
  },
  {
    segment: 'data-view',
    title: 'Data Analytics',
    icon: <Database className="w-5 h-5" />,
  },
  {
    segment: 'all-data',
    title: 'All Data Dashboard',
    icon: <Activity className="w-5 h-5" />,
    roles: ['admin', 'manager'],
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'System Management',
  },
  {
    segment: 'feedback',
    title: 'Feedback & Reviews',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    segment: 'archive',
    title: 'Archive Management',
    icon: <Archive className="w-5 h-5" />,
    roles: ['admin', 'manager'],
  },
  {
    segment: 'notification-test',
    title: 'Notification Test',
    icon: <Bell className="w-5 h-5" />,
  },
  {
    segment: 'notification-management',
    title: 'Notification Management',
    icon: <Settings className="w-5 h-5" />,
  },
];

interface SlidingSidebarMenuProps {
  className?: string;
}

export default function SlidingSidebarMenu({ className }: SlidingSidebarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggleExpanded = (segment: string) => {
    setExpandedItems(prev => 
      prev.includes(segment) 
        ? prev.filter(item => item !== segment)
        : [...prev, segment]
    );
  };

  const hasAccess = (item: NavigationItem) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  };

  const isActive = (segment: string) => {
    if (segment === '' && location === '/') return true;
    return location.startsWith(`/${segment}`);
  };

  const renderNavigationItem = (item: NavigationItem, index: number) => {
    if (item.kind === 'header') {
      return (
        <div key={index} className="px-4 py-3 mt-6 first:mt-0">
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider animate-fade-in">
            {item.title}
          </h3>
        </div>
      );
    }

    if (item.kind === 'divider') {
      return (
        <div key={index} className="my-4 mx-4">
          <div className="border-t border-gray-200 animate-fade-in" />
        </div>
      );
    }

    if (!hasAccess(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = item.segment && expandedItems.includes(item.segment);
    const active = item.segment && isActive(item.segment);

    return (
      <div key={index} className="nav-item-stagger nav-item" style={{ animationDelay: `${index * 0.05}s` }}>
        {hasChildren ? (
          <button
            onClick={() => item.segment && toggleExpanded(item.segment)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-300 group sidebar-item nav-item",
              active
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "transition-colors duration-200",
                active ? "text-white" : "text-indigo-500"
              )}>
                {item.icon}
              </div>
              <span className="font-medium">{item.title}</span>
            </div>
            <ChevronRight 
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isExpanded ? "rotate-90" : "",
                active ? "text-white" : "text-indigo-400"
              )}
            />
          </button>
        ) : (
          <Link href={`/${item.segment}`}>
            <div className={cn(
              "flex items-center space-x-3 px-4 py-3 transition-all duration-300 cursor-pointer group sidebar-item nav-item",
              active
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}>
              <div className={cn(
                "transition-colors duration-200",
                active ? "text-white" : "text-indigo-500"
              )}>
                {item.icon}
              </div>
              <span className="font-medium">{item.title}</span>
            </div>
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="ml-8 mt-2 space-y-1 animate-fade-in">
            {item.children?.map((child, childIndex) => {
              if (!hasAccess(child)) return null;
              
              const childActive = child.segment && isActive(child.segment);
              
              return (
                <Link key={childIndex} href={`/${child.segment}`}>
                  <div className={cn(
                    "flex items-center space-x-3 px-4 py-2 text-sm transition-all duration-300 cursor-pointer sidebar-item",
                    childActive
                      ? "bg-red-100 text-red-700 border-l-4 border-red-500"
                      : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                  )}>
                    <div className={cn(
                      "transition-colors duration-200",
                      childActive ? "text-red-600" : "text-red-400"
                    )}>
                      {child.icon}
                    </div>
                    <span>{child.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-4 left-4 z-50 p-2 bg-white border border-red-200 shadow-lg hover:bg-red-50 hamburger-btn",
          isOpen ? "active" : "",
          className
        )}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-red-600 menu-icon" />
        ) : (
          <Menu className="w-5 h-5 text-red-600 menu-icon" />
        )}
      </Button>

      {/* Dark Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl sliding-sidebar",
        isOpen ? "translate-x-0 sidebar-slide-in" : "-translate-x-full sidebar-slide-out"
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 pt-16">
          <div className="flex items-center space-x-3 animate-fade-in">
            <Shield className="w-8 h-8 animate-pulse-hover" />
            <div>
              <h2 className="text-xl font-bold">Administration Shyaw System</h2>
              <p className="text-red-100 text-sm">Professional Platform</p>
            </div>
          </div>
          
          {user && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-red-100 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto py-4 slide-menu-container">
          <nav className="space-y-1">
            {NAVIGATION.map(renderNavigationItem)}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-red-200 p-4">
          <div className="space-y-2">
            <Link href="/settings">
              <div className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-300 cursor-pointer sidebar-item">
                <Settings className="w-4 h-4 text-red-500" />
                <span className="text-sm">Settings</span>
              </div>
            </Link>
            
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-300 sidebar-item"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-red-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 font-medium">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}