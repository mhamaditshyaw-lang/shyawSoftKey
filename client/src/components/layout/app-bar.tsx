import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X,
  Building2,
  ChevronDown,
  BarChart3,
  Users,
  CheckSquare,
  MessageSquare,
  Database,
  Archive
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { authenticatedRequest } from "@/lib/auth";
import { Link } from "wouter";
import shyawLogo from "@assets/shyaw_1754396249542.jpg";

interface AppBarProps {}

export default function AppBar({}: AppBarProps) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Use device notifications instead
  const unreadCount = 0; // Will be handled by the device notification center
  const notifications: any[] = []; // Empty array for now, will be handled by device notification center

  // Quick access menu items
  const quickMenuItems = [
    { 
      title: "Dashboard Overview", 
      subtitle: "Analytics & Reports",
      icon: BarChart3, 
      href: "/dashboard",
      color: "from-green-500 to-green-600"
    },
    { 
      title: "Employee Reviews", 
      subtitle: "& Evaluations",
      icon: Users, 
      href: "/interviews",
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Employee Affairs", 
      subtitle: "Tasks",
      icon: CheckSquare, 
      href: "/todos",
      color: "from-purple-500 to-purple-600"
    },
    { 
      title: "Feedback", 
      subtitle: "& Reviews",
      icon: MessageSquare, 
      href: "/feedback",
      color: "from-orange-500 to-orange-600"
    },
    { 
      title: "Employee", 
      subtitle: "Tracking",
      icon: Database, 
      href: "/data-view",
      color: "from-teal-500 to-teal-600"
    },
    { 
      title: "Archive", 
      subtitle: "",
      icon: Archive, 
      href: "/archive",
      color: "from-gray-500 to-gray-600"
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 border-red-200";
      case "manager": return "bg-blue-100 text-blue-800 border-blue-200";
      case "security": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20 sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left Section - Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-red-200 group-hover:scale-110 border-2 border-red-200">
                <img 
                  src={shyawLogo} 
                  alt="Shyaw Logo" 
                  className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110" 
                />
              </div>
              <div className="hidden sm:block transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-blue-800 bg-clip-text text-transparent">
                  Shyaw Administration
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300 group-hover:text-red-500">
                  Administration Shyaw System
                </p>
              </div>
            </div>
          </div>



        {/* Right Section - Notifications & User Menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-green-50 dark:hover:bg-green-900/50 transition-all duration-300 hover:scale-110 rounded-xl"
              >
                <Bell className={`h-5 w-5 transition-all duration-300 ${unreadCount > 0 ? 'animate-pulse text-green-600' : ''}`} />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-bounce bg-gradient-to-r from-red-500 to-pink-500 shadow-lg"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 animate-in slide-in-from-top-2 duration-300">
              <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                    <p className="text-xs text-gray-500">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                  </div>
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((notification: any, index: number) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${!notification.isRead ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                )) || (
                  <DropdownMenuItem className="p-6 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <Bell className="h-8 w-8 text-gray-300" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  </DropdownMenuItem>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="w-full text-center text-sm py-3 font-medium text-green-600 hover:text-green-700 transition-colors duration-200">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:bg-green-900/50 transition-all duration-300 hover:scale-105 rounded-xl px-3 py-2"
              >
                <Avatar className="h-8 w-8 transition-all duration-300 hover:scale-110">
                  <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold shadow-lg">
                    {getInitials(user?.firstName, user?.lastName, user?.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.username}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getRoleColor(user?.role || '')} transition-all duration-300 hover:scale-105`}
                  >
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 hidden sm:block transition-transform duration-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 animate-in slide-in-from-top-2 duration-300">
              <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold">
                      {getInitials(user?.firstName, user?.lastName, user?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.username}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getRoleColor(user?.role || '')}`}
                    >
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                    <User className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm">Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                    <Settings className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm">Preferences</span>
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <DropdownMenuItem 
                  onClick={logout} 
                  className="flex items-center p-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">Sign out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    </>
  );
}