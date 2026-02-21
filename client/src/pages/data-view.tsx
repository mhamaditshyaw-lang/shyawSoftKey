import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
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
  ArrowLeft,
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
  timestamp?: string;
  createdBy?: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

// Helper function to translate field labels
const translateFieldLabel = (fieldLabel: string, t: any): string => {
  const fieldLabelMap: Record<string, string> = {
    'Total employees today': 'totalEmployeesToday',
    'Permanent employees': 'permanentEmployees',
    'Non-permanent employees': 'nonPermanentEmployees',
    'Day - Start of work': 'dayStartOfWork',
    'Day - Giving up': 'dayGivingUp',
    'Night - Start of work': 'nightStartOfWork',
    'Night - Giving up': 'nightGivingUp',
    'Day - Ice cream': 'dayIceCream',
    'Night - Ice cream': 'nightIceCream',
    'Day - Albany': 'dayAlbany',
    'Night - Albany': 'nightAlbany',
    'Day - Do': 'dayDo',
    'Night - Do': 'nightDo',
    'Day - Ice cream / Cartons': 'dayIceCreamCartons',
    'Night - Ice cream / Cartons': 'nightIceCreamCartons',
    'Day - Albany / Tons': 'dayAlbanyTons',
    'Night - Albany / Tons': 'nightAlbanyTons',
    'Day - Do / Tons': 'dayDoTons',
    'Night - Do / Tons': 'nightDoTons',
    'Ice cream / Loading vehicles': 'iceCreamLoadingVehicles',
    'Albany / Loading vehicles': 'albanyLoadingVehicles',
    'Do / Loading vehicles': 'doLoadingVehicles',
    'VEHICLE 1 (TONS)': 'vehicle1Tons',
    'VEHICLE 2 (TONS)': 'vehicle2Tons',
    'VEHICLE 3 (TONS)': 'vehicle3Tons',
    'HEAD INSERT NAME': 'headInsertName'
  };

  const translationKey = fieldLabelMap[fieldLabel];
  return translationKey ? t(translationKey) : fieldLabel;
};

export default function DataViewPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [customDate, setCustomDate] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [systemTime, setSystemTime] = useState<Date>(new Date());
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    entry?: DataEntry;
    isClearing?: boolean;
  }>({ isOpen: false });
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch operational data from API using authenticated request
  const { data: operationalDataResponse, refetch, isLoading, error: fetchError } = useQuery({
    queryKey: ["/api/operational-data"],
    queryFn: async () => {
      try {
        console.log("[DataView Query] Starting fetch...");
        const { authenticatedRequest } = await import("@/lib/auth");
        const response = await authenticatedRequest("GET", "/api/operational-data");
        console.log("[DataView Query] Response status:", response.status);
        console.log("[DataView Query] Response object:", response);

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[DataView Query] Response JSON data:", data);
        console.log("[DataView Query] Data type:", typeof data);
        console.log("[DataView Query] Data keys:", data ? Object.keys(data) : "null/undefined");
        console.log("[DataView Query] Entries:", data?.entries);
        console.log("[DataView Query] Entries count:", data?.entries?.length || 0);
        return data;
      } catch (error) {
        console.error("[DataView Query] Error:", error);
        throw error;
      }
    },
    refetchInterval: autoRefresh ? 30000 : false,
    retry: false,
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Synchronize with system time automatically
  useEffect(() => {
    // Update system time every second to keep in sync
    const interval = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);

    console.log(`[SystemTime] Initialized - Current time: ${new Date().toLocaleString()}`);

    return () => clearInterval(interval);
  }, []);

  const allData: DataEntry[] = (() => {
    // Handle various response formats from the API
    const responseData = operationalDataResponse;
    console.log("[DataView] Processing response:", responseData);

    let entries = [];

    // Check if response has 'entries' property (standard format)
    if (responseData?.entries && Array.isArray(responseData.entries)) {
      entries = responseData.entries;
      console.log("[DataView] Found entries in response.entries:", entries.length);
    }
    // Check if response itself is an array
    else if (Array.isArray(responseData)) {
      entries = responseData;
      console.log("[DataView] Response is an array:", entries.length);
    }
    // Check if response is an object with other possible property names
    else if (responseData && typeof responseData === 'object') {
      console.log("[DataView] Response is an object with keys:", Object.keys(responseData));
      const possibleArrays = Object.values(responseData).filter(v => Array.isArray(v));
      if (possibleArrays.length > 0) {
        entries = possibleArrays[0] as any[];
        console.log("[DataView] Found array in response:", entries.length);
      }
    }

    console.log("[DataView] Final entries to map:", entries.length);

    // Map the entries
    return entries.map((entry: any) => ({
      ...entry,
      createdAt: entry.createdAt || entry.created_at, // Handle both field names
      createdBy: entry.createdBy || {
        username: 'System',
        firstName: 'Auto',
        lastName: 'Generated'
      }
    }));
  })();

  // Log raw API response for debugging
  useEffect(() => {
    console.log("[DataView] operationalDataResponse:", operationalDataResponse);
    console.log("[DataView] operationalDataResponse?.entries:", operationalDataResponse?.entries);
    console.log("[DataView] allData:", allData);
    console.log("[DataView] allData.length:", allData.length);
    if (allData.length > 0) {
      console.log("[DataView] First entry:", allData[0]);
    }
  }, [operationalDataResponse]);

  // Log data for debugging
  useEffect(() => {
    console.log(`[DataView] operationalDataResponse:`, operationalDataResponse);
    console.log(`[DataView] Total entries received: ${allData.length}`);
    console.log(`[DataView] User info:`, user);
    console.log(`[DataView] System time: ${systemTime.toLocaleString()}`);
    console.log(`[DataView] Date filter: ${dateFilter}`);
    if (fetchError) {
      console.error(`[DataView] Fetch error:`, fetchError);
    }
    if (allData.length > 0) {
      console.log(`[DataView] First entry:`, allData[0]);
      console.log(`[DataView] First entry createdAt:`, allData[0].createdAt);
      console.log(`[DataView] Date parsed:`, new Date(allData[0].createdAt));
    }
  }, [allData, fetchError, user]);

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



  // Helper function to get local date string in YYYY-MM-DD format
  const getLocalDateString = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date filtering functions
  const isToday = (date: string): boolean => {
    try {
      // Parse the entry date
      const entryDate = new Date(date);

      // Get the date part only (without time)
      const entryYear = entryDate.getFullYear();
      const entryMonth = entryDate.getMonth();
      const entryDay = entryDate.getDate();

      // Get today's date part only
      const today = new Date(systemTime);
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();

      // Compare ONLY the date parts, ignoring time and timezone
      const result = entryYear === todayYear &&
        entryMonth === todayMonth &&
        entryDay === todayDay;

      console.log(`[isToday] Entry: ${entryDate.toLocaleString()} => ${entryYear}-${entryMonth}-${entryDay}, Today: ${todayYear}-${todayMonth}-${todayDay}, Match: ${result}`);
      return result;
    } catch (error) {
      console.error('[isToday] Error:', error, 'for date:', date);
      return false;
    }
  };

  const isThisWeek = (date: string): boolean => {
    try {
      const entryDate = new Date(date);
      const today = new Date(systemTime);

      // Get the day of the week for both dates (0 = Sunday, 1 = Monday, etc.)
      const entryDayOfWeek = entryDate.getDay();
      const todayDayOfWeek = today.getDay();

      // Calculate the Monday of the entry's week
      const entryMonday = new Date(entryDate);
      entryMonday.setDate(entryDate.getDate() - (entryDayOfWeek === 0 ? 6 : entryDayOfWeek - 1));

      // Calculate the Monday of the current week
      const currentMonday = new Date(today);
      currentMonday.setDate(today.getDate() - (todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1));

      // Compare year, month, and day to see if they're in the same week
      const result = entryMonday.getFullYear() === currentMonday.getFullYear() &&
        entryMonday.getMonth() === currentMonday.getMonth() &&
        entryMonday.getDate() === currentMonday.getDate();

      console.log(`[isThisWeek] Entry: ${entryDate.toLocaleString()}, EntryWeekStart: ${entryMonday.toLocaleDateString()}, CurrentWeekStart: ${currentMonday.toLocaleDateString()}, Match: ${result}`);
      return result;
    } catch (error) {
      console.error('[isThisWeek] Error:', error, 'for date:', date);
      return false;
    }
  };

  const isThisMonth = (date: string): boolean => {
    try {
      const entryDate = new Date(date);

      const result = entryDate.getMonth() === systemTime.getMonth() &&
        entryDate.getFullYear() === systemTime.getFullYear();

      const monthYear = `${systemTime.getFullYear()}-${String(systemTime.getMonth() + 1).padStart(2, '0')}`;
      const entryMonthYear = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;

      console.log(`[isThisMonth] Entry: ${entryMonthYear}, Current: ${monthYear}, Match: ${result}`);
      return result;
    } catch (error) {
      console.error('[isThisMonth] Error:', error, 'for date:', date);
      return false;
    }
  };

  const isCustomDate = (date: string): boolean => {
    if (!customDate) return false;

    try {
      const entryDate = new Date(date);
      const filterDate = new Date(customDate);

      const entryString = getLocalDateString(entryDate);
      const filterString = getLocalDateString(filterDate);

      const result = entryString === filterString;
      console.log(`[isCustomDate] Entry: ${entryString}, Filter: ${filterString}, Match: ${result}`);
      return result;
    } catch (error) {
      console.error('[isCustomDate] Error:', error, 'for date:', date);
      return false;
    }
  };

  // Filter data
  const filteredData = (() => {
    console.log("[Filter] Starting with allData.length:", allData.length);
    console.log("[Filter] filter:", filter, "dateFilter:", dateFilter);

    // Apply type filter first
    let data = allData;
    if (filter && filter !== "all") {
      data = data.filter((d) => d.type === filter);
      console.log(`[Filter] After type filter '${filter}': ${data.length}`);
    } else {
      console.log("[Filter] Using all types (no type filter)");
    }

    // Apply date filter
    if (dateFilter && dateFilter !== "all") {
      console.log(`[Filter] Applying date filter: ${dateFilter}`);

      if (dateFilter === "today") {
        // For today filter, ONLY show today's data
        const todayFiltered = data.filter((entry) => isToday(entry.createdAt));
        console.log(`[Filter] Today filter found: ${todayFiltered.length} entries`);

        // Don't use fallback - show only today's data or nothing
        data = todayFiltered;
        console.log(`[Filter] Showing ${todayFiltered.length} entries for today (no fallback)`);
      } else {
        // For other date filters
        const dateFilteredData = data.filter((entry) => {
          let matches = false;

          switch (dateFilter) {
            case "week":
              matches = isThisWeek(entry.createdAt);
              break;
            case "month":
              matches = isThisMonth(entry.createdAt);
              break;
            case "custom":
              matches = isCustomDate(entry.createdAt);
              break;
            default:
              matches = true;
          }
          return matches;
        });

        console.log(`[Filter] After date filter '${dateFilter}': ${dateFilteredData.length}`);
        data = dateFilteredData;
      }
    } else {
      console.log("[Filter] No date filter (showing all dates)");
    }

    // Apply search filter
    if (searchTerm) {
      data = data.filter(
        (entry) =>
          getTypeName(entry.type)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          Object.values(entry.data).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          new Date(entry.createdAt).toLocaleDateString().includes(searchTerm),
      );
      console.log(`[Filter] After search filter: ${data.length}`);
    }

    console.log(`[Filter] Final result: ${data.length} entries. Current User Role: ${user?.role}`);
    return data;
  })();

  // Enhanced logging for filtered data and user role
  useEffect(() => {
    console.log("[DataView] render - filteredData.length:", filteredData.length);
    console.log("[DataView] active filter:", filter);
    console.log("[DataView] active dateFilter:", dateFilter);
    console.log("[DataView] user role:", user?.role);
    if (allData.length > 0 && filteredData.length === 0) {
      console.warn("[DataView] Warning: Data exists but is completely filtered out!");
    }
  }, [filteredData, filter, dateFilter, user]);

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
      const { authenticatedRequest } = await import("@/lib/auth");
      await authenticatedRequest("DELETE", `/api/operational-data/${entryId}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/operational-data"] });

      toast({
        title: "Data Removed",
        description: "Selected data entry has been successfully removed.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove data entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearAllData = async () => {
    try {
      const { authenticatedRequest } = await import("@/lib/auth");
      await authenticatedRequest("DELETE", "/api/operational-data");
      await queryClient.invalidateQueries({ queryKey: ["/api/operational-data"] });

      toast({
        title: "All Data Cleared",
        description: "All operational data has been removed.",
      });
    } catch (error) {
      console.error("Clear all error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">{t("loadingDataMessage")}</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-md w-full">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">Error Fetching Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-red-600 dark:text-red-300">
                {fetchError instanceof Error ? fetchError.message : "Failed to fetch operational data"}
              </p>
              <div className="bg-white dark:bg-gray-800 p-3 rounded text-sm font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-40">
                {fetchError instanceof Error ? fetchError.stack : JSON.stringify(fetchError)}
              </div>
              <Button
                onClick={() => refetch()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="outline"
              className="flex items-center gap-2 hover:bg-dashboard-primary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("backToDashboard")}
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {t("dataViewAnalytics")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t("viewFilterAnalyzeData")}
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
                  placeholder={t("searchPlaceholder")}
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
                    {t("filterByDate")}
                  </Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="date-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">{t("today")}</SelectItem>
                      <SelectItem value="week">{t("thisWeek")}</SelectItem>
                      <SelectItem value="month">{t("thisMonth")}</SelectItem>
                      <SelectItem value="custom">{t("customDate")}</SelectItem>
                      <SelectItem value="all">{t("allDates")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateFilter === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-date" className="text-sm font-medium">
                      {t("selectDate")}
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
                    {t("autoRefresh")}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {autoRefresh ? t("refreshEvery30Seconds") : t("disabled")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(dateFilter !== "all" || filter !== "all" || searchTerm) && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("activeFilters")}:</span>
                  {dateFilter !== "all" && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {t("dateLabel")}: {dateFilter === "custom" ? (customDate || t("selectDate")) : dateFilter}
                    </Badge>
                  )}
                  {filter !== "all" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {t("typeLabel")}: {getTypeName(filter)}
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {t("searchLabel")}: "{searchTerm}"
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
                    {t("clearAll")}
                  </Button>
                </div>
              )}

              {/* Filter Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setFilter("all")}
                  className={`${filter === "all"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      : "hover:bg-blue-50 hover:border-blue-300"
                    } transition-all duration-200`}
                >
                  {t("allData")}
                </Button>
                <Button
                  variant={filter === "employee" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setFilter("employee")}
                  className={`${filter === "employee"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      : "hover:bg-blue-50 hover:border-blue-300"
                    } transition-all duration-200`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t("employee")}
                </Button>
                <Button
                  variant={filter === "operations" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setFilter("operations")}
                  className={`${filter === "operations"
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                      : "hover:bg-green-50 hover:border-green-300"
                    } transition-all duration-200`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t("operations")}
                </Button>
                <Button
                  variant={filter === "staffCount" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setFilter("staffCount")}
                  className={`${filter === "staffCount"
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
                      : "hover:bg-purple-50 hover:border-purple-300"
                    } transition-all duration-200`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t("staffCount")}
                </Button>
                <Button
                  variant={
                    filter === "yesterdayProduction" ? "default" : "outline"
                  }
                  size="lg"
                  onClick={() => setFilter("yesterdayProduction")}
                  className={`${filter === "yesterdayProduction"
                      ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg"
                      : "hover:bg-orange-50 hover:border-orange-300"
                    } transition-all duration-200`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {t("production")}
                </Button>
                <Button
                  variant={
                    filter === "yesterdayLoading" ? "default" : "outline"
                  }
                  size="lg"
                  onClick={() => setFilter("yesterdayLoading")}
                  className={`${filter === "yesterdayLoading"
                      ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg"
                      : "hover:bg-teal-50 hover:border-teal-300"
                    } transition-all duration-200`}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  {t("loadingVehicles")}
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
                  {t("refreshData")}
                </Button>
                <Button
                  variant="outline"
                  onClick={exportData}
                  className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("exportData")}
                </Button>
                {isAdmin && allData.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={openClearModal}
                    className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t("adminClearAllData")}
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
                  ? t("noDataAvailableMessage")
                  : t("noMatchingResults")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {allData.length === 0
                  ? t("startAddingDataMessage")
                  : t("adjustFiltersMessage")}
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
                          {Object.keys(entry.data).length} {t("dataFieldsRecorded")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-white/80 text-gray-700 border border-gray-200 shadow-sm px-3 py-1"
                      >
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "N/A"}
                      </Badge>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(entry)}
                          className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 shadow-sm"
                          title={t("adminOnlyDeleteEntry")}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="ml-1 text-xs">{t("admin")}</span>
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
                        <div className="text-2xl font-bold text-gray-800 group-hover/item:text-blue-600 transition-colors">
                          {value}
                        </div>
                        <div className="text-xs font-medium text-gray-500 mt-2">
                          {translateFieldLabel(key, t)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Statistics Bar */}
                  {entry.stats && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {entry.stats?.total?.toFixed(1) || "0"}
                          </div>
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            {t("total")}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {entry.stats?.average?.toFixed(1) || "0"}
                          </div>
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            {t("average")}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600 mb-1">
                            {entry.stats?.max || "0"}
                          </div>
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            {t("maximum")}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600 mb-1">
                            {entry.stats?.min || "0"}
                          </div>
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            {t("minimum")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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