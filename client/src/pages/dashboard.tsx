import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { authenticatedRequest } from "@/lib/auth";
import { useLocation } from "wouter";
import { getRelativeTime } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassBadge } from "@/components/ui/glass-badge";
import { SearchFilter } from "@/components/ui/search-filter";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { Link } from "wouter";
import {
  Users,
  Clock,
  CheckCircle,
  Server,
  ArrowUp,
  UserPlus,
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
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/notifications");
      return await response.json();
    },
  });

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
        className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 shadow-lg border border-green-100"
        variants={welcomeVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-green-200/20 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-emerald-200/20 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-teal-300/10 rounded-full"></div>
        
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
              <Sparkles className="w-8 h-8 text-green-500" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {getGreeting()}, {user?.firstName || user?.username}!
              </h1>
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
            className="text-green-700 text-lg mb-6"
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
              <Filter className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                {filteredTodos.length} todos, {filteredInterviews.length} interviews
              </span>
            </motion.div>
            
            {dateFilter === "today" && (
              <motion.div 
                className="flex items-center space-x-2 bg-green-100/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-green-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
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
        <Card className="border-green-100 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                    <Input
                      placeholder="Search todos, interviews, or users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Date Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/50 p-4 rounded-lg border border-green-200">
                <div className="space-y-2">
                  <Label htmlFor="date-filter" className="text-sm font-medium flex items-center gap-2 text-green-700">
                    <Calendar className="w-4 h-4" />
                    Date Filter
                  </Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="date-filter" className="border-green-200 focus:border-green-500">
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
                    <Label htmlFor="custom-date" className="text-sm font-medium text-green-700">
                      Select Date
                    </Label>
                    <Input
                      id="custom-date"
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="auto-refresh" className="text-sm font-medium flex items-center gap-2 text-green-700">
                    <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin text-green-600' : 'text-gray-400'}`} />
                    Auto Refresh
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                    <span className="text-sm text-green-600">
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
            <Card className="hover:shadow-xl transition-all duration-300 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Employees</p>
                    <motion.p 
                      className="text-3xl font-bold text-green-800 mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                      {stats.users.totalUsers}
                    </motion.p>
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      {stats.users.activeUsers} active
                    </p>
                  </div>
                  <motion.div 
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Users className="w-6 h-6 text-green-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600">Pending Reviews</p>
                    <motion.p 
                      className="text-3xl font-bold text-emerald-800 mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    >
                      {stats.interviews.pendingRequests}
                    </motion.p>
                    <p className="text-sm text-emerald-600 mt-2 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Needs attention
                    </p>
                  </div>
                  <motion.div 
                    className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-600">Completed Tasks</p>
                    <motion.p 
                      className="text-3xl font-bold text-teal-800 mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    >
                      {stats.todos.completedTodos}
                    </motion.p>
                    <p className="text-sm text-teal-600 mt-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      This period
                    </p>
                  </div>
                  <motion.div 
                    className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="w-6 h-6 text-teal-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 border-cyan-100 bg-gradient-to-br from-cyan-50 to-sky-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-600">System Health</p>
                    <motion.p 
                      className="text-3xl font-bold text-cyan-800 mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    >
                      98%
                    </motion.p>
                    <p className="text-sm text-cyan-600 mt-2 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      All systems operational
                    </p>
                  </div>
                  <motion.div 
                    className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Server className="w-6 h-6 text-cyan-600" />
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
                <span>Recent Activity</span>
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
                      className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
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
                      className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
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
          <Card className="hover:shadow-xl transition-all duration-300 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Sparkles className="w-5 h-5 text-green-600" />
                </motion.div>
                <span>Quick Actions</span>
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
                      className="p-6 h-auto flex-col space-y-2 w-full border-2 border-green-200 hover:border-green-400 hover:bg-green-100 bg-white/80 text-green-700 hover:text-green-800 transition-all duration-300 shadow-sm hover:shadow-md"
                      onClick={() => setLocation("/users")}
                    >
                      <motion.div variants={iconVariants}>
                        <UserPlus className="w-8 h-8" />
                      </motion.div>
                      <span className="font-medium">Add Employee</span>
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
                    className="p-6 h-auto flex-col space-y-2 w-full border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 bg-white/80 text-emerald-700 hover:text-emerald-800 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => setLocation("/interviews")}
                  >
                    <motion.div variants={iconVariants}>
                      <Calendar className="w-8 h-8" />
                    </motion.div>
                    <span className="font-medium">
                      {user?.role === "secretary" ? "Schedule Review" : "Employee Reviews"}
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
                    className="p-6 h-auto flex-col space-y-2 w-full border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-100 bg-white/80 text-teal-700 hover:text-teal-800 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => setLocation("/todos")}
                  >
                    <motion.div variants={iconVariants}>
                      <PlusCircle className="w-8 h-8" />
                    </motion.div>
                    <span className="font-medium">Create Task</span>
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
                      className="p-6 h-auto flex-col space-y-2 w-full border-2 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-100 bg-white/80 text-cyan-700 hover:text-cyan-800 transition-all duration-300 shadow-sm hover:shadow-md"
                      onClick={() => setLocation("/reports")}
                    >
                      <motion.div variants={iconVariants}>
                        <BarChart3 className="w-8 h-8" />
                      </motion.div>
                      <span className="font-medium">View Reports</span>
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
