import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone, Monitor, Check, X, AlertCircle } from 'lucide-react';

export function NotificationSettings() {
  const { 
    notificationPermission, 
    requestPermission, 
    sendNotification,
    sendSystemNotification,
    isSupported, 
    isGranted 
  } = useNotifications();
  
  const [browserNotifications, setBrowserNotifications] = useState(isGranted);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync state with actual permission status
  useEffect(() => {
    setBrowserNotifications(isGranted);
  }, [isGranted, notificationPermission.permission]);

  const handleEnableNotifications = async () => {
    try {
      const granted = await requestPermission();
      setBrowserNotifications(granted);
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setBrowserNotifications(false);
    }
  };

  const handleTestNotification = () => {
    sendSystemNotification('user_created', 'Test notification: This is how device notifications will appear');
  };

  const getPermissionBadge = () => {
    if (!isSupported) {
      return <Badge variant="destructive" className="ml-2"><X className="w-3 h-3 mr-1" />Not Supported</Badge>;
    }
    
    switch (notificationPermission.permission) {
      case 'granted':
        return <Badge variant="default" className="ml-2 bg-green-500"><Check className="w-3 h-3 mr-1" />Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive" className="ml-2"><X className="w-3 h-3 mr-1" />Blocked</Badge>;
      default:
        return <Badge variant="secondary" className="ml-2"><AlertCircle className="w-3 h-3 mr-1" />Not Set</Badge>;
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
          <Bell className="w-5 h-5 mr-2" />
          Device Notifications
          {getPermissionBadge()}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Receive notifications on your device even when you're not using the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Support Status */}
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
          {isSupported ? (
            <>
              <Monitor className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Browser Supported</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your browser supports push notifications</p>
              </div>
            </>
          ) : (
            <>
              <BellOff className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Not Supported</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your browser doesn't support notifications</p>
              </div>
            </>
          )}
        </div>

        {/* Enable Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="browser-notifications" className="text-gray-700 dark:text-gray-300">
                Browser Notifications
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get notified about new tasks, interviews, and updates
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {!isGranted && isSupported && notificationPermission.permission !== 'denied' && (
                <Button 
                  onClick={handleEnableNotifications}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Allow Notifications
                </Button>
              )}
              {notificationPermission.permission === 'denied' && (
                <div className="text-xs text-red-600 dark:text-red-400">
                  Blocked in browser
                </div>
              )}
              <Switch
                id="browser-notifications"
                checked={isGranted}
                onCheckedChange={(checked) => {
                  if (checked && !isGranted) {
                    handleEnableNotifications();
                  } else {
                    setBrowserNotifications(checked);
                  }
                }}
                disabled={!isSupported || notificationPermission.permission === 'denied'}
              />
            </div>
          </div>

          {/* Sound Settings */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sound-notifications" className="text-gray-700 dark:text-gray-300">
                Notification Sounds
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Play sound when receiving notifications
              </p>
            </div>
            <Switch
              id="sound-notifications"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
              disabled={!isGranted}
            />
          </div>
        </div>

        {/* Test Notification */}
        {isGranted && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <Button 
              onClick={handleTestNotification}
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        )}

        {/* Device Types */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Works on:</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-gray-300 dark:border-gray-600">
              <Monitor className="w-3 h-3 mr-1" />
              Desktop
            </Badge>
            <Badge variant="outline" className="border-gray-300 dark:border-gray-600">
              <Smartphone className="w-3 h-3 mr-1" />
              Mobile
            </Badge>
          </div>
        </div>

        {/* Permission Denied Help */}
        {notificationPermission.permission === 'denied' && isSupported && (
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Notifications Blocked
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              To enable notifications, click the notification icon in your browser's address bar and allow notifications for this site.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}