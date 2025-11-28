import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  MessageSquare,
  Archive,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  UserCheck,
  Plus,
  Building2,
  Activity,
  Bell,
  HardDrive,
  LucideIcon,
  ListTodo,
  Briefcase,
  TrendingUp,
  Cog,
  CheckCircle2,
  Clock,
  Users2,
  UserPlus,
  MessageCircle,
  Lock,
  FileText,
  Eye,
  Layers,
  Radio,
  Play,
  TestTube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { PAGE_PERMISSIONS } from "@shared/schema";
import { MENU_PARTITIONS } from "@/lib/menu-partitions";

// Placeholder component (not used anymore, kept for compatibility)
const SidebarMenuButton = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  if (asChild) {
    return <>{children}</>;
  }
  return <button>{children}</button>;
};

// Icon mapping for menu partitions
const partitionIconMap: Record<string, LucideIcon> = {
  ListTodo,
  Users,
  Briefcase,
  TrendingUp,
  Cog,
};

// Icon mapping for menu items
const itemIconMap: Record<string, LucideIcon> = {
  CheckCircle2,
  Clock,
  Activity,
  Users2,
  UserPlus,
  Building2,
  MessageCircle,
  MessageSquare,
  Archive,
  Lock,
  FileText,
  Database,
  Eye,
  Layers,
  Radio,
  Bell,
  HardDrive,
  Play,
  TestTube,
};

const getPartitionIcon = (iconName: string): LucideIcon => {
  return partitionIconMap[iconName] || ListTodo;
};

const getItemIcon = (iconName?: string): LucideIcon | null => {
  if (!iconName) return null;
  return itemIconMap[iconName] || null;
};


interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function DashboardSidebar({ isCollapsed = false, onToggle, className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [expandedPartitions, setExpandedPartitions] = useState<Set<string>>(new Set());
  
  const togglePartition = (partitionTitle: string) => {
    const newExpanded = new Set(expandedPartitions);
    if (newExpanded.has(partitionTitle)) {
      newExpanded.delete(partitionTitle);
    } else {
      newExpanded.add(partitionTitle);
    }
    setExpandedPartitions(newExpanded);
  };
  
  const isAdmin = user?.role === 'admin';
  
  const hasPermission = (href: string): boolean => {
    if (isAdmin) return true;
    
    const permissionKey = PAGE_PERMISSIONS[href as keyof typeof PAGE_PERMISSIONS];
    if (!permissionKey) return false;
    
    const permissions = user?.permissions as Record<string, boolean> | undefined;
    return permissions?.[permissionKey] === true;
  };

  const getPartitionItems = () => {
    return MENU_PARTITIONS.map(partition => ({
      ...partition,
      items: partition.items.filter(item => hasPermission(item.path))
    })).filter(partition => partition.items.length > 0);
  };

  const partitionItems = getPartitionItems();

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };
  
  const dashboardActive = isActive("/");

  return (
    <aside className={cn(
      "flex flex-col h-full bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 border-r border-indigo-200/30 dark:border-indigo-600/30 shadow-lg transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-indigo-200/20 dark:border-indigo-600/20 bg-gradient-to-r from-indigo-500/5 to-blue-500/5">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 border-2 border-indigo-300 dark:border-indigo-400 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-3">
              <Building2 className="w-6 h-6 text-white animate-bounce" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Shyaw
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 border-2 border-indigo-300 dark:border-indigo-400 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-3">
              <Building2 className="w-6 h-6 text-white animate-bounce" />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="hover:bg-indigo-500/20 ml-auto transition-all duration-300 hover:scale-110 active:scale-95"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 transition-transform duration-300 hover:translate-x-1" />
          ) : (
            <ChevronLeft className="h-4 w-4 transition-transform duration-300 hover:-translate-x-1" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-hide">
        {/* Dashboard - Top Item */}
        <Link href="/">
          <Button
            variant={dashboardActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start gap-3 transition-all duration-300 font-medium rounded-lg group",
              dashboardActive
                ? "bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                : "text-slate-700 dark:text-slate-300 hover:bg-indigo-400/15 dark:hover:bg-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-300",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <Home className={cn("h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12", dashboardActive && "text-white")} />
            {!isCollapsed && <span className="group-hover:translate-x-1 transition-transform duration-300">Dashboard</span>}
          </Button>
        </Link>

        <div className="border-t border-indigo-200/20 dark:border-indigo-600/30 my-2" />

        {/* Partitions */}
        {partitionItems.map((partition) => {
          const isExpanded = expandedPartitions.has(partition.title);
          
          return (
            <div key={partition.title} className="space-y-1">
              <button
                onClick={() => !isCollapsed && togglePartition(partition.title)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 font-medium group",
                  isCollapsed 
                    ? "justify-center" 
                    : cn(
                      "hover:bg-gradient-to-r hover:from-indigo-400/20 hover:to-blue-400/20 dark:hover:from-indigo-500/30 dark:hover:to-blue-500/30",
                      isExpanded && "bg-gradient-to-r from-indigo-400/25 to-blue-400/25 dark:from-indigo-500/40 dark:to-blue-500/40 border-l-4 border-indigo-500"
                    )
                )}
                title={isCollapsed ? partition.title : undefined}
              >
                {!isCollapsed && (
                  <>
                    {(() => {
                      const IconComponent = getPartitionIcon(partition.iconName);
                      return <IconComponent className="h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />;
                    })()}
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1 text-left tracking-wide group-hover:translate-x-1 transition-transform duration-300">
                      {t(partition.titleKey)}
                    </span>
                    <ChevronRight 
                      className={cn(
                        "h-4 w-4 text-slate-400 dark:text-slate-500 transition-all duration-300 flex-shrink-0 group-hover:scale-125",
                        isExpanded && "rotate-90 text-indigo-600 dark:text-indigo-400"
                      )} 
                    />
                  </>
                )}
                {isCollapsed && (
                  (() => {
                    const IconComponent = getPartitionIcon(partition.iconName);
                    return <IconComponent className="h-5 w-5 text-dashboard-primary" />;
                  })()
                )}
              </button>

              {isExpanded && !isCollapsed && (
                <div className="space-y-1 pl-2 border-l-2 border-indigo-400/40 dark:border-indigo-500/50 animate-in slide-in-from-top-2">
                  {partition.items.map((item) => {
                    const active = isActive(item.path);
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start gap-2 px-3 transition-all duration-300 text-xs font-medium group",
                            active 
                              ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95" 
                              : "text-slate-600 dark:text-slate-400 hover:bg-indigo-400/15 dark:hover:bg-indigo-500/25 hover:text-indigo-700 dark:hover:text-indigo-300",
                          )}
                          title={item.label}
                        >
                          {(() => {
                            const ItemIcon = getItemIcon(item.iconName);
                            return ItemIcon ? (
                              <ItemIcon className={cn("h-4 w-4 flex-shrink-0", active ? "text-white" : "text-dashboard-primary")} />
                            ) : (
                              <span className={cn(
                                "w-2 h-2 rounded-full flex-shrink-0",
                                active ? "bg-white" : "bg-dashboard-primary/40"
                              )} />
                            );
                          })()}
                          <span className="flex-1 text-left">{t(item.labelKey)}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {isAdmin && (
          <div className="border-t border-dashboard-secondary/10 pt-4 space-y-2">
            {!isCollapsed && (
              <div className="px-2 py-2">
                <span className="text-xs font-bold uppercase text-dashboard-primary dark:text-blue-400 tracking-wider">
                  ⚙️ Admin
                </span>
              </div>
            )}
            <Link href="/page-access-management">
              <Button
                variant={isActive("/page-access-management") ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  isActive("/page-access-management")
                    ? "bg-dashboard-primary text-white shadow-lg hover:bg-dashboard-primary/90"
                    : "hover:bg-dashboard-primary/10 text-dashboard-text-light dark:text-dashboard-text-dark hover:text-dashboard-primary",
                  isCollapsed && "justify-center px-2"
                )}
                title="Page Access Management"
              >
                <Shield className={cn("h-5 w-5", isActive("/page-access-management") && "text-white")} />
                {!isCollapsed && <span className="flex-1 text-left text-sm">Page Access Management</span>}
              </Button>
            </Link>
            <Link href="/backup-restore">
              <Button
                variant={isActive("/backup-restore") ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  isActive("/backup-restore")
                    ? "bg-dashboard-primary text-white shadow-lg hover:bg-dashboard-primary/90"
                    : "hover:bg-dashboard-primary/10 text-dashboard-text-light dark:text-dashboard-text-dark hover:text-dashboard-primary",
                  isCollapsed && "justify-center px-2"
                )}
                title="Backup & Restore"
              >
                <HardDrive className={cn("h-5 w-5", isActive("/backup-restore") && "text-white")} />
                {!isCollapsed && <span className="flex-1 text-left text-sm">Backup & Restore</span>}
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-dashboard-secondary/10">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-dashboard-bg-light dark:bg-dashboard-secondary/20">
            <div className="h-10 w-10 rounded-full bg-dashboard-primary flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dashboard-text-light dark:text-dashboard-text-dark truncate">
                {user.username}
              </p>
              <p className="text-xs text-dashboard-secondary dark:text-dashboard-text-dark/60 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}