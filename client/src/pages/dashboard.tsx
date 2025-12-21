import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { authenticatedRequest } from "@/lib/auth";
import { useLocation } from "wouter";
import { getRelativeTime } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import {
  Users,
  Clock,
  CheckCircle,
  Calendar,
  PlusCircle,
  BarChart3,
  Star,
  Award,
  TrendingUp,
  Sparkles,
  Search,
  RefreshCw,
  Filter,
  ArrowRight,
  ArrowUp,
  Server,
  Radio
} from "lucide-react";
import { HelpTooltip, FeatureTooltip, StatusTooltip } from "@/components/ui/help-tooltip";
import { useTranslation } from "react-i18next";
import { UserPlus } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { t } = useTranslation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/stats");
      return await response.json();
    },
  });

  const { data: recentTodos, isLoading: todosLoading } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos");
      return await response.json();
    },
  });

  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ["/api/interviews"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/interviews");
      return await response.json();
    },
  });

  // Remove old notifications query - now handled by device notifications

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
        queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
        queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Filter data based on search and date criteria
  const todos = recentTodos?.todoLists || [];
  const interviews = interviewsData?.requests || [];

  const filteredTodos = todos.filter((todo: any) => {
    const matchesSearch = searchTerm === "" || 
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (todo.assignedTo?.firstName + " " + todo.assignedTo?.lastName).toLowerCase().includes(searchTerm.toLowerCase());

    // Date filtering
    let matchesDate = true;
    switch (dateFilter) {
      case "today":
        matchesDate = isToday(todo.createdAt);
        break;
      case "week":
        matchesDate = isThisWeek(todo.createdAt);
        break;
      case "month":
        matchesDate = isThisMonth(todo.createdAt);
        break;
      case "custom":
        matchesDate = matchesCustomDate(todo.createdAt);
        break;
      case "all":
      default:
        matchesDate = true;
        break;
    }

    return matchesSearch && matchesDate;
  });

  const filteredInterviews = interviews.filter((interview: any) => {
    const matchesSearch = searchTerm === "" || 
      interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filtering
    let matchesDate = true;
    switch (dateFilter) {
      case "today":
        matchesDate = isToday(interview.createdAt);
        break;
      case "week":
        matchesDate = isThisWeek(interview.createdAt);
        break;
      case "month":
        matchesDate = isThisMonth(interview.createdAt);
        break;
      case "custom":
        matchesDate = matchesCustomDate(interview.createdAt);
        break;
      case "all":
      default:
        matchesDate = true;
        break;
    }

    return matchesSearch && matchesDate;
  });

  const { data: recentInterviews } = useQuery({
    queryKey: ["/api/interviews"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/interviews");
      return await response.json();
    },
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 300
      }
    }
  };

  const welcomeVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        type: "spring",
        stiffness: 80
      }
    }
  };

  const iconVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300
      }
    },
    tap: { 
      scale: 0.95,
      rotate: -5,
      transition: {
        duration: 0.1
      }
    }
  };

  const statsCardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const isLoading = statsLoading || todosLoading || interviewsLoading;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Modern Dashboard Header */}
      <motion.div 
        className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-purple-50 to-purple-50 p-8 shadow-lg border border-purple-100"
        variants={welcomeVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-purple-600/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-purple-200/20 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-purple-200/20 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-purple-300/10 rounded-full"></div>

        <div className="relative z-10">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center space-x-3 mb-4"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-8 h-8 text-purple-500" />
            </motion.div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-transparent">
                  {getGreeting()}, {user?.firstName || user?.username}!
                </h1>
                <HelpTooltip
                  content="Your personalized dashboard shows real-time system statistics, recent activities, and quick access to key functions. Data automatically refreshes to keep you informed of current operations."
                  type="info"
                />
              </div>
              <p className="text-lg text-gray-600 mt-1">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </motion.div>

          <motion.p 
            className="text-purple-700 text-lg mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Ready to make today productive? Here's your employee affairs overview.
          </motion.p>

          {/* Quick stats badges */}
          <motion.div 
            className="flex flex-wrap gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div 
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                {user?.role === 'admin' ? 'Administrator' : 
                 user?.role === 'manager' ? 'Manager' : 'Secretary'}
              </span>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Filter className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-medium text-gray-700">
                {filteredTodos.length} todos, {filteredInterviews.length} interviews
              </span>
            </motion.div>

            {dateFilter === "today" && (
              <motion.div 
                className="flex items-center space-x-2 bg-purple-100/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-purple-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Today's Data Only
                </span>
              </motion.div>
            )}

            <motion.div 
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Active Status</span>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Award className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Employee Affairs</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modern Search and Filter Controls */}
      <motion.div
        variants={cardVariants}
        className="mb-8"
      >
        <Card className="border-purple-100 shadow-lg bg-purple-600">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Date Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-purple-500 p-4 rounded-lg border border-purple-400">
                <div className="space-y-2">
                  <Label htmlFor="date-filter" className="text-sm font-medium flex items-center gap-2 text-white">
                    <Calendar className="w-4 h-4" />
                    Date Filter
                  </Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="date-filter" className="border-purple-300 focus:border-purple-600 bg-white text-purple-700">
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
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="custom-date" className="text-sm font-medium text-white">
                      Select Date
                    </Label>
                    <Input
                      id="custom-date"
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="border-purple-300 focus:border-purple-600 focus:ring-purple-600 bg-white text-purple-700"
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="auto-refresh" className="text-sm font-medium flex items-center gap-2 text-white">
                    <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin text-white' : 'text-gray-200'}`} />
                    Auto Refresh
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                    <span className="text-sm text-white">
                      {autoRefresh ? 'Every 30s' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {user?.role === "admin" && stats && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 border-purple-100 bg-gradient-to-br from-purple-600 to-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Total Employees</p>
                    <motion.p 
                      className="text-3xl font-bold text-white mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                      {stats.users.totalUsers}
                    </motion.p>
                    <p className="text-sm text-blue-600 mt-2 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      {stats.users.activeUsers} active
                    </p>
                  </div>
                  <motion.div 
                    className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 border-purple-100 bg-gradient-to-br from-purple-600 to-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Pending Reviews</p>
                    <motion.p 
                      className="text-3xl font-bold text-white mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    >
                      {stats.interviews.pendingRequests}
                    </motion.p>
                    <p className="text-sm text-blue-600 mt-2 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Needs attention
                    </p>
                  </div>
                  <motion.div 
                    className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Clock className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 border-purple-100 bg-gradient-to-br from-purple-600 to-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Completed Tasks</p>
                    <motion.p 
                      className="text-3xl font-bold text-white mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    >
                      {stats.todos.completedTodos}
                    </motion.p>
                    <p className="text-sm text-blue-600 mt-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      This period
                    </p>
                  </div>
                  <motion.div 
                    className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 border-purple-100 bg-gradient-to-br from-purple-600 to-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">System Health</p>
                    <motion.p 
                      className="text-3xl font-bold text-white mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    >
                      98%
                    </motion.p>
                    <p className="text-sm text-blue-600 mt-2 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      All systems operational
                    </p>
                  </div>
                  <motion.div 
                    className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Server className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      <motion.div 
        className="grid grid-cols-1 xl:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="w-5 h-5 text-blue-600" />
                </motion.div>
                <span>{t("recentActivity")}</span>
                <FeatureTooltip
                  feature="Activity Feed"
                  description="Live view of recent system activities including interview requests, task updates, and employee changes. Updates automatically with real-time data."
                  shortcut="Auto-refreshes every 30s"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInterviews?.requests?.slice(0, 3).map((request: any, index: number) => (
                  <motion.div 
                    key={request.id} 
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 1, duration: 0.4 }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Calendar className="w-4 h-4 text-primary" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">Employee review for {request.position}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {request.candidateName} - {request.requestedBy.firstName} {request.requestedBy.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(request.createdAt)}
                      </p>
                    </div>
                    <Badge variant={request.status === "pending" ? "secondary" : request.status === "approved" ? "default" : "destructive"}>
                      {request.status}
                    </Badge>
                  </motion.div>
                ))}

                {recentTodos?.todoLists?.slice(0, 2).map((list: any, index: number) => (
                  <motion.div 
                    key={list.id} 
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: (index + 3) * 0.1 + 1, duration: 0.4 }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">Task list updated: {list.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {list.items.length} tasks - {list.createdBy.firstName} {list.createdBy.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(list.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modern Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-xl transition-all duration-300 border-purple-100 bg-gradient-to-br from-purple-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <span>{t("quickActions")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {user?.role === "admin" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="outline"
                      className="p-6 h-auto flex-col space-y-2 w-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100 bg-white/80 text-purple-700 hover:text-purple-800 transition-all duration-300 shadow-sm hover:shadow-md"
                      onClick={() => setLocation("/users")}
                    >
                      <motion.div variants={iconVariants}>
                        <UserPlus className="w-8 h-8" />
                      </motion.div>
                      <span className="font-medium">{t("addEmployee")}</span>
                    </Button>
                  </motion.div>
                )}

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="outline"
                    className="p-6 h-auto flex-col space-y-2 w-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100 bg-white/80 text-purple-700 hover:text-purple-800 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => setLocation("/interviews")}
                  >
                    <motion.div variants={iconVariants}>
                      <Calendar className="w-8 h-8" />
                    </motion.div>
                    <span className="font-medium">
                      {user?.role === "security" ? t("scheduleReview") : t("employeeReviews")}
                    </span>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="outline"
                    className="p-6 h-auto flex-col space-y-2 w-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100 bg-white/80 text-purple-700 hover:text-purple-800 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => setLocation("/todos")}
                  >
                    <motion.div variants={iconVariants}>
                      <PlusCircle className="w-8 h-8" />
                    </motion.div>
                    <span className="font-medium">{t("createTask")}</span>
                  </Button>
                </motion.div>

                {user?.role === "admin" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="outline"
                      className="p-6 h-auto flex-col space-y-2 w-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100 bg-white/80 text-purple-700 hover:text-purple-800 transition-all duration-300 shadow-sm hover:shadow-md"
                      onClick={() => setLocation("/reports")}
                    >
                      <motion.div variants={iconVariants}>
                        <BarChart3 className="w-8 h-8" />
                      </motion.div>
                      <span className="font-medium">{t("viewReports")}</span>
                    </Button>
                  </motion.div>
                )}

                {user?.role === "admin" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="outline"
                      className="p-6 h-auto flex-col space-y-2 w-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100 bg-white/80 text-purple-700 hover:text-purple-800 transition-all duration-300 shadow-sm hover:shadow-md"
                      onClick={() => setLocation("/broadcast-notification")}
                    >
                      <motion.div variants={iconVariants}>
                        <Radio className="w-8 h-8" />
                      </motion.div>
                      <span className="font-medium">Broadcast</span>
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}