import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  Circle, 
  Search, 
  Filter,
  RefreshCw,
  Trash2,
  MarkAsRead,
  Settings,
  Users,
  MessageSquare,
  Calendar,
  Shield,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: number;
  relatedItemId?: number;
  relatedItemType?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'user_created':
      return <Users className="w-4 h-4" />;
    case 'interview_request':
      return <Calendar className="w-4 h-4" />;
    case 'interview_status':
      return <Shield className="w-4 h-4" />;
    case 'todo_assigned':
      return <MessageSquare className="w-4 h-4" />;
    case 'todo_completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'system':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'user_created':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'interview_request':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'interview_status':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'todo_assigned':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'todo_completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'system':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function NotificationManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/device-notifications'],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('PATCH', `/api/device-notifications/${notificationId}`, { isRead: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-notifications'] });
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      apiRequest('PATCH', '/api/device-notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('DELETE', `/api/device-notifications/${notificationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-notifications'] });
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete notification",
        variant: "destructive",
      });
    }
  });

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "read" && notification.isRead) ||
                         (filterStatus === "unread" && !notification.isRead);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
  const notificationTypes = [...new Set(notifications.map((n: Notification) => n.type))];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in to view notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
                <p className="text-gray-600">Manage all your system notifications</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-sm">
                {unreadCount} Unread
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <BellOff className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Types</p>
                  <p className="text-2xl font-bold text-blue-600">{notificationTypes.length}</p>
                </div>
                <Settings className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Notifications</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by title or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="type-filter">Filter by Type</Label>
                <select
                  id="type-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Types</option>
                  {notificationTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="status-filter">Filter by Status</Label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications Found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterType !== "all" || filterStatus !== "all" 
                    ? "No notifications match your current filters." 
                    : "You don't have any notifications yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification: Notification) => (
              <Card key={notification.id} className={cn(
                "transition-all duration-200",
                !notification.isRead && "bg-blue-50 border-blue-200"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={cn(
                        "p-2 rounded-lg",
                        getNotificationColor(notification.type)
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {notification.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{notification.message}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            {format(new Date(notification.createdAt), 'PPp')}
                          </span>
                          {notification.relatedItemType && (
                            <span>
                              Related to: {notification.relatedItemType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}