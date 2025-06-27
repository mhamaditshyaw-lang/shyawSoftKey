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

interface AnimatedSliderMenuProps {
  className?: string;
}

export default function AnimatedSliderMenu({ className }: AnimatedSliderMenuProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

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
        <div key={index} className="px-3 py-3 mt-6 first:mt-0">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {item.title}
          </h3>
        </div>
      );
    }

    if (item.kind === 'divider') {
      return (
        <div key={index} className="my-4">
          <div className="border-t border-slate-200 dark:border-slate-700" />
        </div>
      );
    }

    if (!hasAccess(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = item.segment && expandedItems.includes(item.segment);
    const active = item.segment && isActive(item.segment);

    return (
      <div key={index} className="transform transition-all duration-200 hover:scale-105">
        {hasChildren ? (
          <button
            onClick={() => item.segment && toggleExpanded(item.segment)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group",
              active
                ? "bg-gradient-to-r from-black to-gray-800 text-white shadow-lg shadow-gray-400/20 dark:shadow-gray-900/40"
                : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-black dark:hover:text-gray-200"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "transition-all duration-300 group-hover:rotate-12 group-hover:scale-110",
                active ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-blue-500"
              )}>
                {item.icon}
              </div>
              <span className="transition-all duration-300 group-hover:translate-x-1">{item.title}</span>
            </div>
            <div className={cn(
              "transition-all duration-300",
              isExpanded ? "rotate-90 text-black dark:text-gray-200" : "group-hover:translate-x-1"
            )}>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        ) : (
          <Link href={`/${item.segment}`}>
            <div className={cn(
              "flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer group",
              active
                ? "bg-gradient-to-r from-black to-gray-800 text-white shadow-lg shadow-gray-400/20 dark:shadow-gray-900/40"
                : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-black dark:hover:text-gray-200"
            )}>
              <div className={cn(
                "transition-all duration-300 group-hover:rotate-12 group-hover:scale-110",
                active ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-blue-500"
              )}>
                {item.icon}
              </div>
              <span className="transition-all duration-300 group-hover:translate-x-1">{item.title}</span>
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
                      "flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-300 cursor-pointer group",
                      childActive
                        ? "bg-gray-100 dark:bg-gray-900/30 text-black dark:text-gray-200 border-l-3 border-black dark:border-gray-300 shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-gray-200 hover:border-l-3 hover:border-gray-300"
                    )}>
                      <div className={cn(
                        "transition-all duration-300 group-hover:scale-110",
                        childActive ? "text-black dark:text-gray-200" : "text-slate-400 dark:text-slate-500 group-hover:text-black dark:group-hover:text-gray-200"
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

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slider Menu */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden",
        "border-r border-slate-200 dark:border-slate-700",
        "transform transition-all duration-500 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-black to-gray-800 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Navigation
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-110"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {NAVIGATION.map(renderNavigationItem)}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Office Management System
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-6 pb-4 pt-20">
          <nav className="space-y-2">
            {NAVIGATION.map(renderNavigationItem)}
          </nav>
        </div>
      </div>
    </>
  );
}