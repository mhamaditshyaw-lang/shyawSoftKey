import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Archive, Search, Calendar, User, FileText, Eye, Edit, Filter, X, Plus, Save, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import ArchiveDetailsModal from "@/components/modals/archive-details-modal";
import EditArchiveModal from "@/components/modals/edit-archive-modal";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useTranslation } from "react-i18next";

export default function ArchivePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [newReports, setNewReports] = useState<{[key: number]: { description: string, rating: string }}>({});
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());

  const { data: archiveData, isLoading } = useQuery({
    queryKey: ["/api/archive"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/archive");
      return await response.json();
    },
    enabled: user?.role === "admin" || user?.role === "manager",
  });

  const addReportMutation = useMutation({
    mutationFn: async ({ id, reportData }: { id: number; reportData: any }) => {
      const response = await authenticatedRequest("PATCH", `/api/archive/${id}`, {
        newReport: reportData
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
      toast({
        title: "Success",
        description: "Report added successfully",
      });
      setNewReports({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add report",
        variant: "destructive",
      });
    },
  });

  const deleteArchiveItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedRequest("DELETE", `/api/archive/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
      toast({
        title: "Success",
        description: "Archive item deleted successfully",
      });
      setDeletingItems(new Set());
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete archive item",
        variant: "destructive",
      });
    },
  });

  const archivedItems = archiveData?.archivedItems || [];

  const filteredItems = archivedItems.filter((item: any) => {
    const matchesType = typeFilter === "all" || item.itemType === typeFilter;
    const itemData = JSON.parse(item.itemData);
    const searchableText = `${itemData.title || itemData.position || itemData.firstName || ''} ${itemData.description || itemData.candidateName || itemData.email || ''}`.toLowerCase();
    const matchesSearch = searchTerm === "" || searchableText.includes(searchTerm.toLowerCase());
    
    // Date filtering
    let matchesDate = true;
    if (dateFilter !== "all") {
      const itemDate = new Date(item.createdAt);
      const today = new Date();
      
      switch (dateFilter) {
        case "today":
          matchesDate = itemDate.toDateString() === today.toDateString();
          break;
        case "week":
          const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = itemDate >= oneWeekAgo;
          break;
        case "month":
          const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          matchesDate = itemDate >= oneMonthAgo;
          break;
        case "custom":
          if (customDate) {
            const customDateObj = new Date(customDate);
            matchesDate = itemDate.toDateString() === customDateObj.toDateString();
          }
          break;
        case "range":
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include full end date
            matchesDate = itemDate >= start && itemDate <= end;
          }
          break;
      }
    }
    
    return matchesType && matchesSearch && matchesDate;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "interview":
        return "bg-blue-100 text-blue-800";
      case "todo":
        return "bg-green-100 text-green-800";
      case "user":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "interview":
        return <Calendar className="w-4 h-4" />;
      case "todo":
        return <FileText className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      default:
        return <Archive className="w-4 h-4" />;
    }
  };

  const renderItemPreview = (item: any) => {
    const itemData = JSON.parse(item.itemData);
    
    switch (item.itemType) {
      case "interview":
        const archiveDetails = itemData.archiveDetails;
        return (
          <div>
            <h4 className="font-medium text-gray-900">{itemData.position}</h4>
            <p className="text-sm text-gray-600">Candidate: {itemData.candidateName}</p>
            {archiveDetails && (
              <div className="mt-2 space-y-1">
                {archiveDetails.decision && (
                  <p className="text-sm text-gray-600">
                    Decision: <span className={`font-medium ${
                      archiveDetails.decision === 'hired' ? 'text-green-600' : 
                      archiveDetails.decision === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {archiveDetails.decision.charAt(0).toUpperCase() + archiveDetails.decision.slice(1).replace('_', ' ')}
                    </span>
                  </p>
                )}
                {archiveDetails.candidateRating && (
                  <p className="text-sm text-gray-600">Rating: {archiveDetails.candidateRating}/10</p>
                )}
                {archiveDetails.interviewDate && (
                  <p className="text-sm text-gray-600">
                    Interview Date: {new Date(archiveDetails.interviewDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      case "todo":
        return (
          <div>
            <h4 className="font-medium text-gray-900">{itemData.title}</h4>
            <p className="text-sm text-gray-600">{itemData.description}</p>
            <p className="text-sm text-gray-600">Priority: {itemData.priority}</p>
          </div>
        );
      case "user":
        return (
          <div>
            <h4 className="font-medium text-gray-900">
              {itemData.firstName} {itemData.lastName}
            </h4>
            <p className="text-sm text-gray-600">{itemData.email}</p>
            <p className="text-sm text-gray-600">Role: {itemData.role}</p>
          </div>
        );
      default:
        return (
          <div>
            <h4 className="font-medium text-gray-900">Archived Item</h4>
            <p className="text-sm text-gray-600">Type: {item.itemType}</p>
          </div>
        );
    }
  };

  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleEditInfo = (item: any) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleAddReport = (itemId: number) => {
    const reportData = newReports[itemId];
    if (!reportData || !reportData.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for the report",
        variant: "destructive",
      });
      return;
    }

    addReportMutation.mutate({
      id: itemId,
      reportData: {
        description: reportData.description,
        rating: reportData.rating,
        timestamp: new Date().toISOString(),
        addedBy: user?.username
      }
    });
  };

  const updateNewReport = (itemId: number, field: string, value: string) => {
    setNewReports(prev => ({
      ...prev,
      [itemId]: {
        description: prev[itemId]?.description || '',
        rating: prev[itemId]?.rating || '3',
        [field]: value
      }
    }));
  };

  const handleDeleteItem = (itemId: number) => {
    if (deletingItems.has(itemId)) {
      // Second click - confirm deletion
      deleteArchiveItemMutation.mutate(itemId);
    } else {
      // First click - show confirmation
      setDeletingItems(new Set([itemId]));
      toast({
        title: "Click again to confirm",
        description: "Click the delete button again to permanently remove this archive item",
      });
      // Auto-clear confirmation after 5 seconds
      setTimeout(() => {
        setDeletingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 5000);
    }
  };

  if (user?.role !== "admin" && user?.role !== "manager") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              Only administrators and managers can access the archive.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-900 mb-2">Archive & Reports</h1>
        <p className="text-green-700">
          View detailed archives, add interview reports, and manage completed items with comprehensive date filtering.
        </p>
      </div>

      {/* Enhanced Filters */}
      <Card className="mb-8 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-500"
                    aria-label="Search archived items"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] border-green-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="interview">Interviews</SelectItem>
                  <SelectItem value="todo">Tasks</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-purple-600 rounded-lg border border-purple-400">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Filter
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="border-green-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Date</SelectItem>
                    <SelectItem value="range">Date Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateFilter === 'custom' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">Select Date</Label>
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
              )}

              {dateFilter === 'range' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-white">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-white">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                </>
              )}

              {(dateFilter === 'custom' || dateFilter === 'range') && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateFilter("all");
                      setCustomDate("");
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-green-600">
              <span>Found {filteredItems.length} archived items</span>
              {dateFilter !== "all" && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Filtered by: {dateFilter === 'custom' ? `Custom (${customDate})` : 
                              dateFilter === 'range' ? `Range (${startDate} - ${endDate})` : 
                              dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archive Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Archive className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{archivedItems.length}</p>
                <p className="text-gray-600">Total Archived</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {archivedItems.filter((item: any) => item.itemType === "interview").length}
                </p>
                <p className="text-gray-600">Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {archivedItems.filter((item: any) => item.itemType === "todo").length}
                </p>
                <p className="text-gray-600">Todo Lists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {archivedItems.filter((item: any) => item.itemType === "user").length}
                </p>
                <p className="text-gray-600">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Archived Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No archived items found</h3>
              <p className="text-gray-600">
                {typeFilter === "all" 
                  ? "No items have been archived yet."
                  : `No archived ${typeFilter} items found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                      {getTypeIcon(item.itemType)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getTypeColor(item.itemType)}>
                          {item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)}
                        </Badge>
                      </div>
                      
                      {renderItemPreview(item)}
                      
                      {item.reason && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-500">Archive Reason:</p>
                          <p className="text-sm text-gray-700">{item.reason}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                        <span>
                          Archived by {item.archivedBy.firstName} {item.archivedBy.lastName}
                        </span>
                        <span>•</span>
                        <span>{getRelativeTime(item.archivedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                        className="border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                      {item.itemType === "interview" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditInfo(item)}
                          className="border-green-200 text-green-600 hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Info
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                        className="border-green-200 text-green-600 hover:bg-green-50"
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="w-4 h-4 mr-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 mr-2" />
                        )}
                        {expandedItems.has(item.id) ? 'Collapse' : 'Expand'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deleteArchiveItemMutation.isPending}
                        className={`border-red-200 hover:bg-red-50 ${
                          deletingItems.has(item.id) 
                            ? 'text-red-800 bg-red-100 border-red-300' 
                            : 'text-red-600'
                        }`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletingItems.has(item.id) ? 'Confirm Delete' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details Section */}
                {expandedItems.has(item.id) && (
                  <div className="mt-6 pt-6 border-t border-green-100">
                    {/* Archive Summary */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-green-800 mb-3">Archive Summary</h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-white">Archive Date</Label>
                            <p className="text-sm text-gray-900">{new Date(item.archivedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-white">Archived By</Label>
                            <p className="text-sm text-gray-900">{item.archivedBy.firstName} {item.archivedBy.lastName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-white">Item Type</Label>
                            <p className="text-sm text-gray-900 capitalize">{item.itemType}</p>
                          </div>
                          {item.reason && (
                            <div className="md:col-span-3">
                              <Label className="text-sm font-medium text-white">Archive Reason</Label>
                              <p className="text-sm text-gray-900">{item.reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interview Report Form (only for interviews) */}
                    {item.itemType === "interview" && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <Plus className="w-5 h-5" />
                          Add Interview Report
                        </h4>
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-white" htmlFor={`report-desc-${item.id}`}>{t("reportDescriptionLabel")}</Label>
                              <Textarea
                                id={`report-desc-${item.id}`}
                                value={newReports[item.id]?.description || ""}
                                onChange={(e) => updateNewReport(item.id, "description", e.target.value)}
                                className="mt-1 border-emerald-200 focus:border-emerald-500"
                                rows={4}
                              />
                              <p className="text-sm text-emerald-600">{t("reportDescriptionGuidance")}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-white" htmlFor={`rating-${item.id}`}>{t("performanceRatingLabel")}</Label>
                                <Select 
                                  value={newReports[item.id]?.rating || ""} 
                                  onValueChange={(value) => updateNewReport(item.id, "rating", value)}
                                >
                                  <SelectTrigger className="border-emerald-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="" disabled>{t("selectRating")}</SelectItem>
                                    <SelectItem value="excellent">Excellent (5/5)</SelectItem>
                                    <SelectItem value="good">Good (4/5)</SelectItem>
                                    <SelectItem value="average">Average (3/5)</SelectItem>
                                    <SelectItem value="below-average">Below Average (2/5)</SelectItem>
                                    <SelectItem value="poor">Poor (1/5)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-sm text-emerald-600">{t("ratingGuidance")}</p>
                              </div>
                              <div className="flex items-end">
                                <Button
                                  onClick={() => handleAddReport(item.id)}
                                  disabled={addReportMutation.isPending}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Report
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Existing Reports */}
                    {(() => {
                      const itemData = JSON.parse(item.itemData);
                      const reports = itemData.reports || [];
                      return reports.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-green-800 mb-3">Previous Reports</h4>
                          <div className="space-y-3">
                            {reports.map((report: any, index: number) => (
                              <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                                      Report #{index + 1}
                                    </Badge>
                                    {report.rating && (
                                      <Badge className="bg-blue-100 text-blue-800">
                                        {report.rating}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {report.addedBy} - {new Date(report.timestamp).toLocaleString()}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">{report.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ArchiveDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        archivedItem={selectedItem}
      />

      <EditArchiveModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        archivedItem={selectedItem}
      />
    </div>
    </DashboardLayout>
  );
}