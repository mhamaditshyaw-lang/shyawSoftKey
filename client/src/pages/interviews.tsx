import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Clock, Check, X, Edit, Calendar, Plus, Archive, Search, RefreshCw, Filter, User, MapPin, CheckCircle2, XCircle, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import InterviewRequestModal from "@/components/modals/interview-request-modal";
import ViewInterviewDetailsModal from "@/components/modals/view-interview-details-modal";
import { getRelativeTime } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useTranslation } from "react-i18next";

export default function InterviewsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: interviewsData, isLoading } = useQuery({
    queryKey: ["/api/interviews"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/interviews");
      return await response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
  });

  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/users");
      return await response.json();
    },
  });

  const interviewRequests = interviewsData?.requests || [];
  const users = usersData?.users || [];

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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

  // Get unique positions for filter (exclude null/undefined)
  const uniquePositions = (Array.from(
    new Set(
      interviewRequests
        .map((request: any) => request.position)
        .filter((position: any): position is string => Boolean(position) && typeof position === 'string')
    )
  ) as string[]).sort();

  // Filter interviews based on criteria
  const filteredInterviews = interviewRequests.filter((request: any) => {
    // Status filter
    if (statusFilter !== "all" && request.status !== statusFilter) {
      return false;
    }

    // Position filter
    if (positionFilter !== "all") {
      // Handle null/undefined positions gracefully
      if (!request.position) {
        return false;
      }
      if (request.position !== positionFilter) {
        return false;
      }
    }

    // User filter
    if (userFilter !== "all") {
      const userIdFilter = parseInt(userFilter);
      const matchesUser = 
        request.requestedById === userIdFilter ||
        request.managerId === userIdFilter ||
        request.actionTakenById === userIdFilter;

      if (!matchesUser) return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (request.position?.toLowerCase() ?? '').includes(searchLower) ||
        (request.candidateName?.toLowerCase() ?? '').includes(searchLower) ||
        (request.requestedBy?.firstName?.toLowerCase() ?? '').includes(searchLower) ||
        (request.requestedBy?.lastName?.toLowerCase() ?? '').includes(searchLower) ||
        (request.manager 
          ? `${request.manager.firstName ?? ''} ${request.manager.lastName ?? ''}`.toLowerCase().includes(searchLower)
          : false);

      if (!matchesSearch) return false;
    }

    // Date filter
    switch (dateFilter) {
      case "today":
        return isToday(request.createdAt);
      case "week":
        return isThisWeek(request.createdAt);
      case "month":
        return isThisMonth(request.createdAt);
      case "custom":
        return isCustomDate(request.createdAt);
      case "all":
      default:
        return true;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInterviews = filteredInterviews.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, dateFilter, customDate, userFilter, positionFilter]);

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await authenticatedRequest("PATCH", `/api/interviews/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      toast({
        title: "Success",
        description: "Interview request updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>

          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {(user?.role === "security" || user?.role === "admin" || user?.role === "manager") && (
              <Button onClick={() => setShowRequestModal(true)} className="mobile-button touch-target">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t("scheduleInterview")}</span>
                <span className="sm:hidden">{t("scheduleInterview")}</span>
              </Button>
            )}
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/interviews"] })}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
{t("refresh")}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Controls */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
{t("searchAndFilter")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">{t("search")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("statusFilter")}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses")}</SelectItem>
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                  <SelectItem value="approved">{t("approved")}</SelectItem>
                  <SelectItem value="rejected">{t("rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("positionFilter")}</Label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger data-testid="select-position-filter">
                  <SelectValue placeholder={t("allPositions")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allPositions")}</SelectItem>
                  {uniquePositions.map((position: string) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                <User className="w-4 h-4 inline mr-1" />
                {t("managerFilter")}
              </Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger data-testid="select-user-filter">
                  <SelectValue placeholder={t("allManagers")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allManagers")}</SelectItem>
                  {users
                    .filter((u: any) => u.role === 'manager')
                    .map((u: any) => {
                      // Check if user has comments
                      const hasComments = u.comments && u.comments.length > 0;
                      return (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          <div className="flex items-center">
                            {u.firstName} {u.lastName}
                            {hasComments && <MessageSquare className="w-4 h-4 ml-2 text-gray-500" />}
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("dateFilter")}</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger data-testid="select-date-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t("today")}</SelectItem>
                  <SelectItem value="week">{t("thisWeek")}</SelectItem>
                  <SelectItem value="month">{t("thisMonth")}</SelectItem>
                  <SelectItem value="custom">{t("custom")}</SelectItem>
                  <SelectItem value="all">{t("allDates")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label className="text-sm font-medium">{t("autoRefresh")}</Label>
              <span className="text-sm text-gray-600">
                {autoRefresh ? t("every30s") : t("off")}
              </span>
            </div>
          </div>

          {/* Custom Date Input */}
          {dateFilter === "custom" && (
            <div className="mt-4 max-w-xs">
              <Label htmlFor="customDate" className="text-sm font-medium">{t("selectDate")}</Label>
              <Input
                id="customDate"
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {/* Filter Summary */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing {filteredInterviews.length} of {interviewRequests.length} reviews
                {dateFilter !== "all" && ` • Filtered by: ${dateFilter === "custom" ? `${customDate}` : dateFilter}`}
                {searchTerm && ` • Search: "${searchTerm}"`}
                {statusFilter !== "all" && ` • Status: ${statusFilter}`}
                {positionFilter !== "all" && ` • Position: ${positionFilter}`}
                {userFilter !== "all" && ` • Manager: ${users.find((u: any) => u.id.toString() === userFilter)?.firstName} ${users.find((u: any) => u.id.toString() === userFilter)?.lastName}`}
              </span>
              {(searchTerm || dateFilter !== "all" || statusFilter !== "all" || positionFilter !== "all" || userFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("all");
                    setStatusFilter("all");
                    setPositionFilter("all");
                    setUserFilter("all");
                    setCustomDate("");
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  data-testid="button-clear-filters"
                >
                  {t("clearFilters")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Grid */}
      <div className="space-y-6">
        {filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("noInterviewRequests")}</h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === "all" 
                  ? t("noInterviewRequests")
                  : `${t("noInterviewRequests")}`
                }
              </p>
              {(user?.role === "security" || user?.role === "admin" || user?.role === "manager") && (
                <Button onClick={() => setShowRequestModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("scheduleFirstReview")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          paginatedInterviews.map((request: any) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{request.position}</h3>
                      <Badge className={getStatusBadgeColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                      {request.actionTakenBy && (request.status === 'approved' || request.status === 'rejected') && (
                        <span className="text-sm text-gray-600">
                          {t("by")} {request.actionTakenBy.firstName} {request.actionTakenBy.lastName}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{t("candidate")}</p>
                        <p className="text-sm text-gray-900 mt-1">{request.candidateName}</p>
                        {request.candidateEmail && (
                          <p className="text-xs text-gray-600">{request.candidateEmail}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">{t("requestedBy")}</p>
                        <p className="text-sm text-gray-900 mt-1">
                          {request.requestedBy.firstName} {request.requestedBy.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">{t("proposedDate")}</p>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(request.proposedDateTime).toLocaleDateString()} at{" "}
                          {new Date(request.proposedDateTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">{t("duration")}</p>
                        <p className="text-sm text-gray-900 mt-1">{request.duration} {t("minutes")}</p>
                      </div>
                    </div>

                    {/* Manager and Handler Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {t("assignedManager")}
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                          {request.manager 
                            ? `${request.manager.firstName} ${request.manager.lastName}` 
                            : <span className="text-gray-400 italic">{t("notAssigned")}</span>
                          }
                        </p>
                      </div>
                      {request.actionTakenBy && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                            {request.status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                            {t("handledBy")}
                          </p>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 font-medium">
                            {request.actionTakenBy.firstName} {request.actionTakenBy.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {request.status === 'approved' ? t("approved") : t("rejected")} {t("on")} {new Date(request.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {request.description && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">{t("interviewDetails")}</p>
                        <p className="text-sm text-gray-700">{request.description}</p>
                      </div>
                    )}

                    {request.rejectionReason && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-red-600 mb-2">{t("rejectionReason")}</p>
                        <p className="text-sm text-red-700">{request.rejectionReason}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        {t("submitted")} {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons for managers and admins */}
                  <div className="flex flex-col space-y-2 ml-6">
                    {(user?.role === "manager" || user?.role === "admin") && request.status === "pending" && (
                      <>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateRequestMutation.mutate({ 
                            id: request.id, 
                            updates: { status: "approved" }
                          })}
                          disabled={updateRequestMutation.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {t("approve")}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => updateRequestMutation.mutate({ 
                            id: request.id, 
                            updates: { status: "rejected" }
                          })}
                          disabled={updateRequestMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {t("reject")}
                        </Button>
                      </>
                    )}

                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailsModal(true);
                      }}
                      data-testid={`button-view-details-${request.id}`}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {t("viewDetails")}
                    </Button>

                    {(user?.role === "admin" || user?.role === "manager") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Archive the interview request
                          const archiveRequest = async () => {
                            try {
                              const response = await authenticatedRequest("POST", "/api/archive", {
                                itemType: "interview_request",
                                itemId: request.id,
                                itemData: request,
                                reason: "Completed interview archived"
                              });

                              if (response.ok) {
                                queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
                                toast({
                                  title: "Success",
                                  description: "Interview request archived successfully",
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: "Error",
                                description: error.message || "Failed to archive interview request",
                                variant: "destructive",
                              });
                            }
                          };

                          archiveRequest();
                        }}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {t("archiveInterview")}
                      </Button>
                    )}

                    {(user?.role === "admin" || user?.role === "manager") && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          // Show confirmation dialog
                          if (confirm(`Are you sure you want to delete the interview request for ${request.candidateName}? This action cannot be undone.`)) {
                            const deleteRequest = async () => {
                              try {
                                const response = await authenticatedRequest("DELETE", `/api/interviews/${request.id}`);

                                if (response.ok) {
                                  queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
                                  toast({
                                    title: "Success",
                                    description: "Interview request deleted successfully",
                                  });
                                } else {
                                  const error = await response.json();
                                  toast({
                                    title: "Error",
                                    description: error.message || "Failed to delete interview request",
                                    variant: "destructive",
                                  });
                                }
                              } catch (error: any) {
                                toast({
                                  title: "Error",
                                  description: error.message || "Failed to delete interview request",
                                  variant: "destructive",
                                });
                              }
                            };

                            deleteRequest();
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t("deleteInterview")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {filteredInterviews.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-8 px-4 py-4 border-t border-gray-200 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {t("showing")} {startIndex + 1}-{Math.min(endIndex, filteredInterviews.length)} {t("of")} {filteredInterviews.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("previous")}
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                  data-testid={`button-page-${page}`}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
            >
              {t("next")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <InterviewRequestModal 
        open={showRequestModal} 
        onOpenChange={setShowRequestModal} 
      />

      {selectedRequest && (
        <ViewInterviewDetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          interview={selectedRequest}
        />
      )}
    </div>
    </DashboardLayout>
  );
}