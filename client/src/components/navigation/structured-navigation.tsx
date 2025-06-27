import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
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
  ChevronDown,
  ChevronRight,
  User,
  Activity,
  Settings,
  PieChart,
  TrendingUp,
  Clock,
  BookOpen,
  Shield,
  Target
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
    icon: <CheckSquare className="w-5 h-5" />,
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
    segment: 'feedback',
    title: 'Feedback & Reviews',
    icon: <MessageSquare className="w-5 h-5" />,
  },
];

interface StructuredNavigationProps {
  className?: string;
}

export default function StructuredNavigation({ className }: StructuredNavigationProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Enhanced scrolling with mouse wheel and keyboard support
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const element = e.currentTarget as HTMLElement;
      if (element.scrollHeight > element.clientHeight) {
        e.preventDefault();
        element.scrollTop += e.deltaY;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown') {
        e.preventDefault();
        const element = e.currentTarget as HTMLElement;
        const scrollAmount = e.key === 'ArrowUp' ? -40 : e.key === 'ArrowDown' ? 40 : e.key === 'PageUp' ? -200 : 200;
        element.scrollTo({
          top: element.scrollTop + scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    const scrollElement = scrollContainerRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('wheel', handleWheel, { passive: false });
      scrollElement.addEventListener('keydown', handleKeyDown);
      scrollElement.setAttribute('tabindex', '0');
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('wheel', handleWheel);
        scrollElement.removeEventListener('keydown', handleKeyDown);
      }
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
        <div key={index} className="px-3 py-2 mt-4 first:mt-0">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {item.title}
          </h3>
        </div>
      );
    }

    if (item.kind === 'divider') {
      return (
        <div key={index} className="my-3">
          <div className="border-t border-gray-200 dark:border-gray-700" />
        </div>
      );
    }

    if (!hasAccess(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = item.segment && expandedItems.includes(item.segment);
    const active = item.segment && isActive(item.segment);

    return (
      <div key={index}>
        {hasChildren ? (
          <button
            onClick={() => item.segment && toggleExpanded(item.segment)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
              active
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "transition-colors duration-200",
                active ? "text-white" : "text-gray-500 dark:text-gray-400"
              )}>
                {item.icon}
              </div>
              <span>{item.title}</span>
            </div>
            <div className={cn(
              "transition-transform duration-200",
              isExpanded ? "rotate-90" : ""
            )}>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        ) : (
          <Link href={`/${item.segment}`}>
            <div className={cn(
              "flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer",
              active
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
            )}>
              <div className={cn(
                "transition-colors duration-200",
                active ? "text-white" : "text-slate-500 dark:text-slate-400"
              )}>
                {item.icon}
              </div>
              <span>{item.title}</span>
            </div>
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="ml-4 mt-2 space-y-1">
            {item.children?.map((child, childIndex) => {
              if (!hasAccess(child)) return null;
              
              const childActive = child.segment && isActive(child.segment);
              
              return (
                <Link key={childIndex} href={`/${child.segment}`}>
                  <div className={cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer",
                    childActive
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400"
                  )}>
                    <div className={cn(
                      "transition-colors duration-200",
                      childActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
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
    <nav 
      ref={scrollContainerRef}
      className={cn(
        "space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide scroll-smooth focus:outline-none h-full",
        "hover:scrollbar-show transition-all duration-300",
        className
      )}
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
      }}
      title="Use mouse wheel or arrow keys to scroll"
    >
      <div className="pb-4">
        {NAVIGATION.map(renderNavigationItem)}
      </div>
    </nav>
  );
}