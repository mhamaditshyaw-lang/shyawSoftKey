import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { authenticatedRequest } from "@/lib/auth";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  CheckCircle,
  Calendar,
  PlusCircle,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";

export default function ModernDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
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

  // Remove old notifications query - using device notifications now

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const recentTodosList = recentTodos?.todoLists?.slice(0, 5) || [];
  const recentInterviews = interviewsData?.requests?.slice(0, 3) || [];
  const unreadNotifications = []; // Remove notifications from modern dashboard

  const quickActions = [
    {
      title: "Create Task",
      icon: PlusCircle,
      href: "/todos",
      color: "bg-dashboard-primary text-white",
      description: "Add new task or assignment"
    },
    {
      title: "Schedule Review",
      icon: Calendar,
      href: "/interviews",
      color: "bg-dashboard-accent text-white",
      description: "Book employee evaluation"
    },
    {
      title: "View Reports",
      icon: BarChart3,
      href: "/reports",
      color: "bg-dashboard-secondary text-white",
      description: "Analytics and insights",
      adminOnly: true
    },
    {
      title: "Data Overview",
      icon: Activity,
      href: "/data-view",
      color: "bg-dashboard-error text-white",
      description: "Operational data view"
    }
  ];

  const filteredActions = quickActions.filter(action => 
    !action.adminOnly || user?.role === 'admin'
  );

  return (
    <DashboardLayout notificationCount={unreadNotifications.length}>
      <div className="space-y-6">
        {/* Welcome Section with Shyaw Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-dashboard-primary/5 via-dashboard-accent/5 to-dashboard-primary/10 p-8 border border-dashboard-primary/10 dark:from-dashboard-primary/10 dark:via-dashboard-accent/10 dark:to-dashboard-primary/20 dark:border-dashboard-primary/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-dashboard-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-dashboard-accent/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-dashboard-primary" />
                <h1 className="text-2xl font-bold text-dashboard-text-light dark:text-dashboard-text-dark">
                  {getGreeting()}, {user?.username}!
                </h1>
              </div>
              <p className="text-dashboard-secondary dark:text-dashboard-text-dark/70 mb-1">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-dashboard-secondary/60 dark:text-dashboard-text-dark/60">
                {t("welcomeBack")} {user?.username}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary" className="bg-dashboard-primary/10 text-dashboard-primary">
                {user?.role}
              </Badge>
              <Badge variant="secondary" className="bg-dashboard-accent/10 text-dashboard-accent">
                Active
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <StatsCards stats={stats} isLoading={statsLoading} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-dashboard-text-light dark:text-dashboard-text-dark">
                <Zap className="w-5 h-5 text-dashboard-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href={action.href}>
                        <Button
                          variant="outline"
                          className="w-full h-24 flex-col gap-2 p-4 border-dashboard-secondary/20 hover:border-dashboard-primary/50 hover:bg-dashboard-primary/5 transition-all duration-200"
                        >
                          <div className={`p-2 rounded-md ${action.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-dashboard-secondary/60 dark:text-dashboard-text-dark/60">
                              {action.description}
                            </div>
                          </div>
                        </Button>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-dashboard-text-light dark:text-dashboard-text-dark">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-dashboard-accent" />
                    Recent Tasks
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/todos")}>
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todosLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-dashboard-secondary/5 rounded animate-pulse" />
                    ))}
                  </div>
                ) : recentTodosList.length > 0 ? (
                  <div className="space-y-3">
                    {recentTodosList.map((todo: any) => (
                      <div key={todo.id} className="flex items-center gap-3 p-3 rounded-lg bg-dashboard-bg-light/50 dark:bg-dashboard-secondary/10">
                        <div className="w-2 h-2 rounded-full bg-dashboard-primary"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-dashboard-text-light dark:text-dashboard-text-dark truncate">
                            {todo.title}
                          </p>
                          <p className="text-xs text-dashboard-secondary/60 dark:text-dashboard-text-dark/60">
                            {todo.assignedTo ? `Assigned to ${todo.assignedTo.username}` : 'Unassigned'}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {todo.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-dashboard-secondary/60 dark:text-dashboard-text-dark/60 py-8">
                    No recent tasks found
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Reviews */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-dashboard-text-light dark:text-dashboard-text-dark">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-dashboard-error" />
                    Recent Reviews
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/interviews")}>
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interviewsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-dashboard-secondary/5 rounded animate-pulse" />
                    ))}
                  </div>
                ) : recentInterviews.length > 0 ? (
                  <div className="space-y-3">
                    {recentInterviews.map((interview: any) => (
                      <div key={interview.id} className="flex items-center gap-3 p-3 rounded-lg bg-dashboard-bg-light/50 dark:bg-dashboard-secondary/10">
                        <div className="w-2 h-2 rounded-full bg-dashboard-error"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-dashboard-text-light dark:text-dashboard-text-dark truncate">
                            {interview.requestedBy?.username || 'Unknown'}
                          </p>
                          <p className="text-xs text-dashboard-secondary/60 dark:text-dashboard-text-dark/60">
                            {interview.position || 'Position not specified'}
                          </p>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            interview.status === 'approved' ? 'bg-dashboard-accent/10 text-dashboard-accent' :
                            interview.status === 'rejected' ? 'bg-dashboard-error/10 text-dashboard-error' :
                            'bg-dashboard-secondary/10 text-dashboard-secondary'
                          }`}
                        >
                          {interview.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-dashboard-secondary/60 dark:text-dashboard-text-dark/60 py-8">
                    No recent reviews found
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}