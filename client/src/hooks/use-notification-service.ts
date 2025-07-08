import { useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNotifications } from '@/hooks/use-notifications.ts';
import { authenticatedRequest } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useNotificationService() {
  const { sendSystemNotification, isGranted } = useNotifications();
  const lastNotificationId = useRef<number>(0);
  const { toast } = useToast();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/notifications");
      return await response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  const notifications = notificationsData?.notifications || [];

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await authenticatedRequest("PATCH", `/api/notifications/${notificationId}`, {
        isRead: true
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await authenticatedRequest("PATCH", "/api/notifications/mark-all-read");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  });

  const markAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  useEffect(() => {
    if (!isGranted || notifications.length === 0) return;

    // Find new notifications since last check
    const newNotifications = notifications.filter((notification: any) => {
      return notification.id > lastNotificationId.current && !notification.isRead;
    });

    if (newNotifications.length === 0) return;

    // Update the last notification ID
    const maxId = Math.max(...notifications.map((n: any) => n.id));
    lastNotificationId.current = maxId;

    // Send device notifications for new notifications
    newNotifications.forEach((notification: any) => {
      let message = notification.message;
      
      // Customize message based on notification type
      switch (notification.type) {
        case 'user_created':
          message = `New employee ${notification.data?.userName || 'added'} has been created in the system`;
          break;
        case 'interview_request':
          message = `New interview request for ${notification.data?.position || 'position'} needs your attention`;
          break;
        case 'interview_status':
          message = `Interview request status changed to ${notification.data?.status || 'updated'}`;
          break;
        case 'todo_assigned':
          message = `You have been assigned a new task: ${notification.data?.title || 'Task'}`;
          break;
        case 'todo_completed':
          message = `Task "${notification.data?.title || 'Task'}" has been completed`;
          break;
        case 'feedback_submitted':
          message = `New feedback has been submitted by ${notification.data?.submitterName || 'user'}`;
          break;
        default:
          message = notification.message || 'You have a new notification';
      }

      sendSystemNotification(notification.type, message, notification.data);
    });
  }, [notifications, isGranted, sendSystemNotification]);

  return {
    notifications,
    unreadCount: notifications.filter((n: any) => !n.isRead).length,
    markAsRead,
    markAllAsRead,
    isLoading
  };
}