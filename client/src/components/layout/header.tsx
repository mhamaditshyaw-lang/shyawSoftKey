import { Building2, User, LogOut, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import NotificationCenter from "@/components/device-notifications/notification-center";
import { useDeviceNotifications } from "@/hooks/use-device-notifications";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { notifications, unreadCount } = useDeviceNotifications();

  if (!user) return null;

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "security":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <header className="mobile-header sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="logo w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:ml-0 ml-12">
              <Building2 className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                <span className="sm:hidden">Shyaw</span>
                <span className="hidden sm:inline">HR Management System</span>
              </h1>
              <Badge className={`hidden sm:flex text-xs ${getRoleBadgeClass(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>



          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Mobile: Only essential items */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Mobile: Hide language switcher */}
              <div className="hidden sm:flex">
                <LanguageSwitcher />
              </div>
              
              {/* Mobile: Hide theme toggle */}
              <div className="hidden lg:flex">
                <ThemeToggle />
              </div>
              
              {/* Mobile: Simplified notifications */}
              <div className="relative sm:block">
                <NotificationCenter />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </div>
            </div>

            {/* User Profile - Simplified for mobile */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Mobile: Hide user details text */}
              <div className="hidden xl:flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">{user.username}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              
              {/* Mobile: Smaller avatar */}
              <Avatar className="h-7 w-7 sm:h-10 sm:w-10 ring-1 sm:ring-2 ring-indigo-200 dark:ring-indigo-700 touch-target">
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs sm:text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Mobile: Hide logout button, only show on hover or desktop */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hidden sm:flex text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 touch-target p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}