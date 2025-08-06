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
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import shyawLogo from "@assets/shyaw_1754396249542.jpg";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function DashboardSidebar({ isCollapsed = false, onToggle, className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const navigationItems = [
    {
      title: t("dashboard"),
      href: "/",
      icon: Home,
      badge: null,
      roles: ["admin", "manager", "security"]
    },
    {
      title: t("users"),
      href: "/users",
      icon: Users,
      badge: null,
      roles: ["admin", "manager"]
    },
    
    {
      title: t("todos"),
      href: "/todos",
      icon: CheckSquare,
      badge: null,
      roles: ["admin", "manager", "security"]
    },

    {
      title: t("interviews"),
      href: "/interviews",
      icon: UserCheck,
      badge: null,
      roles: ["admin", "manager", "security"]
    },
    {
      title: t("reports"),
      href: "/reports",
      icon: BarChart3,
      badge: null,
      roles: ["admin", "manager"]
    },
    {
      title: t("feedback"),
      href: "/feedback",
      icon: MessageSquare,
      badge: null,
      roles: ["admin", "manager", "security"]
    },
    {
      title: t("archive"),
      href: "/archive",
      icon: Archive,
      badge: null,
      roles: ["admin", "manager"]
    },
    {
      title: "Daily Operations",
      href: "/metrics",
      icon: BarChart3,
      badge: "Data Entry",
      roles: ["admin", "manager", "security"]
    },
    {
      title: "Data View",
      href: "/data-view",
      icon: Database,
      badge: null,
      roles: ["admin", "manager", "security"]
    },
    {
      title: t("allData"),
      href: "/all-data",
      icon: Shield,
      badge: null,
      roles: ["admin"]
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || "")
  );

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
            <div className="h-8 w-8 rounded-lg bg-white border border-red-200 flex items-center justify-center">
              <img 
                src={shyawLogo} 
                alt="Shyaw Logo" 
                className="w-6 h-6 object-contain" 
              />
            </div>
            <span className="font-semibold text-dashboard-text-light dark:text-dashboard-text-dark">
              Shyaw System
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="h-8 w-8 rounded-lg bg-white border border-red-200 flex items-center justify-center">
              <img 
                src={shyawLogo} 
                alt="Shyaw Logo" 
                className="w-6 h-6 object-contain" 
              />
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
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  active 
                    ? "bg-dashboard-primary text-white shadow-lg hover:bg-dashboard-primary/90" 
                    : "hover:bg-dashboard-primary/10 text-dashboard-text-light dark:text-dashboard-text-dark hover:text-dashboard-primary",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-white")} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto bg-dashboard-accent text-white text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </Link>
          );
        })}
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