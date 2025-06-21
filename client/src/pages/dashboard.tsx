import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { authenticatedRequest } from "@/lib/auth";
import { useLocation } from "wouter";
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
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      if (user?.role !== "admin") return null;
      const response = await authenticatedRequest("GET", "/api/stats");
      return await response.json();
    },
    enabled: user?.role === "admin",
  });

  const { data: recentTodos } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos");
      return await response.json();
    },
  });

  const { data: recentInterviews } = useQuery({
    queryKey: ["/api/interviews"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/interviews");
      return await response.json();
    },
  });

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
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back, here's what's happening in your organization</p>
      </div>

      {user?.role === "admin" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.totalUsers}</p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    {stats.users.activeUsers} active
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.interviews.pendingRequests}</p>
                  <p className="text-sm text-yellow-600 mt-2 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Needs attention
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todos.completedTodos}</p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    This period
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">98%</p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    All systems operational
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Server className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInterviews?.requests?.slice(0, 3).map((request: any) => (
                <div key={request.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Interview request for {request.position}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {request.candidateName} - {request.requestedBy.firstName} {request.requestedBy.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.createdAt).toRelativeTimeString()}
                    </p>
                  </div>
                  <Badge variant={request.status === "pending" ? "secondary" : request.status === "approved" ? "default" : "destructive"}>
                    {request.status}
                  </Badge>
                </div>
              ))}

              {recentTodos?.todoLists?.slice(0, 2).map((list: any) => (
                <div key={list.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Todo list updated: {list.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {list.items.length} tasks - {list.createdBy.firstName} {list.createdBy.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(list.createdAt).toRelativeTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {user?.role === "admin" && (
                <Button
                  variant="outline"
                  className="p-6 h-auto flex-col space-y-2"
                  onClick={() => setLocation("/users")}
                >
                  <UserPlus className="w-8 h-8 text-primary" />
                  <span>Add User</span>
                </Button>
              )}

              <Button
                variant="outline"
                className="p-6 h-auto flex-col space-y-2"
                onClick={() => setLocation("/interviews")}
              >
                <Calendar className="w-8 h-8 text-green-600" />
                <span>
                  {user?.role === "secretary" ? "Request Interview" : "Review Requests"}
                </span>
              </Button>

              <Button
                variant="outline"
                className="p-6 h-auto flex-col space-y-2"
                onClick={() => setLocation("/todos")}
              >
                <PlusCircle className="w-8 h-8 text-purple-600" />
                <span>Create Todo</span>
              </Button>

              {user?.role === "admin" && (
                <Button
                  variant="outline"
                  className="p-6 h-auto flex-col space-y-2"
                  onClick={() => setLocation("/reports")}
                >
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                  <span>View Reports</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
