import { useState } from "react";
import { Bell, Search, Menu, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  notificationCount?: number;
}

export function DashboardHeader({ onMenuClick, notificationCount = 0 }: DashboardHeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const { theme, setTheme, isDark } = useTheme();
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-dashboard-error text-white';
      case 'manager': return 'bg-dashboard-primary text-white';
      case 'secretary': return 'bg-dashboard-accent text-white';
      default: return 'bg-dashboard-secondary text-white';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-dashboard-bg-dark/80 backdrop-blur-md transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section - Menu & Brand */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-dashboard-primary/10"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-dashboard-primary to-dashboard-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">AS</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-dashboard-text-light dark:text-dashboard-text-dark">
                Administration System
              </h1>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dashboard-secondary/50" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 bg-dashboard-bg-light/50 dark:bg-dashboard-secondary/20 border-dashboard-secondary/20 focus:border-dashboard-primary focus:ring-dashboard-primary/20"
            />
          </div>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="hover:bg-dashboard-primary/10"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-dashboard-accent" />
            ) : (
              <Moon className="h-5 w-5 text-dashboard-primary" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-dashboard-primary/10"
          >
            <Bell className="h-5 w-5 text-dashboard-secondary dark:text-dashboard-text-dark" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-dashboard-error border-0 flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-dashboard-primary/10">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={user?.username || "User"} />
                  <AvatarFallback className="bg-dashboard-primary text-white text-sm">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-dashboard-text-light dark:text-dashboard-text-dark">
                    {user?.username}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-2 py-0 ${getRoleBadgeColor(user?.role || '')}`}
                  >
                    {user?.role}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">{user?.username}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role} User</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-dashboard-primary/10">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-dashboard-primary/10">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="text-dashboard-error hover:bg-dashboard-error/10 hover:text-dashboard-error"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}