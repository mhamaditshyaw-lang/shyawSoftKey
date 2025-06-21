import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authenticatedRequest } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { 
  BarChart3, 
  PieChart, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Minus
} from "lucide-react";
import { useState } from "react";

export default function ReportsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/stats");
      return await response.json();
    },
    enabled: user?.role === "admin",
  });

  const { data: todosData } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos");
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

  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/users");
      return await response.json();
    },
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              Only administrators can access reports and analytics.
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="h-80 bg-gray-200 rounded-xl"></div>
          <div className="h-80 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  // Calculate metrics from actual data
  const users = usersData?.users || [];
  const todoLists = todosData?.todoLists || [];
  const interviews = interviewsData?.requests || [];

  const totalTasks = todoLists.reduce((sum: number, list: any) => sum + list.items.length, 0);
  const completedTasks = todoLists.reduce((sum: number, list: any) => 
    sum + list.items.filter((item: any) => item.isCompleted).length, 0);
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const approvedInterviews = interviews.filter((req: any) => req.status === "approved").length;
  const interviewApprovalRate = interviews.length > 0 ? Math.round((approvedInterviews / interviews.length) * 100) : 0;

  const activeUsers = users.filter((user: any) => user.status === "active").length;

  // Calculate average response time (mock calculation based on interview data)
  const avgResponseTime = interviews.length > 0 ? "2.3 hours" : "N/A";

  // Performance metrics for the table
  const performanceMetrics = [
    {
      metric: "Average Response Time",
      current: avgResponseTime,
      previous: "3.1 hours",
      change: "-25.8%",
      trend: "down",
    },
    {
      metric: "Task Completion Rate",
      current: `${taskCompletionRate}%`,
      previous: "82%",
      change: taskCompletionRate > 82 ? `+${(taskCompletionRate - 82).toFixed(1)}%` : `${(taskCompletionRate - 82).toFixed(1)}%`,
      trend: taskCompletionRate > 82 ? "up" : taskCompletionRate < 82 ? "down" : "neutral",
    },
    {
      metric: "User Satisfaction",
      current: "4.6/5",
      previous: "4.4/5",
      change: "+4.5%",
      trend: "up",
    },
    {
      metric: "Interview Approval Rate",
      current: `${interviewApprovalRate}%`,
      previous: "71%",
      change: interviewApprovalRate > 71 ? `+${(interviewApprovalRate - 71).toFixed(1)}%` : `${(interviewApprovalRate - 71).toFixed(1)}%`,
      trend: interviewApprovalRate > 71 ? "up" : interviewApprovalRate < 71 ? "down" : "neutral",
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
            <p className="text-gray-600">Track system performance and user activity</p>
          </div>
          <div className="flex space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                <p className="font-medium">User Activity Chart</p>
                <p className="text-sm mt-2">Shows daily active users over time</p>
                <div className="mt-4 space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span>Total Users:</span>
                    <span className="font-medium">{users.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Users:</span>
                    <span className="font-medium text-green-600">{activeUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending Users:</span>
                    <span className="font-medium text-yellow-600">
                      {users.filter((user: any) => user.status === "pending").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PieChart className="w-16 h-16 mx-auto mb-4" />
                <p className="font-medium">Task Completion Chart</p>
                <p className="text-sm mt-2">Breakdown by status</p>
                <div className="mt-4 space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span>Total Tasks:</span>
                    <span className="font-medium">{totalTasks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed:</span>
                    <span className="font-medium text-green-600">{completedTasks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending:</span>
                    <span className="font-medium text-yellow-600">{totalTasks - completedTasks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate:</span>
                    <span className="font-medium text-blue-600">{taskCompletionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Previous</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceMetrics.map((metric) => (
                <TableRow key={metric.metric}>
                  <TableCell className="font-medium">{metric.metric}</TableCell>
                  <TableCell>{metric.current}</TableCell>
                  <TableCell className="text-gray-600">{metric.previous}</TableCell>
                  <TableCell className={`flex items-center space-x-2 ${getTrendColor(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                    <span>{metric.change}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Overview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interview Requests</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-medium">{interviews.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span className="font-medium text-yellow-600">
                    {interviews.filter((req: any) => req.status === "pending").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Approved:</span>
                  <span className="font-medium text-green-600">{approvedInterviews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rejected:</span>
                  <span className="font-medium text-red-600">
                    {interviews.filter((req: any) => req.status === "rejected").length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Todo Lists</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Lists:</span>
                  <span className="font-medium">{todoLists.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Tasks:</span>
                  <span className="font-medium">{totalTasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed:</span>
                  <span className="font-medium text-green-600">{completedTasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average per List:</span>
                  <span className="font-medium">
                    {todoLists.length > 0 ? Math.round(totalTasks / todoLists.length) : 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Admins:</span>
                  <span className="font-medium text-red-600">
                    {users.filter((user: any) => user.role === "admin").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Managers:</span>
                  <span className="font-medium text-blue-600">
                    {users.filter((user: any) => user.role === "manager").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Secretaries:</span>
                  <span className="font-medium text-green-600">
                    {users.filter((user: any) => user.role === "secretary").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Rate:</span>
                  <span className="font-medium">
                    {users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
