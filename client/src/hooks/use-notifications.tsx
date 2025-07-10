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
  // Real-time connection status
  isConnected: boolean;
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
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>({
    permission: 'default',
    supported: false
  });

  // Check notification support on mount and track permission changes
  useEffect(() => {
    const supported = 'Notification' in window;
    const currentPermission = supported ? Notification.permission : 'denied';
    
    setNotificationPermission({
      permission: currentPermission,
      supported
    });
    
    // Listen for permission changes
    if (supported) {
      const checkPermission = () => {
        const newPermission = Notification.permission;
        setNotificationPermission(prev => ({
          ...prev,
          permission: newPermission
        }));
      };
      
      // Check permission every 1 second to detect changes
      const permissionInterval = setInterval(checkPermission, 1000);
      
      return () => clearInterval(permissionInterval);
    }
  }, [user]);

  // WebSocket connection setup
  useEffect(() => {
    if (user && token) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      try {
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          // Authenticate the connection
          ws.send(JSON.stringify({ type: 'auth', token }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case 'auth_success':
                setIsConnected(true);
                console.log('WebSocket authenticated for user:', data.userId);
                break;
                
              case 'notification':
                // Handle real-time notification
                handleRealtimeNotification(data.data);
                // Refresh notifications list
                queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
                break;
                
              case 'heartbeat':
                // Connection is alive
                break;
                
              case 'auth_error':
              case 'error':
                console.error('WebSocket error:', data.message);
                setIsConnected(false);
                break;
            }
          } catch (error) {
            console.error('WebSocket message parsing error:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          setWsConnection(null);
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (user && token) {
              console.log('Attempting WebSocket reconnection...');
            }
          }, 5000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
        
        setWsConnection(ws);
        
        // Cleanup on unmount
        return () => {
          ws.close();
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
      }
    }
    
    return () => {
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
        setIsConnected(false);
      }
    };
  }, [user, token]);

  // Handle real-time notifications
  const handleRealtimeNotification = (notification: any) => {
    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000,
    });
    
    // Send device notification if permissions are granted
    if (notificationPermission.permission === 'granted') {
      sendSystemNotification(notification.type, notification.message, notification.data);
    }
  };

  // Optimized query with reduced polling when WebSocket is connected
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/notifications");
      return await response.json();
    },
    enabled: !!user,
    refetchInterval: isConnected ? 30000 : 10000, // 30s if WebSocket connected, 10s otherwise
    refetchIntervalInBackground: false, // Disable background polling when WebSocket is active
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when connection is restored
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

  // Show toast and system notifications for new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (lastNotificationId && latestNotification.id > lastNotificationId && !latestNotification.isRead) {
        // Show in-app toast notification
        toast({
          title: latestNotification.title,
          description: latestNotification.message,
          duration: 6000,
        });
        
        // Send system/device notification if permission granted
        if (notificationPermission.permission === 'granted') {
          sendSystemNotification(latestNotification.type, latestNotification.message);
        }
      }
      setLastNotificationId(latestNotification.id);
    }
  }, [notifications, lastNotificationId, toast, notificationPermission.permission]);

  const markAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Device notification functions
  const requestPermission = async (): Promise<boolean> => {
    console.log('Requesting notification permission...');
    
    if (!notificationPermission.supported) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
      return false;
    }

    // Check current permission
    const currentPermission = Notification.permission;
    console.log('Current permission:', currentPermission);
    
    if (currentPermission === 'granted') {
      setNotificationPermission(prev => ({ ...prev, permission: 'granted' }));
      return true;
    }

    if (currentPermission === 'denied') {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      
      // Update state immediately
      setNotificationPermission(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled! 🔔",
          description: "You'll now receive device notifications",
        });
        
        // Send a test notification to confirm it works
        setTimeout(() => {
          sendNotification('Test Notification', {
            body: 'Device notifications are now working!',
            icon: '/favicon.ico'
          });
        }, 1000);
        
        return true;
      } else if (permission === 'denied') {
        toast({
          title: "Notifications Disabled",
          description: "You can enable them later in browser settings",
          variant: "destructive"
        });
        return false;
      } else {
        toast({
          title: "Notifications Not Set",
          description: "Permission request was dismissed",
          variant: "secondary"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request notification permissions",
        variant: "destructive"
      });
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
      isConnected,
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