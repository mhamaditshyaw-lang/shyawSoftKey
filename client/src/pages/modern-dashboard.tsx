import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { authenticatedRequest } from "@/lib/auth";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  CheckCircle,
  Calendar,
  PlusCircle,
  BarChart3,
  ArrowRight,
  Activity,
  HelpCircle,
  ListTodo,
  Users,
} from "lucide-react";

export default function ModernDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const recentTodosList = recentTodos?.todoLists?.slice(0, 5) || [];
  const recentInterviews = interviewsData?.requests?.slice(0, 3) || [];

  const quickActions = [
    {
      title: "Create Task",
      icon: PlusCircle,
      href: "/todos",
      color: "bg-[#0079bf]",
      description: "Add new task"
    },
    {
      title: "Schedule Review",
      icon: Calendar,
      href: "/interviews",
      color: "bg-[#61bd4f]",
      description: "Book evaluation"
    },
    {
      title: "IT Helpdesk",
      icon: HelpCircle,
      href: "/it-support-request",
      color: "bg-[#c377e0]",
      description: "Submit request"
    },
    {
      title: "View Reports",
      icon: BarChart3,
      href: "/reports",
      color: "bg-[#ff9f1a]",
      description: "Analytics",
      adminOnly: true
    }
  ];

  const filteredActions = quickActions.filter(action => 
    !action.adminOnly || user?.role === 'admin'
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="trello-card p-6" data-testid="card-welcome">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {getGreeting()}, {user?.username}!
              </h1>
              <p className="text-muted-foreground">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <Badge className="trello-badge-blue capitalize">{user?.role}</Badge>
          </div>
        </div>

        <StatsCards stats={stats} isLoading={statsLoading} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className="trello-card trello-card-hover p-4 text-center group" data-testid={`action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-sm text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="trello-card" data-testid="card-recent-tasks">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-[#0079bf]" />
                <h3 className="font-semibold">Recent Tasks</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/todos")} data-testid="btn-view-all-tasks">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="p-4">
              {todosLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentTodosList.length > 0 ? (
                <div className="space-y-2">
                  {recentTodosList.map((todo: any) => (
                    <div key={todo.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors" data-testid={`task-item-${todo.id}`}>
                      <CheckCircle className="w-4 h-4 text-[#61bd4f] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{todo.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {todo.assignedTo ? `Assigned to ${todo.assignedTo.username}` : 'Unassigned'}
                        </p>
                      </div>
                      <Badge className={`text-xs ${
                        todo.priority === 'high' ? 'trello-badge-red' : 
                        todo.priority === 'medium' ? 'trello-badge-yellow' : 
                        'trello-badge-gray'
                      }`}>
                        {todo.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="trello-empty-state">
                  <ListTodo className="trello-empty-icon" />
                  <p className="trello-empty-title">No tasks yet</p>
                  <p className="trello-empty-desc">Create your first task to get started</p>
                </div>
              )}
            </div>
          </div>

          <div className="trello-card" data-testid="card-recent-reviews">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#c377e0]" />
                <h3 className="font-semibold">Recent Reviews</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/interviews")} data-testid="btn-view-all-reviews">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="p-4">
              {interviewsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentInterviews.length > 0 ? (
                <div className="space-y-2">
                  {recentInterviews.map((interview: any) => (
                    <div key={interview.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors" data-testid={`review-item-${interview.id}`}>
                      <div className="trello-avatar trello-avatar-sm bg-[#c377e0]">
                        {interview.requestedBy?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {interview.requestedBy?.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {interview.position || 'Position not specified'}
                        </p>
                      </div>
                      <Badge className={`text-xs ${
                        interview.status === 'approved' ? 'trello-badge-green' :
                        interview.status === 'rejected' ? 'trello-badge-red' :
                        'trello-badge-yellow'
                      }`}>
                        {interview.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="trello-empty-state">
                  <Users className="trello-empty-icon" />
                  <p className="trello-empty-title">No reviews yet</p>
                  <p className="trello-empty-desc">Schedule a review to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
