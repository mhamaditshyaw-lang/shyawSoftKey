import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Calendar,
  ListTodo,
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
  Building2, // Added Building2 icon
} from "lucide-react";

interface NavigationItem {
  kind?: 'header' | 'divider';
  segment?: string;
  title?: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  roles?: string[];
}

type Navigation = NavigationItem[];

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main Items',
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
    icon: <ListTodo className="w-5 h-5" />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Operations',
  },
  {
    segment: 'interviews',
    title: 'Employee Reviews',
    icon: <Calendar className="w-5 h-5" />,
    children: [
      {
        segment: 'interviews',
        title: 'Review Requests',
        icon: <Clock className="w-4 h-4" />,
      },
      {
        segment: 'archive',
        title: 'Completed Reviews',
        icon: <Archive className="w-4 h-4" />,
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    segment: 'data-view',
    title: 'Operational Data',
    icon: <Database className="w-5 h-5" />,
    children: [
      {
        segment: 'data-view',
        title: 'View Data',
        icon: <FileText className="w-4 h-4" />,
      },
      {
        segment: 'all-data',
        title: 'All Data Dashboard',
        icon: <Activity className="w-4 h-4" />,
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Analytics',
  },
  {
    segment: 'reports',
    title: 'Management Reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['admin', 'manager'],
    children: [
      {
        segment: 'reports',
        title: 'Dashboard Analytics',
        icon: <PieChart className="w-4 h-4" />,
      },
      {
        segment: 'metrics',
        title: 'Performance Metrics',
        icon: <TrendingUp className="w-4 h-4" />,
      },
    ],
  },
  {
    segment: 'user-activity',
    title: 'User Activity',
    icon: <Activity className="w-5 h-5" />,
    roles: ['admin', 'manager', 'office', 'office_team'],
  },
  {
    segment: 'feedback',
    title: 'Feedback & Reviews',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  // Department Management added here
  {
    segment: 'departments',
    title: 'Department Management',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['admin'],
  },
];

interface AnimatedSliderMenuProps {
  className?: string;
}

export default function AnimatedSliderMenu({ className }: AnimatedSliderMenuProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);

  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Enhanced scrolling with mouse wheel and keyboard support
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const element = e.currentTarget as HTMLElement;
      if (element && element.scrollHeight > element.clientHeight) {
        e.preventDefault();
        e.stopPropagation();
        element.scrollTop += e.deltaY * 2; // Optimized sensitivity
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown') {
        e.preventDefault();
        e.stopPropagation();
        const element = e.currentTarget as HTMLElement;
        const scrollAmount = e.key === 'ArrowUp' ? -40 : e.key === 'ArrowDown' ? 40 : e.key === 'PageUp' ? -200 : 200;
        element.scrollTo({
          top: element.scrollTop + scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    // Apply to both mobile and desktop scroll containers with retry logic
    const setupScrollHandlers = () => {
      const containers = [scrollContainerRef.current, desktopScrollRef.current].filter(Boolean);

      containers.forEach(scrollElement => {
        if (scrollElement) {
          scrollElement.addEventListener('wheel', handleWheel, { passive: false });
          scrollElement.addEventListener('keydown', handleKeyDown);
          scrollElement.setAttribute('tabindex', '0');
          scrollElement.style.outline = 'none';
        }
      });

      return containers;
    };

    // Initial setup
    let containers = setupScrollHandlers();

    // Retry setup after a short delay for elements that might load later
    const retryTimeout = setTimeout(() => {
      containers = setupScrollHandlers();
    }, 100);

    return () => {
      clearTimeout(retryTimeout);
      containers.forEach(scrollElement => {
        if (scrollElement) {
          scrollElement.removeEventListener('wheel', handleWheel);
          scrollElement.removeEventListener('keydown', handleKeyDown);
        }
      });
    };
  }, []);

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
        <div className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 mb-2">
          {item.title}
        </div>
      );
    }

    if (item.kind === 'divider') {
      return <div className="my-4 h-px bg-border" />;
    }

    if (!hasAccess(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = item.segment && expandedItems.includes(item.segment);
    const active = item.segment && isActive(item.segment);

    return (
      <div className="transform transition-all duration-300 hover:scale-105">
        {hasChildren ? (
          <button
            onClick={() => item.segment && toggleExpanded(item.segment)}
            className={cn(
              "w-full hr-nav-item",
              active && "active",
              isExpanded && "bg-indigo-50 text-indigo-700"
            )}
          >
            <div className="hr-nav-icon">
              {item.icon}
            </div>
            <span className="flex-1 text-left transition-all duration-200 group-hover:translate-x-1">{item.title}</span>
            <ChevronRight 
              className={cn(
                "w-4 h-4 transition-all duration-200",
                isExpanded ? "rotate-90 text-indigo-600" : "text-muted-foreground"
              )}
            />
          </button>
        ) : (
          <Link href={`/${item.segment}`}>
            <div className={cn(
              "hr-nav-item",
              active && "active"
            )}>
              <div className="hr-nav-icon">
                {item.icon}
              </div>
              <span className="transition-all duration-200 group-hover:translate-x-1">{item.title}</span>
            </div>
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="ml-6 mt-2 space-y-1 overflow-hidden">
            <div className="animate-in slide-in-from-top-2 duration-300">
              {item.children?.map((child, childIndex) => {
                if (!hasAccess(child)) return null;

                const childActive = child.segment && isActive(child.segment);

                return (
                  <Link key={childIndex} href={`/${child.segment}`}>
                    <div className={cn(
                      "flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-300 cursor-pointer group glass-button",
                      childActive
                        ? "bg-black/10 dark:bg-white/10 text-black dark:text-white border-l-4 border-black dark:border-white shadow-lg"
                        : "text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white hover:border-l-4 hover:border-black/30 dark:hover:border-white/30"
                    )}>
                      <div className={cn(
                        "transition-all duration-300 group-hover:scale-110",
                        childActive ? "text-black dark:text-white" : "text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white"
                      )}>
                        {child.icon}
                      </div>
                      <span className="transition-all duration-300 group-hover:translate-x-1">{child.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Menu Toggle Button - Fixed position */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-4 left-4 z-50 lg:hidden",
          "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md",
          "border-slate-200 dark:border-slate-700",
          "hover:bg-blue-50 dark:hover:bg-blue-900/20",
          "hover:border-blue-300 dark:hover:border-blue-600",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "hover:scale-105 active:scale-95",
          className
        )}
      >
        <Menu className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </Button>

      {/* Glass Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 dark:bg-white/10 backdrop-blur-lg z-40 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Glass Slider Menu */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-80 glass-card shadow-2xl z-50 lg:hidden",
        "border-r border-black/20 dark:border-white/20",
        "transform transition-all duration-500 ease-in-out",
        isOpen ? "translate-x-0 animate-slide-up" : "-translate-x-full"
      )}>
        {/* Glass Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/20 dark:border-white/20 glass-card">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-white dark:text-black" />
            </div>
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Navigation
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="glass-button hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 hover:scale-110 rounded-xl"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Glass Navigation Content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide scroll-smooth focus:outline-none p-4 hover:scrollbar-show"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
          }}
          title="Use mouse wheel or arrow keys to scroll"
        >
          <nav className="space-y-2">
            {NAVIGATION.map((item, index) => (
              <div 
                key={index} 
                className="animate-stagger"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {renderNavigationItem(item, index)}
              </div>
            ))}
          </nav>
        </div>

        {/* Glass Footer */}
        <div className="p-4 border-t border-black/20 dark:border-white/20 glass-card">
          <div className="text-xs text-black/70 dark:text-white/70 text-center font-medium">
            Office Management System
          </div>
        </div>
      </div>

      {/* Modern HR Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col overflow-hidden hr-sidebar">
          {/* Modern Header */}
          <div className="hr-card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">HR System</h2>
                <p className="text-indigo-100 text-sm">Management Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Content */}
          <div 
            ref={desktopScrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide scroll-smooth focus:outline-none hover:scrollbar-show p-4"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(99, 102, 241, 0.3) transparent'
            }}
            title="Use mouse wheel or arrow keys to scroll"
            tabIndex={0}
          >
            <nav className="space-y-1">
              {NAVIGATION.map((item, index) => (
                <div 
                  key={index} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {renderNavigationItem(item, index)}
                </div>
              ))}
            </nav>
          </div>

          {/* Modern Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground font-medium">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}