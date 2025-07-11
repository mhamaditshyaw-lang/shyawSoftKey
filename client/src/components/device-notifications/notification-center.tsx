import { useState } from "react";
import { Bell, Smartphone, Check, Trash2, Settings, TestTube } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDeviceNotifications } from "@/hooks/use-device-notifications";
import { getRelativeTime } from "@/lib/utils";

export default function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isLoading,
    permission,
    requestPermission,
    createTestNotification,
    isSupported,
    isGranted 
  } = useDeviceNotifications();
  
  // Remove debug logging for production
  
  const [isOpen, setIsOpen] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "system_alert":
        return "⚠️";
      case "task_reminder":
        return "📋";
      case "user_activity":
        return "👤";
      case "security_alert":
        return "🔒";
      case "maintenance_notice":
        return "🔧";
      case "deadline_warning":
        return "⏰";
      case "achievement":
        return "🏆";
      default:
        return "🔔";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "normal":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "low":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse bg-red-500"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 max-h-[500px]">
          <DropdownMenuLabel className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isGranted ? (
                <Badge variant="default" className="bg-green-500">
                  <Check className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Bell className="w-3 h-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <div className="p-2 flex space-x-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
                className="flex-1"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark All Read
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={createTestNotification}
              className="flex-1"
            >
              <TestTube className="w-3 h-3 mr-1" />
              Test
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="flex-1"
            >
              <Settings className="w-3 h-3 mr-1" />
              Settings
            </Button>
          </div>
          
          <DropdownMenuSeparator />
          
          <ScrollArea className="max-h-80">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.slice(0, 10).map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-l-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      !notification.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""
                    } ${getPriorityColor(notification.priority)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{notification.icon || getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${!notification.isRead ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"}`}>
                            {notification.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs ml-2">
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {getRelativeTime(new Date(notification.createdAt))}
                          </span>
                          <div className="flex space-x-1">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAsRead}
                  className="w-full"
                  disabled={unreadCount === 0}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark All Read ({unreadCount})
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Device Notification Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Browser Support</CardTitle>
                <CardDescription>
                  {isSupported 
                    ? "Your browser supports device notifications" 
                    : "Device notifications are not supported in this browser"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="enable-notifications">Enable Notifications</Label>
                  <Switch
                    id="enable-notifications"
                    checked={isGranted}
                    onCheckedChange={(checked) => {
                      if (checked && !isGranted) {
                        requestPermission();
                      }
                    }}
                    disabled={!isSupported}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Permission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Status:</span>
                    <Badge variant={
                      permission.permission === 'granted' ? 'default' : 
                      permission.permission === 'denied' ? 'destructive' : 'secondary'
                    }>
                      {permission.permission === 'granted' ? 'Enabled' : 
                       permission.permission === 'denied' ? 'Blocked' : 'Not Set'}
                    </Badge>
                  </div>
                  
                  {!isGranted && isSupported && (
                    <Button
                      size="sm"
                      onClick={requestPermission}
                      className="w-full mt-3"
                    >
                      Request Permission
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Test Notifications</CardTitle>
                <CardDescription>
                  Send a test notification to verify everything is working
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={createTestNotification}
                  className="w-full"
                  disabled={!isGranted}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Send Test Notification
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}