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
  LucideIcon
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
const iconMap: Record<string, LucideIcon> = {
  CheckSquare,
  Users,
  Zap,
  BarChart3,
  Settings,
};

const getPartitionIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || CheckSquare;
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
      "flex flex-col h-full bg-white dark:bg-dashboard-bg-dark border-r border-dashboard-secondary/10 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-dashboard-secondary/10">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-dashboard-primary border border-red-200 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-dashboard-text-light dark:text-dashboard-text-dark">
              Shyaw System
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="h-8 w-8 rounded-lg bg-dashboard-primary border border-red-200 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="hover:bg-dashboard-primary/10 ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {/* Dashboard - Top Item */}
        <Link href="/">
          <Button
            variant={dashboardActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start gap-3 transition-all duration-200 font-medium rounded-lg",
              dashboardActive
                ? "bg-gradient-to-r from-dashboard-primary to-blue-600 text-white shadow-lg"
                : "text-dashboard-text-light dark:text-dashboard-text-dark hover:bg-blue-50 dark:hover:bg-blue-950/30",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </Button>
        </Link>

        <div className="border-t border-dashboard-secondary/10 my-1" />

        {/* Partitions */}
        {partitionItems.map((partition) => {
          const isExpanded = expandedPartitions.has(partition.title);
          
          return (
            <div key={partition.title} className="space-y-1">
              <button
                onClick={() => !isCollapsed && togglePartition(partition.title)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium",
                  isCollapsed 
                    ? "justify-center" 
                    : cn(
                      "hover:bg-dashboard-primary/10 dark:hover:bg-dashboard-primary/20",
                      isExpanded && "bg-dashboard-primary/5 dark:bg-dashboard-primary/10"
                    )
                )}
                title={isCollapsed ? partition.title : undefined}
              >
                {!isCollapsed && (
                  <>
                    {(() => {
                      const IconComponent = getPartitionIcon(partition.iconName);
                      return <IconComponent className="h-5 w-5 flex-shrink-0 text-dashboard-primary" />;
                    })()}
                    <span className="text-sm font-bold text-dashboard-text-light dark:text-dashboard-text-dark flex-1 text-left tracking-wide">
                      {t(partition.titleKey)}
                    </span>
                    <ChevronRight 
                      className={cn(
                        "h-4 w-4 text-dashboard-secondary/70 transition-transform duration-300 flex-shrink-0",
                        isExpanded && "rotate-90 text-dashboard-primary"
                      )} 
                    />
                  </>
                )}
                {isCollapsed && (
                  <span className="text-lg">{partition.icon}</span>
                )}
              </button>

              {isExpanded && !isCollapsed && (
                <div className="space-y-1 pl-2 border-l-2 border-dashboard-primary/20">
                  {partition.items.map((item) => {
                    const active = isActive(item.path);
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start gap-2 px-3 transition-all duration-200 text-xs font-medium",
                            active 
                              ? "bg-dashboard-primary text-white shadow-md hover:bg-dashboard-primary/90" 
                              : "text-dashboard-text-light dark:text-dashboard-text-dark hover:bg-dashboard-primary/5 dark:hover:bg-dashboard-primary/10",
                          )}
                          title={item.label}
                        >
                          <span className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            active ? "bg-white" : "bg-dashboard-primary/40"
                          )} />
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