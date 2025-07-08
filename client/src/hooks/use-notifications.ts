import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPermission {
  permission: 'default' | 'granted' | 'denied';
  supported: boolean;
}

export function useNotifications() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>({
    permission: 'default',
    supported: false
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window;
    setNotificationPermission({
      permission: supported ? Notification.permission : 'denied',
      supported
    });
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!notificationPermission.supported) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive device notifications",
        });
        return true;
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You won't receive device notifications",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!notificationPermission.supported || Notification.permission !== 'granted') {
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'employee-management',
      requireInteraction: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const sendSystemNotification = (type: string, message: string, data?: any) => {
    let title = '';
    let body = message;
    let icon = '/favicon.ico';

    switch (type) {
      case 'user_created':
        title = '👤 New Employee Added';
        break;
      case 'interview_request':
        title = '📋 Interview Request';
        break;
      case 'interview_status':
        title = '✅ Interview Status Update';
        break;
      case 'todo_assigned':
        title = '📝 Task Assigned';
        break;
      case 'todo_completed':
        title = '✅ Task Completed';
        break;
      case 'feedback_submitted':
        title = '💬 New Feedback';
        break;
      default:
        title = '🔔 System Notification';
    }

    sendNotification(title, {
      body,
      icon,
      data,
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  };

  return {
    notificationPermission,
    requestPermission,
    sendNotification,
    sendSystemNotification,
    isSupported: notificationPermission.supported,
    isGranted: notificationPermission.permission === 'granted'
  };
}