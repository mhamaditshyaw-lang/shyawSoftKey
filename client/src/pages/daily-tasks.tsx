import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authenticatedRequest } from "@/lib/auth";
import { motion } from "framer-motion";
import { 
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Filter,
  Search,
  Zap,
  TrendingUp,
  Target,
  Star
} from "lucide-react";

export default function DailyTasksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  const { data: todosData, isLoading } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos");
      return await response.json();
    },
  });

  const { data: prioritiesData } = useQuery({
    queryKey: ["/api/todos/priorities"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos/priorities");
      return await response.json();
    },
  });

  const todos = todosData?.todoLists || [];
  const priorities = prioritiesData?.priorities || [];

  // Filter todos based on criteria
  const filteredTodos = todos.filter((todo: any) => {
    const matchesSearch = searchTerm === "" || 
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === "all" || todo.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && todo.items?.every((item: any) => item.completed)) ||
      (statusFilter === "pending" && todo.items?.some((item: any) => !item.completed));

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-dashboard-error/10 text-dashboard-error border-dashboard-error/20";
      case "medium":
        return "bg-dashboard-primary/10 text-dashboard-primary border-dashboard-primary/20";
      case "low":
        return "bg-dashboard-accent/10 text-dashboard-accent border-dashboard-accent/20";
      default:
        return "bg-dashboard-secondary/10 text-dashboard-secondary border-dashboard-secondary/20";
    }
  };

  const getCompletionRate = (todo: any) => {
    if (!todo.items || todo.items.length === 0) return 0;
    const completed = todo.items.filter((item: any) => item.completed).length;
    return Math.round((completed / todo.items.length) * 100);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="mb-8">
            <div className="h-8 bg-dashboard-secondary/20 rounded w-64 mb-2"></div>
            <div className="h-4 bg-dashboard-secondary/20 rounded w-96"></div>
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-dashboard-secondary/20 rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-dashboard-text-light dark:text-dashboard-text-dark mb-2 flex items-center gap-3">
                <Zap className="w-8 h-8 text-dashboard-primary" />
                Daily Task Management
              </h2>
              <p className="text-dashboard-secondary dark:text-dashboard-text-dark/70">
                Manage and prioritize your daily tasks efficiently
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-dashboard-accent/10 text-dashboard-accent">
                {filteredTodos.length} Tasks
              </Badge>
              <Badge variant="secondary" className="bg-dashboard-primary/10 text-dashboard-primary">
                Today
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-dashboard-text-light dark:text-dashboard-text-dark">
              <Filter className="w-5 h-5 text-dashboard-primary" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dashboard-secondary/50" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <div className="grid gap-4">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo: any, index: number) => {
              const completionRate = getCompletionRate(todo);
              const isCompleted = completionRate === 100;
              
              return (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`transition-all duration-200 hover:shadow-lg ${
                    isCompleted ? 'bg-dashboard-accent/5 border-dashboard-accent/20' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className={`flex items-center gap-3 text-dashboard-text-light dark:text-dashboard-text-dark ${
                            isCompleted ? 'line-through opacity-70' : ''
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-dashboard-accent" />
                            ) : (
                              <Circle className="w-5 h-5 text-dashboard-secondary" />
                            )}
                            {todo.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {todo.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(todo.priority)}>
                            {todo.priority}
                          </Badge>
                          {todo.assignedTo && (
                            <Badge variant="secondary">
                              {todo.assignedTo.username}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-dashboard-secondary dark:text-dashboard-text-dark/70">
                              Progress
                            </span>
                            <span className="text-sm font-medium text-dashboard-text-light dark:text-dashboard-text-dark">
                              {completionRate}%
                            </span>
                          </div>
                          <div className="w-full bg-dashboard-secondary/20 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isCompleted ? 'bg-dashboard-accent' : 'bg-dashboard-primary'
                              }`}
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Task Items */}
                        {todo.items && todo.items.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-dashboard-text-light dark:text-dashboard-text-dark">
                              Sub-tasks ({todo.items.filter((item: any) => item.completed).length}/{todo.items.length})
                            </span>
                            <div className="space-y-1">
                              {todo.items.slice(0, 3).map((item: any) => (
                                <div key={item.id} className="flex items-center gap-2 text-sm">
                                  {item.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-dashboard-accent" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-dashboard-secondary" />
                                  )}
                                  <span className={item.completed ? 'line-through opacity-70' : ''}>
                                    {item.title}
                                  </span>
                                </div>
                              ))}
                              {todo.items.length > 3 && (
                                <div className="text-xs text-dashboard-secondary/60 dark:text-dashboard-text-dark/60">
                                  +{todo.items.length - 3} more items
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-dashboard-secondary/10">
                          <div className="flex items-center gap-4 text-sm text-dashboard-secondary/60 dark:text-dashboard-text-dark/60">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(todo.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Due: {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No deadline'}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover:bg-dashboard-primary/10 hover:border-dashboard-primary/50"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto text-dashboard-secondary/50 mb-4" />
                <h3 className="text-lg font-medium text-dashboard-text-light dark:text-dashboard-text-dark mb-2">
                  No tasks found
                </h3>
                <p className="text-dashboard-secondary/60 dark:text-dashboard-text-dark/60">
                  Adjust your filters or create new tasks to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Priority Recommendations */}
        {priorities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-dashboard-text-light dark:text-dashboard-text-dark">
                <Star className="w-5 h-5 text-dashboard-accent" />
                Smart Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered task prioritization based on your patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {priorities.slice(0, 3).map((priority: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-dashboard-bg-light/50 dark:bg-dashboard-secondary/10">
                    <div className="flex-1">
                      <p className="font-medium text-dashboard-text-light dark:text-dashboard-text-dark">
                        Focus on {priority.recommendation}
                      </p>
                      <p className="text-sm text-dashboard-secondary/60 dark:text-dashboard-text-dark/60">
                        Priority Score: {Math.round(priority.score)}/100
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-dashboard-accent" />
                      <Badge variant="secondary" className="bg-dashboard-accent/10 text-dashboard-accent">
                        High Impact
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}