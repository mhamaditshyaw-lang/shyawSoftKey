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

export default function AllDataPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataType, setDataType] = useState("all");

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
      title: "Operational Data",
      description: `Ice Cream: ${item.dayIceCream || 0}/${item.nightIceCream || 0} | Albany: ${item.dayAlbany || 0}/${item.nightAlbany || 0}`,
    })),
    ...(interviewsData?.requests || []).map((item: any) => ({
      ...item,
      type: "interview",
      title: `Interview: ${item.position}`,
      description: `Employee: ${item.candidateName} | Status: ${item.status}`,
    })),
    ...(todosData?.todoLists || []).map((item: any) => ({
      ...item,
      type: "todo",
      title: `Todo: ${item.title}`,
      description: `${item.items?.length || 0} tasks | Priority: ${item.priority}`,
    })),
    ...(feedbackData?.feedback || []).map((item: any) => ({
      ...item,
      type: "feedback",
      title: `Feedback: ${item.type}`,
      description: `Rating: ${item.rating}/5 | ${item.message?.substring(0, 50)}...`,
    })),
    ...(archiveData?.archivedItems || []).map((item: any) => ({
      ...item,
      type: "archive",
      title: `Archived: ${item.itemType}`,
      description: `Reason: ${item.reason} | ID: ${item.itemId}`,
    })),
    ...(usersData?.users || []).map((item: any) => ({
      ...item,
      type: "user",
      title: `User: ${item.username}`,
      description: `${item.firstName} ${item.lastName} | Role: ${item.role}`,
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

  // Filter data
  const filteredData = allData.filter((item: any) => {
    // Data type filter
    if (dataType !== "all" && item.type !== dataType) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.username?.toLowerCase().includes(searchLower) ||
        item.position?.toLowerCase().includes(searchLower) ||
        item.candidateName?.toLowerCase().includes(searchLower);
      
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
      ["Type", "Title", "Description", "Created Date", "Status"],
      ...filteredData.map((item: any) => [
        item.type,
        item.title,
        item.description,
        new Date(item.createdAt || item.updatedAt || new Date()).toLocaleDateString(),
        item.status || item.role || "N/A"
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

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">All Data Dashboard</h2>
            <p className="text-gray-600">Comprehensive view of all system data with advanced filtering</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={exportData}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => queryClient.invalidateQueries()}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Operational</p>
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
                <p className="text-green-100 text-xs font-medium">Interviews</p>
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
                <p className="text-yellow-100 text-xs font-medium">Todos</p>
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
                <p className="text-purple-100 text-xs font-medium">Feedback</p>
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
                <p className="text-gray-100 text-xs font-medium">Archive</p>
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
                <p className="text-red-100 text-xs font-medium">Users</p>
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
            Advanced Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Search All Data</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search across all data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Data Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data Type</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="operational">Operational Data</SelectItem>
                  <SelectItem value="interview">Interviews</SelectItem>
                  <SelectItem value="todo">Todo Lists</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="archive">Archived Items</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
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
                  {autoRefresh ? "Every 30s" : "Off"}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing {filteredData.length} of {allData.length} total records
                {dataType !== "all" && ` • Type: ${dataType}`}
                {dateFilter !== "all" && ` • Date: ${dateFilter === "custom" ? customDate : dateFilter}`}
                {searchTerm && ` • Search: "${searchTerm}"`}
              </span>
              {(searchTerm || dateFilter !== "all" || dataType !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("all");
                    setDataType("all");
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

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            All System Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
              <p className="text-gray-500">
                {searchTerm || dateFilter !== "all" || dataType !== "all"
                  ? "No data matches your current filters."
                  : "No data available in the system."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((item: any, index: number) => (
                <div key={`${item.type}-${item.id || index}`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(item.type)}
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <Badge className={getTypeBadgeColor(item.type)}>
                          {item.type}
                        </Badge>
                        {item.status && (
                          <Badge variant="outline">
                            {item.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{getRelativeTime(item.createdAt || item.updatedAt || new Date())}</span>
                        </span>
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