import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { authenticatedRequest } from "@/lib/auth";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle2,
  Circle,
  TrendingUp,
  AlertCircle,
  Clock,
  Target,
  Sparkles,
} from "lucide-react";

interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  managerId?: number;
  position?: string;
  department?: string;
}

interface TodoItem {
  id: number;
  title: string;
  isCompleted: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
}

interface TodoList {
  id: number;
  title: string;
  items: TodoItem[];
  assignedToId?: number;
  assignedTo?: TeamMember;
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Fetch users (team members)
  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  // Fetch todos
  const { data: todosData, isLoading } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos");
      if (!response.ok) throw new Error("Failed to fetch todos");
      return response.json();
    },
  });

  // Get team members managed by this user
  const teamMembers = usersData?.users?.filter(
    (u: TeamMember) => u.managerId === user?.id
  ) || [];

  // Calculate statistics
  const calculateStats = () => {
    const allTodos = todosData?.todoLists || [];
    const teamTodos = allTodos.filter((list: TodoList) =>
      teamMembers.some((member: TeamMember) => member.id === list.assignedToId)
    );

    const totalTasks = teamTodos.reduce(
      (sum: number, list: TodoList) => sum + (list.items?.length || 0),
      0
    );
    const completedTasks = teamTodos.reduce(
      (sum: number, list: TodoList) =>
        sum + (list.items?.filter((item: TodoItem) => item.isCompleted).length || 0),
      0
    );
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      teamMembersCount: teamMembers.length,
      totalTasks,
      completedTasks,
      completionRate,
      pendingTasks: totalTasks - completedTasks,
    };
  };

  const stats = calculateStats();

  // Get todos for each team member
  const getTeamMemberTodos = (memberId: number) => {
    return (
      todosData?.todoLists?.filter(
        (list: TodoList) => list.assignedToId === memberId
      ) || []
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600 mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              {t("managerDashboard") || "Team Dashboard"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage and monitor your team's tasks and performance
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                    {stats.teamMembersCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Team Members
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                    {stats.totalTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Total Tasks
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-300">
                    {stats.completedTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Completed
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-300">
                    {stats.pendingTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Pending
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 border-indigo-200 dark:border-indigo-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                    {stats.completionRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Completion Rate
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Team Members Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your Team Members
          </h2>
          {teamMembers.length > 0 ? (
            <div className="grid gap-6">
              {teamMembers.map((member: TeamMember, index: number) => {
                const memberTodos = getTeamMemberTodos(member.id);
                const memberTasks = memberTodos.reduce(
                  (sum: number, list: TodoList) => sum + (list.items?.length || 0),
                  0
                );
                const memberCompleted = memberTodos.reduce(
                  (sum: number, list: TodoList) =>
                    sum + (list.items?.filter((item: TodoItem) => item.isCompleted).length || 0),
                  0
                );

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-gray-900 dark:text-white">
                              {member.firstName} {member.lastName}
                            </CardTitle>
                            <div className="space-y-1 mt-2">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                📧 {member.email}
                              </p>
                              {member.position && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  👔 {member.position}
                                </p>
                              )}
                              {member.department && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  🏢 {member.department}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 text-right">
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {memberTodos.length > 0 ? (
                          <div className="space-y-4">
                            {/* Task Statistics */}
                            <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                  {memberTasks}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Total Tasks
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {memberCompleted}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Completed
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {memberTasks > 0
                                    ? Math.round((memberCompleted / memberTasks) * 100)
                                    : 0}
                                  %
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Progress
                                </div>
                              </div>
                            </div>

                            {/* Task Lists */}
                            <div className="space-y-2">
                              {memberTodos.map((list: TodoList) => (
                                <div
                                  key={list.id}
                                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {list.title}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    {list.items?.slice(0, 3).map((item: TodoItem) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center gap-2 text-xs"
                                      >
                                        {item.isCompleted ? (
                                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                                        ) : (
                                          <Circle className="w-3 h-3 text-gray-400" />
                                        )}
                                        <span
                                          className={
                                            item.isCompleted
                                              ? "text-green-600 dark:text-green-400 line-through"
                                              : "text-gray-700 dark:text-gray-300"
                                          }
                                        >
                                          {item.title}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${getPriorityColor(
                                            item.priority
                                          )}`}
                                        >
                                          {item.priority}
                                        </Badge>
                                      </div>
                                    ))}
                                    {(list.items?.length || 0) > 3 && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        +{(list.items?.length || 0) - 3} more tasks
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No tasks assigned yet
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center text-gray-600 dark:text-gray-300 flex flex-col items-center gap-2">
                  <Users className="w-8 h-8 text-gray-400" />
                  <p>You don't have any team members yet</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
