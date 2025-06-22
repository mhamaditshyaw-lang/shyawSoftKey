import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);

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

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      isLoading
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