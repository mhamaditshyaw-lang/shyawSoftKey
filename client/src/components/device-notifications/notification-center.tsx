import { useState } from "react";
import { 
  Bell, 
  Smartphone, 
  Check, 
  Trash2, 
  Settings, 
  TestTube,
  Eye,
  UserPlus,
  Calendar,
  FileText,
  ArrowRight,
  MessageSquare,
  Archive,
  Star,
  ExternalLink
} from "lucide-react";
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
import { useTranslation } from "react-i18next";

export default function NotificationCenter() {
  const { t } = useTranslation();
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

  // Get quick action buttons based on notification type and content
  const getQuickActions = (notification: any) => {
    const actions: Array<{
      label: string;
      icon?: any;
      onClick: (notification: any) => void;
      variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
      className?: string;
    }> = [];

    // Debug logging - temporary
    console.log('Getting actions for notification:', {
      id: notification.id,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      isRead: notification.isRead
    });

    // Common actions for all notifications
    if (!notification.isRead) {
      actions.push({
        label: "Mark Read",
        icon: Check,
        onClick: (notif) => markAsRead(notif.id),
        variant: "outline",
        className: "border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      });
    }

    // Type-specific actions
    switch (notification.type) {
      case 'user_activity':
        actions.push({
          label: "View Users",
          icon: UserPlus,
          onClick: () => window.location.href = '/users',
          variant: "outline",
          className: "border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
        });
        break;

      case 'task_reminder':
        if (notification.title.toLowerCase().includes('interview')) {
          actions.push({
            label: "View Interviews",
            icon: Calendar,
            onClick: () => window.location.href = '/interviews',
            variant: "outline",
            className: "border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          });
        } else {
          actions.push({
            label: "View Tasks",
            icon: FileText,
            onClick: () => window.location.href = '/todos',
            variant: "outline",
            className: "border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          });
        }
        break;

      case 'system_alert':
      case 'security_alert':
        actions.push({
          label: notification.priority === 'urgent' ? "Take Action" : "View Alert",
          icon: ArrowRight,
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            } else {
              window.location.href = '/dashboard';
            }
          },
          variant: notification.priority === 'urgent' ? "default" : "outline",
          className: notification.priority === 'urgent' 
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        });
        break;

      case 'general':
        if (notification.title.toLowerCase().includes('feedback')) {
          actions.push({
            label: "Give Feedback",
            icon: MessageSquare,
            onClick: () => window.location.href = '/feedback',
            variant: "outline",
            className: "border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          });
        }
        break;

      case 'achievement':
        actions.push({
          label: "View Details",
          icon: Star,
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            } else {
              window.location.href = '/dashboard';
            }
          },
          variant: "outline",
          className: "border-yellow-300 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
        });
        break;

      case 'deadline_warning':
        actions.push({
          label: "Check Deadline",
          icon: Calendar,
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            } else {
              window.location.href = '/todos';
            }
          },
          variant: "outline",
          className: "border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
        });
        break;

      case 'maintenance_notice':
        actions.push({
          label: "View Notice",
          icon: Settings,
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            } else {
              window.location.href = '/dashboard';
            }
          },
          variant: "outline",
          className: "border-gray-300 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20"
        });
        break;

      default:
        // Generic action for unknown types
        if (notification.actionUrl) {
          actions.push({
            label: "View Details",
            icon: ExternalLink,
            onClick: () => window.location.href = notification.actionUrl,
            variant: "outline",
            className: "border-gray-300 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20"
          });
        }
    }

    // Priority-based actions
    if (notification.priority === 'urgent' && actions.length === 1) {
      actions.push({
        label: "Mark Important",
        icon: Star,
        onClick: (notif) => {
          // Here you could implement a mark as important API call
          console.log('Marking as important:', notif.id);
          markAsRead(notif.id);
        },
        variant: "outline",
        className: "border-yellow-300 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
      });
    }

    // Archive action for old notifications (older than 7 days)
    const notificationAge = Date.now() - new Date(notification.createdAt).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    if (notificationAge > sevenDays) {
      actions.push({
        label: "Archive",
        icon: Archive,
        onClick: (notif) => deleteNotification(notif.id),
        variant: "ghost",
        className: "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      });
    }

    const finalActions = actions.slice(0, 3); // Limit to 3 actions to avoid clutter
    console.log('Final actions for notification ' + notification.id + ':', finalActions);
    return finalActions;
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
              unreadCount > 0 ? 'animate-pulse' : ''
            }`}
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <Bell className={`h-7 w-7 ${
              unreadCount > 0 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-blue-600 dark:text-blue-400'
            }`} />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs animate-bounce bg-red-500 text-white font-bold shadow-lg ring-2 ring-white dark:ring-gray-900"
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
              <span>{t('notifications')}</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {unreadCount} {t('new')}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isGranted ? (
                <Badge variant="default" className="bg-green-500">
                  <Check className="w-3 h-3 mr-1" />
                  {t('enabled')}
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestPermission}
                  className="text-xs"
                >
                  <Bell className="w-3 h-3 mr-1" />
                  {t('enableNotifications')}
                </Button>
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
                {t('markAllRead')}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={createTestNotification}
              className="flex-1"
            >
              <TestTube className="w-3 h-3 mr-1" />
              {t('test')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="flex-1"
            >
              <Settings className="w-3 h-3 mr-1" />
              {t('settings')}
            </Button>
          </div>
          
          <DropdownMenuSeparator />
          
          <ScrollArea className="h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                {t('loadingNotifications')}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('noNotificationsYet')}</p>
              </div>
            ) : (
              <div className="space-y-1 pr-4">
                {notifications.map((notification: any) => (
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
                        <div className="flex items-center justify-between mt-3">
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
                                className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                title={t('markRead')}
                              >
                                <Check className="w-3 h-3 text-blue-600" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                              title={t('deleteNotification')}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t-2 border-blue-200 dark:border-blue-700 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          {getQuickActions(notification).length > 0 ? (
                            getQuickActions(notification).map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant={action.variant || "outline"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(notification);
                                }}
                                className={`text-xs h-8 px-3 font-medium ${action.className || ''}`}
                              >
                                {action.icon && <action.icon className="w-3 h-3 mr-1" />}
                                {action.label}
                              </Button>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500">
                              {t('noQuickActionsAvailable')} {notification.type}
                            </div>
                          )}
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
                  {t('markAllRead')} ({unreadCount})
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
              {t('deviceNotificationSettings')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t('browserSupport')}</CardTitle>
                <CardDescription>
                  {isSupported 
                    ? t('browserSupportsNotifications')
                    : t('browserNotSupported')
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="enable-notifications">{t('enableNotificationsLabel')}</Label>
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
                <CardTitle className="text-sm">{t('permissionStatus')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t('currentStatus')}</span>
                    <Badge variant={
                      permission.permission === 'granted' ? 'default' : 
                      permission.permission === 'denied' ? 'destructive' : 'secondary'
                    }>
                      {permission.permission === 'granted' ? t('enabled') : 
                       permission.permission === 'denied' ? t('blocked') : t('notSet')}
                    </Badge>
                  </div>
                  
                  {!isGranted && isSupported && (
                    <Button
                      size="sm"
                      onClick={requestPermission}
                      className="w-full mt-3"
                    >
                      {t('requestPermission')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t('testNotifications')}</CardTitle>
                <CardDescription>
                  {t('sendTestDesc')}
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
                  {t('sendTestNotification')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}