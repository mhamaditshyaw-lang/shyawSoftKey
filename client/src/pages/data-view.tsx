import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Users,
  BarChart3,
  Clock,
  Truck,
  TrendingUp,
  RefreshCw,
  Download,
  Database,
  Search,
  Trash2,
  Calendar,
  Filter,
} from "lucide-react";

interface DataEntry {
  id: number;
  type: string;
  data: Record<string, any>;
  stats?: {
    total: number;
    average: number;
    max: number;
    min: number;
  };
  createdAt: string;
  createdBy?: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

export default function DataViewPage() {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [customDate, setCustomDate] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    entry?: DataEntry;
    isClearing?: boolean;
  }>({ isOpen: false });
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch operational data from API using authenticated request
  const { data: operationalDataResponse, refetch } = useQuery({
    queryKey: ["/api/operational-data"],
    queryFn: async () => {
      const { authenticatedRequest } = await import("@/lib/auth");
      const response = await authenticatedRequest("GET", "/api/operational-data");
      return await response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
    retry: false,
    enabled: !!user, // Only fetch when user is authenticated
  });

  const allData: DataEntry[] = operationalDataResponse?.entries || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "employee":
        return <Users className="w-4 h-4 text-blue-600" />;
      case "operations":
        return <BarChart3 className="w-4 h-4 text-green-600" />;
      case "staffCount":
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case "yesterdayProduction":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "yesterdayLoading":
        return <Truck className="w-4 h-4 text-teal-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "employee":
        return "Employee";
      case "operations":
        return "Operations";
      case "staffCount":
        return "Staff Count";
      case "yesterdayProduction":
        return "Production";
      case "yesterdayLoading":
        return "Loading";
      default:
        return type;
    }
  };



  // Date filtering functions
  const isToday = (date: string): boolean => {
    const today = new Date();
    const entryDate = new Date(date);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    entryDate.setHours(0, 0, 0, 0);
    
    return entryDate.getTime() === today.getTime();
  };

  const isThisWeek = (date: string): boolean => {
    const today = new Date();
    const entryDate = new Date(date);
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get end of current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
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
    
    try {
      const entryDate = new Date(date);
      const filterDate = new Date(customDate);
      
      // Get date parts for accurate comparison
      const entryYear = entryDate.getFullYear();
      const entryMonth = entryDate.getMonth();
      const entryDay = entryDate.getDate();
      
      const filterYear = filterDate.getFullYear();
      const filterMonth = filterDate.getMonth();
      const filterDay = filterDate.getDate();
      
      return entryYear === filterYear && entryMonth === filterMonth && entryDay === filterDay;
    } catch (error) {
      return false;
    }
  };

  // Filter data
  const filteredData = (() => {
    let data =
      filter === "all" ? allData : allData.filter((d) => d.type === filter);

    // Apply date filtering
    if (dateFilter !== "all") {
      data = data.filter((entry) => {
        switch (dateFilter) {
          case "today":
            return isToday(entry.createdAt);
          case "week":
            return isThisWeek(entry.createdAt);
          case "month":
            return isThisMonth(entry.createdAt);
          case "custom":
            return isCustomDate(entry.createdAt);
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      data = data.filter(
        (entry) =>
          getTypeName(entry.type)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          Object.values(entry.data).some((value) =>
            value.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          new Date(entry.createdAt).toLocaleDateString().includes(searchTerm),
      );
    }

    return data;
  })();

  const refreshData = () => {
    refetch();
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `operations-data-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  const openDeleteModal = (entry: DataEntry) => {
    setDeleteModal({ isOpen: true, entry });
  };

  const openClearModal = () => {
    setDeleteModal({ isOpen: true, isClearing: true });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.isClearing) {
      clearAllData();
    } else if (deleteModal.entry) {
      removeDataEntry(deleteModal.entry.id);
    }
  };

  const removeDataEntry = async (entryId: number) => {
    try {
      await apiRequest("DELETE", `/api/operational-data/${entryId}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/operational-data"] });

      toast({
        title: "Data Removed",
        description: "Selected data entry has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove data entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearAllData = async () => {
    try {
      await apiRequest("DELETE", "/api/operational-data");
      await queryClient.invalidateQueries({ queryKey: ["/api/operational-data"] });

      toast({
        title: "All Data Cleared",
        description: "All operational data has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Data View & Analytics
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            View, filter, and analyze your operational data
          </p>
        </div>

        {/* Search and Filters Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search across all data entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Date Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="date-filter" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Filter
                  </Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="date-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today Only</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="custom">Custom Date</SelectItem>
                      <SelectItem value="all">All Dates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateFilter === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-date" className="text-sm font-medium">
                      Select Date
                    </Label>
                    <Input
                      id="custom-date"
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="auto-refresh" className="text-sm font-medium flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin text-green-600' : 'text-gray-400'}`} />
                    Auto Refresh
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {autoRefresh ? 'Every 2s' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(dateFilter !== "all" || filter !== "all" || searchTerm) && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
                  {dateFilter !== "all" && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Date: {dateFilter === "custom" ? (customDate || "Select date") : dateFilter}
                    </Badge>
                  )}
                  {filter !== "all" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Type: {getTypeName(filter)}
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateFilter("all");
                      setFilter("all");
                      setSearchTerm("");
                      setCustomDate("");
                    }}
                    className="text-xs h-6 px-2"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Filter Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setFilter("all")}
                  className={`${
                    filter === "all"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      : "hover:bg-blue-50 hover:border-blue-300"
                  } transition-all duration-200`}
                >
                  All Data
                </Button>
                <Button
                  variant={filter === "employee" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setFilter("employee")}
                  className={`${
                    filter === "employee"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      : "hover:bg-blue-50 hover:border-blue-300"
                  } transition-all duration-200`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Employee
                </Button>
                <Button
                  variant={filter === "operations" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setFilter("operations")}
                  className={`${
                    filter === "operations"
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                      : "hover:bg-green-50 hover:border-green-300"
                  } transition-all duration-200`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Operations
                </Button>
                <Button
                  variant={filter === "staffCount" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setFilter("staffCount")}
                  className={`${
                    filter === "staffCount"
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
                      : "hover:bg-purple-50 hover:border-purple-300"
                  } transition-all duration-200`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Staff Count
                </Button>
                <Button
                  variant={
                    filter === "yesterdayProduction" ? "default" : "outline"
                  }
                  size="lg"
                  onClick={() => setFilter("yesterdayProduction")}
                  className={`${
                    filter === "yesterdayProduction"
                      ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg"
                      : "hover:bg-orange-50 hover:border-orange-300"
                  } transition-all duration-200`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Production
                </Button>
                <Button
                  variant={
                    filter === "yesterdayLoading" ? "default" : "outline"
                  }
                  size="lg"
                  onClick={() => setFilter("yesterdayLoading")}
                  className={`${
                    filter === "yesterdayLoading"
                      ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg"
                      : "hover:bg-teal-50 hover:border-teal-300"
                  } transition-all duration-200`}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Loading
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={refreshData}
                  className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                <Button
                  variant="outline"
                  onClick={exportData}
                  className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                {isAdmin && allData.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={openClearModal}
                    className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Data Grid */}
        {filteredData.length === 0 ? (
          <Card className="text-center py-16 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mb-6">
                <Database className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {allData.length === 0
                  ? "No Data Available"
                  : "No Matching Results"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {allData.length === 0
                  ? "Start adding operational data from the dashboard to see entries here."
                  : "Try adjusting your search terms or filters to find what you're looking for."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredData.map((entry, index) => (
              <Card
                key={entry.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-100 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm">
                        {getTypeIcon(entry.type)}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                          {getTypeName(entry.type)}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {Object.keys(entry.data).length} data fields recorded
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-white/80 text-gray-700 border border-gray-200 shadow-sm px-3 py-1"
                      >
                        {new Date(entry.timestamp).toLocaleString()}
                      </Badge>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(entry)}
                          className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Data Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {Object.entries(entry.data).map(([key, value]) => (
                      <div
                        key={key}
                        className="group/item bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          {key}
                        </div>
                        <div className="text-lg font-bold text-gray-800 group-hover/item:text-blue-600 transition-colors">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Statistics Bar */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {entry.stats.total.toFixed(1)}
                        </div>
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Total
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {entry.stats.average.toFixed(1)}
                        </div>
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Average
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          {entry.stats.max}
                        </div>
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Maximum
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {entry.stats.min}
                        </div>
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Minimum
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        entry={deleteModal.entry}
        isClearing={deleteModal.isClearing}
        totalEntries={allData.length}
      />
    </div>
  );
}
