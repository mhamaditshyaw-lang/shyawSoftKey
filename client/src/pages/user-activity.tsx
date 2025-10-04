import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { 
  Activity, Search, RefreshCw, Filter, Download, Calendar, User, 
  MessageSquare, CheckSquare, UserCheck, Clock, TrendingUp,
  BarChart3, Users, Award
} from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function UserActivityPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activityType, setActivityType] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Fetch data for user activities
  const { data: todosData, isLoading: todosLoading } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos");
      return await response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ["/api/feedback"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/feedback");
      return await response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ["/api/interviews"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/interviews");
      return await response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/users");
      return await response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const isLoading = todosLoading || feedbackLoading || interviewsLoading;

  // Process activity data
  const userActivities = [
    // Todo activities (created, assigned, completed)
    ...(todosData?.todoLists || []).flatMap((list: any) => [
      {
        id: `todo-created-${list.id}`,
        type: "todo_created",
        activityType: "todo",
        title: `Created todo list: ${list.title}`,
        description: `New todo list with ${list.items?.length || 0} tasks`,
        userName: list.createdBy ? `${list.createdBy.firstName} ${list.createdBy.lastName}` : 'Unknown',
        userRole: list.createdBy?.role || 'Unknown',
        priority: list.priority,
        status: list.items?.every((i: any) => i.isCompleted) ? 'completed' : 'active',
        createdAt: list.createdAt,
        icon: CheckSquare,
        color: "blue"
      },
      // Add assignment activity if assigned to someone else
      ...(list.assignedToId && list.assignedToId !== list.createdById ? [{
        id: `todo-assigned-${list.id}`,
        type: "todo_assigned",
        activityType: "todo",
        title: `Assigned todo list: ${list.title}`,
        description: `Todo list assigned from ${list.createdBy?.firstName} ${list.createdBy?.lastName}`,
        userName: list.assignedTo ? `${list.assignedTo.firstName} ${list.assignedTo.lastName}` : 'Unknown',
        userRole: list.assignedTo?.role || 'Unknown',
        priority: list.priority,
        status: 'assigned',
        createdAt: list.createdAt,
        icon: UserCheck,
        color: "green"
      }] : []),
      // Add completed todo activities
      ...(list.items || [])
        .filter((item: any) => item.isCompleted)
        .map((item: any) => ({
          id: `todo-completed-${item.id}`,
          type: "todo_completed",
          activityType: "todo",
          title: `Completed task: ${item.text}`,
          description: `Task completed in list: ${list.title}`,
          userName: list.assignedTo ? `${list.assignedTo.firstName} ${list.assignedTo.lastName}` : 
                    (list.createdBy ? `${list.createdBy.firstName} ${list.createdBy.lastName}` : 'Unknown'),
          userRole: list.assignedTo?.role || list.createdBy?.role || 'Unknown',
          priority: item.priority || list.priority,
          status: 'completed',
          createdAt: item.updatedAt || item.createdAt,
          icon: Award,
          color: "green"
        }))
    ]),

    // Feedback activities
    ...(feedbackData?.feedback || []).map((feedback: any) => ({
      id: `feedback-${feedback.id}`,
      type: "feedback_submitted",
      activityType: "feedback",
      title: `Submitted feedback: ${feedback.type}`,
      description: `Rating: ${feedback.rating}/5 - ${feedback.title || feedback.message?.substring(0, 50) || 'No description'}...`,
      userName: feedback.submittedBy ? `${feedback.submittedBy.firstName} ${feedback.submittedBy.lastName}` : 'Unknown',
      userRole: feedback.submittedBy?.role || 'Unknown',
      priority: feedback.rating >= 4 ? 'high' : feedback.rating >= 3 ? 'medium' : 'low',
      status: 'submitted',
      createdAt: feedback.createdAt,
      icon: MessageSquare,
      color: "purple"
    })),

    // Interview activities
    ...(interviewsData?.requests || []).map((interview: any) => ({
      id: `interview-${interview.id}`,
      type: "interview_scheduled",
      activityType: "interview",
      title: `Interview: ${interview.position}`,
      description: `Interview scheduled for ${interview.candidateName}`,
      userName: interview.candidateName || 'Unknown',
      userRole: 'candidate',
      priority: interview.status === 'urgent' ? 'high' : 'medium',
      status: interview.status || 'scheduled',
      createdAt: interview.createdAt,
      icon: Users,
      color: "orange"
    }))
  ];

  // Date filtering functions
  const isToday = (date: string): boolean => {
    const today = new Date();
    const entryDate = new Date(date);
    return (
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  };

  const isThisWeek = (date: string): boolean => {
    const today = new Date();
    const entryDate = new Date(date);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return entryDate >= startOfWeek && entryDate <= endOfWeek;
  };

  const isThisMonth = (date: string): boolean => {
    const today = new Date();
    const entryDate = new Date(date);
    return (
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  };

  const isCustomDate = (date: string): boolean => {
    if (!customDate) return false;
    const entryDate = new Date(date);
    const filterDate = new Date(customDate);
    return (
      entryDate.getDate() === filterDate.getDate() &&
      entryDate.getMonth() === filterDate.getMonth() &&
      entryDate.getFullYear() === filterDate.getFullYear()
    );
  };

  // Get unique users for filter dropdown
  const uniqueUsers = Array.from(new Set(userActivities.map(activity => activity.userName).filter(Boolean)));

  // Filter activities
  const filteredActivities = userActivities.filter((activity: any) => {
    // Activity type filter
    if (activityType !== "all" && activity.activityType !== activityType) {
      return false;
    }

    // User filter
    if (userFilter !== "all" && activity.userName !== userFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== "all" && activity.priority !== priorityFilter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        activity.title?.toLowerCase().includes(searchLower) ||
        activity.description?.toLowerCase().includes(searchLower) ||
        activity.userName?.toLowerCase().includes(searchLower) ||
        activity.userRole?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Date filter
    const itemDate = activity.createdAt || new Date().toISOString();
    switch (dateFilter) {
      case "today":
        return isToday(itemDate);
      case "week":
        return isThisWeek(itemDate);
      case "month":
        return isThisMonth(itemDate);
      case "custom":
        return isCustomDate(itemDate);
      case "all":
      default:
        return true;
    }
  });

  // Sort activities by date (newest first)
  const sortedActivities = filteredActivities.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Export data function
  const exportActivities = () => {
    const csvContent = [
      ["Type", "Title", "User", "Role", "Priority", "Status", "Date"],
      ...sortedActivities.map((activity: any) => [
        activity.type,
        activity.title,
        activity.userName,
        activity.userRole,
        activity.priority,
        activity.status,
        new Date(activity.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-activities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getActivityIcon = (activity: any) => {
    const IconComponent = activity.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case "todo_created":
      case "todo_assigned":
        return "bg-blue-100 text-blue-800";
      case "todo_completed":
        return "bg-green-100 text-green-800";
      case "feedback_submitted":
        return "bg-purple-100 text-purple-800";
      case "interview_scheduled":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "submitted":
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Activity statistics
  const activityStats = {
    total: sortedActivities.length,
    todayCount: sortedActivities.filter(a => isToday(a.createdAt)).length,
    weekCount: sortedActivities.filter(a => isThisWeek(a.createdAt)).length,
    monthCount: sortedActivities.filter(a => isThisMonth(a.createdAt)).length,
    todoActivities: sortedActivities.filter(a => a.activityType === "todo").length,
    feedbackActivities: sortedActivities.filter(a => a.activityType === "feedback").length,
    interviewActivities: sortedActivities.filter(a => a.activityType === "interview").length
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {t("userActivityDashboard")}
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              {t("trackMonitorActivities")}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={exportActivities} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t("exportCsv")}
            </Button>
            <Button onClick={() => queryClient.invalidateQueries()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("refresh")}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">{t("totalActivities")}</p>
                  <p className="text-2xl font-bold">{activityStats.total}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium">{t("today")}</p>
                  <p className="text-2xl font-bold">{activityStats.todayCount}</p>
                </div>
                <Clock className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs font-medium">{t("thisWeekActivities")}</p>
                  <p className="text-2xl font-bold">{activityStats.weekCount}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium">{t("thisMonthActivities")}</p>
                  <p className="text-2xl font-bold">{activityStats.monthCount}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-xs font-medium">{t("taskActivities")}</p>
                  <p className="text-2xl font-bold">{activityStats.todoActivities}</p>
                </div>
                <CheckSquare className="w-8 h-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-xs font-medium">{t("feedbackActivities")}</p>
                  <p className="text-2xl font-bold">{activityStats.feedbackActivities}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs font-medium">{t("interviewActivities")}</p>
                  <p className="text-2xl font-bold">{activityStats.interviewActivities}</p>
                </div>
                <Users className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Activity Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Search Activities</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Activity Type Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Activity Type</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Activities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="todo">Todo Activities</SelectItem>
                    <SelectItem value="feedback">Feedback Activities</SelectItem>
                    <SelectItem value="interview">Interview Activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by User</Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map((userName) => (
                      <SelectItem key={userName} value={userName}>{userName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Priority</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date Filter</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Date</SelectItem>
                    <SelectItem value="all">All Dates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date */}
              {dateFilter === "custom" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Date</Label>
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
              )}

              {/* Auto Refresh */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Auto Refresh</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                  <span className="text-sm text-gray-600">
                    {autoRefresh ? "30s" : "Off"}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing {sortedActivities.length} of {userActivities.length} total activities
                  {activityType !== "all" && ` • Type: ${activityType}`}
                  {userFilter !== "all" && ` • User: ${userFilter}`}
                  {priorityFilter !== "all" && ` • Priority: ${priorityFilter}`}
                  {dateFilter !== "all" && ` • Date: ${dateFilter === "custom" ? customDate : dateFilter}`}
                  {searchTerm && ` • Search: "${searchTerm}"`}
                </span>
                {(searchTerm || dateFilter !== "all" || activityType !== "all" || userFilter !== "all" || priorityFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setDateFilter("today");
                      setActivityType("all");
                      setUserFilter("all");
                      setPriorityFilter("all");
                      setCustomDate("");
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              User Activities Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-500">
                  {searchTerm || dateFilter !== "all" || activityType !== "all" || userFilter !== "all" || priorityFilter !== "all"
                    ? "No activities match your current filters."
                    : "No user activities available."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedActivities.map((activity: any) => (
                  <div 
                    key={activity.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2 flex-wrap">
                          {getActivityIcon(activity)}
                          <h3 className="font-medium text-gray-900">{activity.title}</h3>
                          <Badge className={getActivityBadgeColor(activity.type)}>
                            {activity.type.replace('_', ' ')}
                          </Badge>
                          {activity.status && (
                            <Badge className={getStatusBadgeColor(activity.status)}>
                              {activity.status}
                            </Badge>
                          )}
                          {activity.priority && (
                            <Badge className={getPriorityBadgeColor(activity.priority)}>
                              {activity.priority} priority
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{getRelativeTime(activity.createdAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{activity.userName} ({activity.userRole})</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}