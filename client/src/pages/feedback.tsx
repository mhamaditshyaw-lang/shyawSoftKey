import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
import { MessageSquare, Plus, Star, Calendar, User, Search, RefreshCw, Filter, TrendingUp } from "lucide-react";
import FeedbackModal from "@/components/modals/feedback-modal";
import { getRelativeTime } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function FeedbackPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ["/api/feedback"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/feedback");
      return await response.json();
    },
  });

  const { data: interviewsData } = useQuery({
    queryKey: ["/api/interviews"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/interviews");
      return await response.json();
    },
  });

  const feedbackList = feedbackData?.feedback || [];
  const interviews = interviewsData?.requests || [];

  // Date filtering functions
  const isToday = (date: string): boolean => {
    const today = new Date();
    const entryDate = new Date(date);
    return entryDate.toDateString() === today.toDateString();
  };

  const isThisWeek = (date: string): boolean => {
    const today = new Date();
    const entryDate = new Date(date);
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    return entryDate >= weekStart;
  };

  const isThisMonth = (date: string): boolean => {
    const today = new Date();
    const entryDate = new Date(date);
    return entryDate.getMonth() === today.getMonth() && entryDate.getFullYear() === today.getFullYear();
  };

  const matchesCustomDate = (date: string): boolean => {
    if (!customDate) return true;
    const entryDate = new Date(date);
    const targetDate = new Date(customDate);
    return entryDate.toDateString() === targetDate.toDateString();
  };

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const filteredFeedback = feedbackList.filter((item: any) => {
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    
    const matchesSearch = searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.submittedBy?.firstName + " " + item.submittedBy?.lastName).toLowerCase().includes(searchTerm.toLowerCase());

    // Date filtering
    let matchesDate = true;
    switch (dateFilter) {
      case "today":
        matchesDate = isToday(item.createdAt);
        break;
      case "week":
        matchesDate = isThisWeek(item.createdAt);
        break;
      case "month":
        matchesDate = isThisMonth(item.createdAt);
        break;
      case "custom":
        matchesDate = matchesCustomDate(item.createdAt);
        break;
      case "all":
      default:
        matchesDate = true;
        break;
    }

    return matchesType && matchesSearch && matchesDate;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "interview_feedback":
        return "bg-blue-100 text-blue-800";
      case "general_feedback":
        return "bg-green-100 text-green-800";
      case "system_improvement":
        return "bg-purple-100 text-purple-800";
      case "user_experience":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingStars = (rating: string) => {
    const stars = [];
    const ratingNum = parseInt(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= ratingNum ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const getRelatedInterviewTitle = (interviewId: number) => {
    const interview = interviews.find((i: any) => i.id === interviewId);
    return interview ? `${interview.position} - ${interview.candidateName}` : "Unknown Interview";
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Feedback & Reviews
            </h2>
            <p className="text-lg text-gray-600">Real-time feedback management with date filtering and analytics</p>
            <div className="flex items-center gap-6 mt-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Total: {feedbackList.length} items
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtered: {filteredFeedback.length} items
              </Badge>
              {dateFilter === "today" && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Today's Feedback Only
                </Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowFeedbackModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Submit Feedback
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search feedback by title, description, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="interview_feedback">Interview Feedback</SelectItem>
                  <SelectItem value="general_feedback">General Feedback</SelectItem>
                  <SelectItem value="system_improvement">System Improvement</SelectItem>
                  <SelectItem value="user_experience">User Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
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
                  <span className="text-sm text-gray-600">
                    {autoRefresh ? 'Every 30s' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{t("totalFeedback")}</p>
                <p className="text-3xl font-bold">{feedbackList.length}</p>
                <p className="text-blue-200 text-xs">{t("filtered")}: {filteredFeedback.length}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">{t("highRated")}</p>
                <p className="text-3xl font-bold">
                  {filteredFeedback.filter((f: any) => f.rating && parseInt(f.rating) >= 4).length}
                </p>
                <p className="text-yellow-200 text-xs">4+ {t("stars")}</p>
              </div>
              <Star className="w-10 h-10 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Today's Feedback</p>
                <p className="text-3xl font-bold">
                  {feedbackList.filter((f: any) => isToday(f.createdAt)).length}
                </p>
                <p className="text-green-200 text-xs">New submissions</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Contributors</p>
                <p className="text-3xl font-bold">
                  {new Set(filteredFeedback.map((f: any) => f.submittedBy.id)).size}
                </p>
                <p className="text-purple-200 text-xs">Unique users</p>
              </div>
              <User className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <div className="space-y-6">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-600 mb-4">
                {typeFilter === "all" 
                  ? "No feedback has been submitted yet."
                  : `No ${typeFilter.replace('_', ' ')} feedback found.`
                }
              </p>
              <Button onClick={() => setShowFeedbackModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Submit First Feedback
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                      {item.rating && (
                        <div className="flex space-x-1">
                          {getRatingStars(item.rating)}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4">{item.description}</p>
                    
                    {item.relatedInterviewId && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Related Interview:</p>
                        <p className="text-sm text-gray-900">
                          {getRelatedInterviewTitle(item.relatedInterviewId)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>
                          By {item.submittedBy.firstName} {item.submittedBy.lastName}
                        </span>
                        <span>•</span>
                        <span>{getRelativeTime(item.createdAt)}</span>
                      </div>
                      
                      {(user?.role === "admin" || user?.role === "manager") && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Reply
                          </Button>
                          <Button variant="outline" size="sm">
                            Archive
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <FeedbackModal 
        open={showFeedbackModal} 
        onOpenChange={setShowFeedbackModal} 
        interviews={interviews}
      />
    </div>
    </DashboardLayout>
  );
}