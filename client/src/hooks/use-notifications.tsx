import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface NotificationPermission {
  permission: 'default' | 'granted' | 'denied';
  supported: boolean;
}

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  isLoading: boolean;
  // Device notification functions
  notificationPermission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  sendSystemNotification: (type: string, message: string, data?: any) => void;
  isSupported: boolean;
  isGranted: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>({
    permission: 'default',
    supported: false
  });

  // Check notification support on mount
  useEffect(() => {
    const supported = 'Notification' in window;
    setNotificationPermission({
      permission: supported ? Notification.permission : 'denied',
      supported
    });
  }, []);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/notifications");
      return await response.json();
    },
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedRequest("PATCH", `/api/notifications/${id}`, {
        isRead: true
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await authenticatedRequest("PATCH", "/api/notifications/mark-all-read");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (lastNotificationId && latestNotification.id > lastNotificationId && !latestNotification.isRead) {
        toast({
          title: latestNotification.title,
          description: latestNotification.message,
          duration: 5000,
        });
      }
      setLastNotificationId(latestNotification.id);
    }
  }, [notifications, lastNotificationId, toast]);

  const markAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Device notification functions
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
      data,
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      isLoading,
      notificationPermission,
      requestPermission,
      sendNotification,
      sendSystemNotification,
      isSupported: notificationPermission.supported,
      isGranted: notificationPermission.permission === 'granted'
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}