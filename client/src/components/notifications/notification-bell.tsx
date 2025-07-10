import { useState } from "react";
import { Bell, Check, CheckCheck, Settings, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationSettings } from "@/components/notifications/notification-settings";
import { getRelativeTime } from "@/lib/utils";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading, isConnected } = useNotifications();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "user_created":
        return "👤";
      case "interview_request":
        return "📅";
      case "interview_approved":
        return "✅";
      case "interview_rejected":
        return "❌";
      case "todo_assigned":
        return "📝";
      case "todo_completed":
        return "✓";
      case "system_update":
        return "🔔";
      default:
        return "📢";
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Notifications</span>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="h-3 w-3 text-green-500" title="Real-time notifications enabled" />
              ) : (
                <WifiOff className="h-3 w-3 text-orange-500" title="Checking for updates every 10s" />
              )}
              <span className="text-xs text-gray-500">
                {isConnected ? "Live" : "Polling"}
              </span>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications yet</div>
        ) : (
          <ScrollArea className="h-96">
            {notifications.map((notification: any) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <span className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {getRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowSettings(true)} className="p-3">
          <Settings className="h-4 w-4 mr-2" />
          Device Notification Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Notification Settings Dialog */}
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        <NotificationSettings />
      </DialogContent>
    </Dialog>
  );
}