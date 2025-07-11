import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface DeviceNotificationPermission {
  permission: 'default' | 'granted' | 'denied';
  supported: boolean;
}

interface DeviceNotificationContextType {
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  isLoading: boolean;
  // Device notification functions
  permission: DeviceNotificationPermission;
  requestPermission: () => Promise<boolean>;
  sendDeviceNotification: (title: string, options?: NotificationOptions) => void;
  createTestNotification: () => void;
  isSupported: boolean;
  isGranted: boolean;
}

const DeviceNotificationContext = createContext<DeviceNotificationContextType | undefined>(undefined);

export function DeviceNotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [permission, setPermission] = useState<DeviceNotificationPermission>({
    permission: 'default',
    supported: false
  });

  // Check notification support and permission
  useEffect(() => {
    const supported = 'Notification' in window;
    const currentPermission = supported ? Notification.permission : 'denied';
    
    setPermission({
      permission: currentPermission,
      supported
    });
  }, []);

  // Query for notifications with polling
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["/api/device-notifications"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/device-notifications");
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
    refetchIntervalInBackground: true,
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  // Request permission mutation
  const requestPermission = async (): Promise<boolean> => {
    if (!permission.supported) {
      toast({
        title: "Not Supported",
        description: "Device notifications are not supported in this browser.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(prev => ({ ...prev, permission: result }));
      
      if (result === 'granted') {
        toast({
          title: "Success!",
          description: "Device notifications enabled successfully.",
        });
        return true;
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Send device notification
  const sendDeviceNotification = (title: string, options?: NotificationOptions) => {
    if (!permission.supported || permission.permission !== 'granted') {
      console.warn('Device notifications not available');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'employee-management',
        requireInteraction: false,
        ...options,
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing device notification:', error);
    }
  };

  // Create test notification
  const createTestNotification = async () => {
    try {
      await authenticatedRequest("POST", "/api/device-notifications/test");
      
      toast({
        title: "Test Sent",
        description: "Test notification has been created.",
      });
      
      // Refresh notifications
      queryClient.invalidateQueries({ queryKey: ["/api/device-notifications"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedRequest("PATCH", `/api/device-notifications/${id}`, { isRead: true });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await authenticatedRequest("PATCH", "/api/device-notifications/mark-all-read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-notifications"] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedRequest("DELETE", `/api/device-notifications/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-notifications"] });
    },
  });

  // Listen for new notifications and show device notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      if (unreadNotifications.length > 0) {
        const latestNotification = unreadNotifications[0];
        
        // Show browser notification if permission granted
        if (permission.permission === 'granted') {
          sendDeviceNotification(latestNotification.title, {
            body: latestNotification.message,
            icon: latestNotification.icon || '🔔',
            tag: `notification-${latestNotification.id}`,
          });
        }
        
        // Always play notification sound for unread notifications
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGm9vz0H4yBSl+zPLaizsIGGS57t2QQAoUXrTp66hVFApGm9vz0H4yBSl+zPLaizsIGGS57t2QQAoUXrTp66hVFApGm9vz0H4yBSl+zPLaizsIGGS57t2QQAoUXrTp66hVFApGm9vz0H4yBSl+zPLaizsIGGS57t2QQAoUXrTp66hVFApGm9vz0H4yBSl+zPLaizsIGGS57t2QQAoUXrTp66hVFA==');
          audio.volume = 0.3;
          audio.play().catch(e => console.log('Could not play notification sound:', e));
        } catch (e) {
          console.log('Audio not supported:', e);
        }
        
        // Show toast notification as fallback
        if (permission.permission !== 'granted') {
          toast({
            title: latestNotification.title,
            description: latestNotification.message,
            duration: 5000,
          });
        }
      }
    }
  }, [notifications, permission.permission]);

  const value: DeviceNotificationContextType = {
    notifications,
    unreadCount,
    markAsRead: (id: number) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (id: number) => deleteNotificationMutation.mutate(id),
    isLoading,
    permission,
    requestPermission,
    sendDeviceNotification,
    createTestNotification,
    isSupported: permission.supported,
    isGranted: permission.permission === 'granted',
  };

  return (
    <DeviceNotificationContext.Provider value={value}>
      {children}
    </DeviceNotificationContext.Provider>
  );
}

export function useDeviceNotifications() {
  const context = useContext(DeviceNotificationContext);
  if (context === undefined) {
    throw new Error('useDeviceNotifications must be used within a DeviceNotificationProvider');
  }
  return context;
}