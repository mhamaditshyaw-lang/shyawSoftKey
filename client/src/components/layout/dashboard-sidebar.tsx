import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  ChevronDown,
  ChevronRight,
  Zap,
  Building2,
  Activity,
  Bell,
  HardDrive,
  LucideIcon,
  ListTodo,
  Briefcase,
  TrendingUp,
  Settings,
  Clock,
  Users2,
  UserPlus,
  MessageCircle,
  MessageSquare,
  Archive,
  Lock,
  FileText,
  Eye,
  Layers,
  Radio,
  Play,
  TestTube,
  Wrench,
  ClipboardList,
  Send,
  LayoutDashboard,
  Shield,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { PAGE_PERMISSIONS } from "@shared/schema";
import { MENU_PARTITIONS } from "@/lib/menu-partitions";

const partitionIconMap: Record<string, LucideIcon> = {
  ListTodo,
  ClipboardList,
  Users,
  Briefcase,
  TrendingUp,
  Settings,
};

const itemIconMap: Record<string, LucideIcon> = {
  Zap,
  Clock,
  Activity,
  Users,
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
  Wrench,
  Send,
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
  const [expandedPartitions, setExpandedPartitions] = useState<Set<string>>(new Set(['Task Management']));
  
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
      "flex flex-col h-full trello-sidebar transition-all duration-200",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        {!isCollapsed ? (
          <>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">Shyaw Admin</span>
          </>
        ) : (
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center mx-auto">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        <Link href="/">
          <div
            className={cn(
              "trello-sidebar-item",
              dashboardActive && "trello-sidebar-item-active bg-white/10"
            )}
            data-testid="link-dashboard"
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </div>
        </Link>

        <div className="h-px bg-white/10 my-3" />

        {partitionItems.map((partition) => {
          const isExpanded = expandedPartitions.has(partition.title);
          const PartitionIcon = getPartitionIcon(partition.iconName);
          
          return (
            <div key={partition.title} className="space-y-0.5">
              <button
                onClick={() => !isCollapsed && togglePartition(partition.title)}
                className={cn(
                  "w-full trello-sidebar-item group",
                  isExpanded && "text-white"
                )}
                title={isCollapsed ? partition.title : undefined}
                data-testid={`btn-partition-${partition.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <PartitionIcon className="w-5 h-5 flex-shrink-0 opacity-80" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm">{t(partition.titleKey)}</span>
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 opacity-60 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )} 
                    />
                  </>
                )}
              </button>

              {isExpanded && !isCollapsed && (
                <div className="ml-2 pl-4 border-l border-white/10 space-y-0.5 animate-fade-in">
                  {partition.items.map((item) => {
                    const active = isActive(item.path);
                    const ItemIcon = getItemIcon(item.iconName);
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <div
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer",
                            active 
                              ? "bg-primary text-white font-medium" 
                              : "text-white/70 hover:text-white hover:bg-white/10"
                          )}
                          data-testid={`link-${item.path.replace(/\//g, '-').slice(1) || 'home'}`}
                        >
                          {ItemIcon && (
                            <ItemIcon className={cn("w-4 h-4 flex-shrink-0", active ? "text-white" : "opacity-70")} />
                          )}
                          <span>{t(item.labelKey)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {isAdmin && (
          <>
            <div className="h-px bg-white/10 my-3" />
            
            {!isCollapsed && (
              <div className="px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Administration
                </span>
              </div>
            )}
            
            <Link href="/page-access-management">
              <div
                className={cn(
                  "trello-sidebar-item",
                  isActive("/page-access-management") && "trello-sidebar-item-active bg-white/10"
                )}
                data-testid="link-page-access"
              >
                <Shield className="w-5 h-5 flex-shrink-0 opacity-80" />
                {!isCollapsed && <span className="text-sm">Page Access</span>}
              </div>
            </Link>
            
            <Link href="/backup-restore">
              <div
                className={cn(
                  "trello-sidebar-item",
                  isActive("/backup-restore") && "trello-sidebar-item-active bg-white/10"
                )}
                data-testid="link-backup-restore"
              >
                <HardDrive className="w-5 h-5 flex-shrink-0 opacity-80" />
                {!isCollapsed && <span className="text-sm">Backup & Restore</span>}
              </div>
            </Link>
          </>
        )}
      </nav>

      {!isCollapsed && user && (
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="trello-avatar trello-avatar-sm bg-primary/80">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-white/50 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
