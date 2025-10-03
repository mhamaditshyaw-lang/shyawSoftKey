import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Database, Search, RefreshCw, Filter, Download, Calendar, User, MessageSquare, Archive, CheckSquare } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function AllDataPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataType, setDataType] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Helper to translate dynamic enum values with fallback
  const translateDynamicValue = (namespace: string, value: string | undefined): string => {
    if (!value) return t('unknown');
    const key = `enums.${namespace}.${value}`;
    const translated = t(key);
    // Return translated value if found, otherwise return unknown instead of raw value
    return translated !== key ? translated : t('unknown');
  };

  // Fetch all data from different endpoints
  const { data: operationalData } = useQuery({
    queryKey: ["/api/operational-data"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/operational-data");
      return await response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: interviewsData } = useQuery({
    queryKey: ["/api/interviews"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/interviews");
      return await response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: todosData } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos");
      return await response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: feedbackData } = useQuery({
    queryKey: ["/api/feedback"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/feedback");
      return await response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: archiveData } = useQuery({
    queryKey: ["/api/archive"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/archive");
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

  // Combine all data into a unified format
  const allData = [
    ...(operationalData?.entries || []).map((item: any) => ({
      ...item,
      type: "operational",
      title: t('operationalData'),
      description: `${t('iceCream')}: ${item.dayIceCream || 0}/${item.nightIceCream || 0} | ${t('albany')}: ${item.dayAlbany || 0}/${item.nightAlbany || 0}`,
    })),
    ...(interviewsData?.requests || []).map((item: any) => ({
      ...item,
      type: "interview",
      title: t('interviewPosition', { position: item.position }),
      description: `${t('employee')}: ${item.candidateName} | ${t('statusLabel')}: ${translateDynamicValue('status', item.status || 'pending')}`,
      userName: item.candidateName || t('unknown'),
      userRole: t('candidate'),
      priority: item.status === 'urgent' ? 'high' : 'medium',
      status: item.status || 'pending',
    })),
    ...(todosData?.todoLists || []).map((item: any) => ({
      ...item,
      type: "todo",
      title: t('todoList', { title: item.title }),
      description: `${t('tasksCount', { count: item.items?.length || 0 })} | ${t('priority')}: ${item.priority ? t(`enums.priority.${item.priority}`) : t('unknown')}`,
      userName: item.assignedTo ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}` : (item.createdBy ? `${item.createdBy.firstName} ${item.createdBy.lastName}` : t('unknown')),
      userRole: item.assignedTo?.role ? t(`enums.role.${item.assignedTo.role}`) : (item.createdBy?.role ? t(`enums.role.${item.createdBy.role}`) : t('unknown')),
      priority: item.priority,
      status: item.items?.every((i: any) => i.isCompleted) ? 'completed' : (item.items?.some((i: any) => i.isCompleted) ? 'in-progress' : 'pending'),
    })),
    ...(feedbackData?.feedback || []).map((item: any) => ({
      ...item,
      type: "feedback",
      title: `${t('feedback')}: ${translateDynamicValue('feedbackType', item.type)}`,
      description: `${t('ratingOutOf5', { rating: item.rating })} | ${item.title || item.message?.substring(0, 50) || t('noDescription')}...`,
      userName: item.submittedBy ? `${item.submittedBy.firstName} ${item.submittedBy.lastName}` : t('unknown'),
      userRole: item.submittedBy?.role ? translateDynamicValue('role', item.submittedBy.role) : t('unknown'),
      priority: item.rating >= 4 ? 'high' : item.rating >= 3 ? 'medium' : 'low',
      status: item.rating ? 'completed' : 'pending',
    })),
    ...(archiveData?.archivedItems || []).map((item: any) => ({
      ...item,
      type: "archive",
      title: `${t('archived')}: ${translateDynamicValue('archiveItemType', item.itemType)}`,
      description: `${t('reasonLabel')}: ${item.reason} | ${t('itemId')}: ${item.itemId}`,
    })),
    ...(usersData?.users || []).map((item: any) => ({
      ...item,
      type: "user",
      title: t('userUsername', { username: item.username }),
      description: `${item.firstName} ${item.lastName} | ${t('role')}: ${item.role ? t(`enums.role.${item.role}`) : t('unknown')}`,
      userName: `${item.firstName} ${item.lastName}`,
      userRole: item.role ? t(`enums.role.${item.role}`) : t('unknown'),
      priority: item.role === 'admin' ? 'high' : item.role === 'manager' ? 'medium' : 'low',
      status: 'active',
    })),
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
  const uniqueUsers = Array.from(new Set(allData.map((item: any) => item.userName).filter(Boolean)));

  // Filter data
  const filteredData = allData.filter((item: any) => {
    // Data type filter
    if (dataType !== "all" && item.type !== dataType) {
      return false;
    }

    // User filter
    if (userFilter !== "all" && item.userName !== userFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== "all" && item.priority !== priorityFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.username?.toLowerCase().includes(searchLower) ||
        item.userName?.toLowerCase().includes(searchLower) ||
        item.position?.toLowerCase().includes(searchLower) ||
        item.candidateName?.toLowerCase().includes(searchLower) ||
        item.userRole?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Date filter
    const itemDate = item.createdAt || item.updatedAt || new Date().toISOString();
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

  // Export data function
  const exportData = () => {
    const csvContent = [
      [t('csvHeaders.type'), t('csvHeaders.title'), t('csvHeaders.description'), t('csvHeaders.createdDate'), t('csvHeaders.status')],
      ...filteredData.map((item: any) => [
        t(`enums.dataType.${item.type}`) || item.type,
        item.title,
        item.description,
        new Date(item.createdAt || item.updatedAt || new Date()).toLocaleDateString(),
        item.status ? translateDynamicValue('status', item.status) : (item.role ? translateDynamicValue('role', item.role) : t('naValue'))
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "operational":
        return <Database className="w-4 h-4" />;
      case "interview":
        return <User className="w-4 h-4" />;
      case "todo":
        return <CheckSquare className="w-4 h-4" />;
      case "feedback":
        return <MessageSquare className="w-4 h-4" />;
      case "archive":
        return <Archive className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "operational":
        return "bg-blue-100 text-blue-800";
      case "interview":
        return "bg-green-100 text-green-800";
      case "todo":
        return "bg-yellow-100 text-yellow-800";
      case "feedback":
        return "bg-purple-100 text-purple-800";
      case "archive":
        return "bg-gray-100 text-gray-800";
      case "user":
        return "bg-red-100 text-red-800";
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
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t('allDataDashboard')}</h2>
            <p className="text-sm md:text-base text-gray-600">{t('allDataDashboardDesc')}</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={exportData}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('exportCsv')}
            </Button>
            <Button
              onClick={() => queryClient.invalidateQueries()}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('refreshAll')}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">{t('operational')}</p>
                <p className="text-2xl font-bold">{operationalData?.entries?.length || 0}</p>
              </div>
              <Database className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">{t('interviews')}</p>
                <p className="text-2xl font-bold">{interviewsData?.requests?.length || 0}</p>
              </div>
              <User className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs font-medium">{t('todos')}</p>
                <p className="text-2xl font-bold">{todosData?.todoLists?.length || 0}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">{t('feedback')}</p>
                <p className="text-2xl font-bold">{feedbackData?.feedback?.length || 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-xs font-medium">{t('archive')}</p>
                <p className="text-2xl font-bold">{archiveData?.archivedItems?.length || 0}</p>
              </div>
              <Archive className="w-8 h-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs font-medium">{t('users')}</p>
                <p className="text-2xl font-bold">{usersData?.users?.length || 0}</p>
              </div>
              <User className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            {t('advancedFilters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">{t('searchAllData')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Data Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('dataType')}</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="operational">{t('operationalData')}</SelectItem>
                  <SelectItem value="interview">{t('interviews')}</SelectItem>
                  <SelectItem value="todo">{t('todoLists')}</SelectItem>
                  <SelectItem value="feedback">{t('feedback')}</SelectItem>
                  <SelectItem value="archive">{t('archivedItems')}</SelectItem>
                  <SelectItem value="user">{t('users')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('dateFilter')}</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t('today')}</SelectItem>
                  <SelectItem value="week">{t('thisWeek')}</SelectItem>
                  <SelectItem value="month">{t('thisMonth')}</SelectItem>
                  <SelectItem value="custom">{t('customDate')}</SelectItem>
                  <SelectItem value="all">{t('allDates')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date */}
            {dateFilter === "custom" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('selectDate')}</Label>
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              </div>
            )}

            {/* User Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('filterByUser')}</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('allUsers')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allUsers')}</SelectItem>
                  {uniqueUsers.map((userName) => (
                    <SelectItem key={userName} value={userName}>{userName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('filterByPriority')}</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('allPriorities')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allPriorities')}</SelectItem>
                  <SelectItem value="high">{t('highPriority')}</SelectItem>
                  <SelectItem value="medium">{t('mediumPriority')}</SelectItem>
                  <SelectItem value="low">{t('lowPriority')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('filterByStatus')}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="pending">{t('pending')}</SelectItem>
                  <SelectItem value="in-progress">{t('inProgressStatus')}</SelectItem>
                  <SelectItem value="completed">{t('completed')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto Refresh */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('autoRefresh')}</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <span className="text-sm text-gray-600">
                  {autoRefresh ? t('every30s') : t('off')}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {t('showing')} {filteredData.length} {t('of')} {allData.length} {t('totalRecords')}
                {dataType !== "all" && ` • ${t('type')}: ${dataType}`}
                {userFilter !== "all" && ` • ${t('user')}: ${userFilter}`}
                {priorityFilter !== "all" && ` • ${t('priority')}: ${priorityFilter}`}
                {statusFilter !== "all" && ` • ${t('status')}: ${statusFilter}`}
                {dateFilter !== "all" && ` • ${t('date')}: ${dateFilter === "custom" ? customDate : dateFilter}`}
                {searchTerm && ` • ${t('search')}: "${searchTerm}"`}
              </span>
              {(searchTerm || dateFilter !== "all" || dataType !== "all" || userFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("all");
                    setDataType("all");
                    setUserFilter("all");
                    setPriorityFilter("all");
                    setStatusFilter("all");
                    setCustomDate("");
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {t('clearFilters')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            {t('allSystemData')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noDataFound')}</h3>
              <p className="text-gray-500">
                {searchTerm || dateFilter !== "all" || dataType !== "all"
                  ? t('noDataMatchesFilters')
                  : t('noDataAvailable')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((item: any, index: number) => (
                <div key={`${item.type}-${item.id || index}`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2 flex-wrap">
                        {getTypeIcon(item.type)}
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <Badge className={getTypeBadgeColor(item.type)}>
                          {translateDynamicValue('dataType', item.type)}
                        </Badge>
                        {item.status && (
                          <Badge className={getStatusBadgeColor(item.status)}>
                            {translateDynamicValue('status', item.status)}
                          </Badge>
                        )}
                        {item.priority && (
                          <Badge className={getPriorityBadgeColor(item.priority)}>
                            {translateDynamicValue('priority', item.priority)} {t('priority')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{getRelativeTime(item.createdAt || item.updatedAt || new Date())}</span>
                        </span>
                        {item.userName && (
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{item.userName} ({item.userRole})</span>
                          </span>
                        )}
                        {item.id && (
                          <span>ID: {item.id}</span>
                        )}
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
  );
}