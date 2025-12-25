import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { AlertCircle, CheckCircle2, Circle, Sparkles, Eye, Search, Filter, Plus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface TodoItem {
  id: number;
  title: string;
  isCompleted: boolean;
  completedByNote?: string;
  priority: "low" | "medium" | "high";
}

interface TodoList {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  items: TodoItem[];
  createdBy: any;
  assignedTo: any;
}

export default function ManagerTodosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newListPriority, setNewListPriority] = useState<"low" | "medium" | "high">("medium");

  // Fetch manager-specific todos data
  const { data: todosData, isLoading, refetch } = useQuery({
    queryKey: ["/api/manager-todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/manager-todos");
      if (!response.ok) throw new Error("Failed to fetch manager todos");
      return response.json();
    },
    enabled: !!user && (user.role === "admin" || user.role === "manager"),
  });

  // Create todo list mutation
  const createTodoListMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; priority: string }) => {
      const response = await authenticatedRequest("POST", "/api/todos", data);
      if (!response.ok) throw new Error("Failed to create task list");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager-todos"] });
      setShowCreateForm(false);
      setNewListTitle("");
      setNewListDescription("");
      setNewListPriority("medium");
      toast({
        title: "Success",
        description: "Task list created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task list",
        variant: "destructive",
      });
    },
  });

  const handleCreateTodoList = () => {
    if (!newListTitle.trim()) return;
    createTodoListMutation.mutate({
      title: newListTitle,
      description: newListDescription,
      priority: newListPriority,
    });
  };

  // Filter logic
  const filteredTodoLists = (todosData?.todoLists || []).filter((list: TodoList) => {
    const matchesSearch = searchTerm === "" || 
      list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (list.createdBy?.firstName + " " + list.createdBy?.lastName).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === "all" || list.priority === priorityFilter;
    
    let matchesStatus = true;
    if (statusFilter === "completed") {
      matchesStatus = list.items.length > 0 && list.items.every(item => item.isCompleted);
    } else if (statusFilter === "pending") {
      matchesStatus = list.items.some(item => !item.isCompleted);
    }

    return matchesSearch && matchesPriority && matchesStatus;
  });

  if (user?.role !== "manager" && user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>Only managers and admins can access this page</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-dashboard-primary" />
              {t("managerTodos") || "Manager Tasks"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Management overview of team todo lists and progress
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("createNewList") || "New Task List"}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-2 border-blue-50 dark:border-gray-700 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("searchPlaceholder") || "Search tasks..."}
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                {t("refresh") || "Refresh"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create List Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("createNewList") || "Create New Task List"}</DialogTitle>
              <DialogDescription>
                Create a new todo list for management or team assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("title") || "Title"}</Label>
                <Input
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Enter list title"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("description") || "Description"}</Label>
                <Textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Enter list description"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("priority") || "Priority"}</Label>
                <Select value={newListPriority} onValueChange={(v: any) => setNewListPriority(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                {t("cancel") || "Cancel"}
              </Button>
              <Button onClick={handleCreateTodoList} disabled={createTodoListMutation.isPending}>
                {createTodoListMutation.isPending ? "Creating..." : "Create List"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Todo Lists Display */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600" />
          </div>
        ) : filteredTodoLists.length > 0 ? (
          <div className="grid gap-6">
            {filteredTodoLists.map((list: TodoList) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-900 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border-b border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl text-gray-900 dark:text-white">
                          {list.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          by {list.createdBy?.firstName} {list.createdBy?.lastName}
                          {list.assignedTo && ` • Assigned to ${list.assignedTo.firstName} ${list.assignedTo.lastName}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={list.priority === "high" ? "destructive" : "secondary"}>
                          {list.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{list.items.length} tasks</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {list.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        {list.description}
                      </p>
                    )}
                    <div className="space-y-3">
                      {list.items.map((item: TodoItem) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            item.isCompleted
                              ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
                              : "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className={item.isCompleted ? "text-green-700 dark:text-green-300 line-through opacity-70" : "text-gray-900 dark:text-white font-medium"}>
                              {item.title}
                            </p>
                          </div>
                          {item.isCompleted && item.completedByNote && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                              <Eye className="w-3 h-3" />
                              <span className="max-w-[150px] truncate" title={item.completedByNote}>
                                {item.completedByNote}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 dark:bg-gray-800/50 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                <Filter className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("noResultsFound") || "No tasks found"}</h3>
              <p className="text-gray-500 max-w-sm">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
