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
  HardDrive
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


interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function DashboardSidebar({ isCollapsed = false, onToggle, className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [expandedPartitions, setExpandedPartitions] = useState<Set<string>>(new Set(["Analytics & Reports"]));
  
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
        {partitionItems.map((partition) => {
          const isExpanded = expandedPartitions.has(partition.title);
          const partitionColors: Record<string, { bg: string; text: string; hover: string }> = {
            "Task Management": { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", hover: "hover:bg-blue-100 dark:hover:bg-blue-950/50" },
            "Employee Management": { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", hover: "hover:bg-purple-100 dark:hover:bg-purple-950/50" },
            "HR & Operations": { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600 dark:text-green-400", hover: "hover:bg-green-100 dark:hover:bg-green-950/50" },
            "Analytics & Reports": { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600 dark:text-orange-400", hover: "hover:bg-orange-100 dark:hover:bg-orange-950/50" },
            "System Management": { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", hover: "hover:bg-red-100 dark:hover:bg-red-950/50" },
          };
          
          const colors = partitionColors[partition.title] || partitionColors["Task Management"];
          
          return (
            <div key={partition.title} className="space-y-2">
              <button
                onClick={() => !isCollapsed && togglePartition(partition.title)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium",
                  isCollapsed 
                    ? "justify-center" 
                    : `${colors.bg} ${colors.text} ${colors.hover} border border-transparent hover:border-current/20`
                )}
                title={isCollapsed ? partition.title : undefined}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-base",
                  colors.bg,
                  colors.text
                )}>
                  {partition.icon}
                </div>
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-semibold uppercase tracking-wide flex-1 text-left">
                      {partition.title}
                    </span>
                    <ChevronRight 
                      className={cn(
                        "h-4 w-4 transition-transform duration-300 flex-shrink-0",
                        isExpanded && "rotate-90"
                      )} 
                    />
                  </>
                )}
              </button>

              {isExpanded && !isCollapsed && (
                <div className={cn(
                  "space-y-1.5 ml-2 pl-3 border-l-2 transition-all duration-300",
                  colors.text,
                  colors.text.replace("text-", "border-")
                )}>
                  {partition.items.map((item) => {
                    const active = isActive(item.path);
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start gap-2.5 transition-all duration-200 text-xs font-medium group",
                            active 
                              ? `${colors.bg} ${colors.text} shadow-md hover:shadow-lg` 
                              : `hover:${colors.bg} text-dashboard-text-light dark:text-dashboard-text-dark hover:${colors.text}`,
                          )}
                          title={item.label}
                        >
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all duration-200",
                            active ? colors.text : `bg-dashboard-secondary/50 group-hover:${colors.text}`
                          )} />
                          <span className="flex-1 text-left">{item.label}</span>
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