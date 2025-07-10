import { useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone, Monitor, Check, X, AlertCircle, TestTube, Wifi, WifiOff } from 'lucide-react';
import { NotificationSettings } from '@/components/notifications/notification-settings';

export default function NotificationTestPage() {
  const { 
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
    isConnected,
    notificationPermission, 
    requestPermission, 
    sendNotification,
    sendSystemNotification,
    isSupported, 
    isGranted 
  } = useNotifications();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testNotificationPermission = async () => {
    addTestResult('Testing notification permission...');
    
    if (!isSupported) {
      addTestResult('❌ Browser does not support notifications');
      return;
    }

    addTestResult(`✓ Browser supports notifications`);
    addTestResult(`Current permission: ${notificationPermission.permission}`);

    if (notificationPermission.permission === 'granted') {
      addTestResult('✓ Notifications already allowed');
      return;
    }

    if (notificationPermission.permission === 'denied') {
      addTestResult('❌ Notifications blocked in browser settings');
      return;
    }

    // Try to request permission
    const granted = await requestPermission();
    if (granted) {
      addTestResult('✅ Permission granted successfully!');
    } else {
      addTestResult('❌ Permission denied');
    }
  };

  const testDeviceNotification = () => {
    if (!isGranted) {
      addTestResult('❌ Cannot send device notification - permission not granted');
      return;
    }

    addTestResult('📱 Sending test device notification...');
    sendNotification('Test Notification', {
      body: 'This is a test notification from the Employee Management System',
      icon: '/favicon.ico',
      tag: 'test-notification'
    });
    addTestResult('✅ Device notification sent!');
  };

  const testSystemNotification = () => {
    addTestResult('🔔 Sending test system notification...');
    sendSystemNotification('system_update', 'This is a test system notification');
    addTestResult('✅ System notification sent!');
  };

  const testWebSocketConnection = () => {
    addTestResult('🌐 Testing WebSocket connection...');
    addTestResult(`Connection status: ${isConnected ? 'Connected (Live)' : 'Disconnected (Polling)'}`);
    
    if (isConnected) {
      addTestResult('✅ WebSocket is working correctly');
    } else {
      addTestResult('⚠️ Using polling fallback (WebSocket not connected)');
    }
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return <Badge className="bg-green-500"><Wifi className="w-3 h-3 mr-1" />Live</Badge>;
    } else {
      return <Badge variant="secondary"><WifiOff className="w-3 h-3 mr-1" />Polling</Badge>;
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Not Supported</Badge>;
    }
    
    switch (notificationPermission.permission) {
      case 'granted':
        return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" />Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Blocked</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Not Set</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Notification System Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test and debug the notification system functionality
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getConnectionStatus()}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? 'Real-time' : 'Every 10s'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Device Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getPermissionStatus()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
                <Bell className="w-3 h-3 mr-1" />
                {unreadCount} unread
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {notifications.length} total
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Buttons */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="w-5 h-5 mr-2" />
            Quick Tests
          </CardTitle>
          <CardDescription>
            Run these tests to verify the notification system is working
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={testNotificationPermission} className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Test Permission Request
            </Button>
            
            <Button 
              onClick={testDeviceNotification} 
              disabled={!isGranted}
              className="w-full"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Test Device Notification
            </Button>
            
            <Button onClick={testSystemNotification} className="w-full">
              <AlertCircle className="w-4 h-4 mr-2" />
              Test System Notification
            </Button>
            
            <Button onClick={testWebSocketConnection} className="w-full">
              <Wifi className="w-4 h-4 mr-2" />
              Test WebSocket Connection
            </Button>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {testResults.join('\n')}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Notifications */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Notifications
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No notifications yet
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 10).map((notification: any) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg border ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <NotificationSettings />
    </div>
  );
}