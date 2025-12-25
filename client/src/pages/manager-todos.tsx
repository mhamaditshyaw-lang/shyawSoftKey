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
import { AlertCircle, CheckCircle2, Circle, Sparkles, Eye, Search, Filter, Plus, RefreshCw, Clock, User, Award, Trash2, Edit, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TodoItem {
  id: number;
  title: string;
  isCompleted: boolean;
  completedByNote?: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
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
  const [newItemTexts, setNewItemTexts] = useState<Record<number, string>>({});

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
      // Prefix title to identify it as a manager task
      const response = await authenticatedRequest("POST", "/api/todos", {
        ...data,
        title: `[MANAGER] ${data.title}`
      });
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
        description: "Manager task list created successfully!",
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

  const addTodoItemMutation = useMutation({
    mutationFn: async (data: { todoListId: number; text: string; priority: string }) => {
      const response = await authenticatedRequest("POST", "/api/todos/items", data);
      if (!response.ok) throw new Error("Failed to add task");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager-todos"] });
      setNewItemTexts(prev => ({ ...prev, [variables.todoListId]: "" }));
      toast({
        title: "Success",
        description: "Task added successfully!",
      });
    },
  });

  const toggleTodoItemMutation = useMutation({
    mutationFn: async (data: { itemId: number; isCompleted: boolean }) => {
      const response = await authenticatedRequest("PATCH", `/api/todos/items/${data.itemId}`, { isCompleted: data.isCompleted });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager-todos"] });
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

  const getCompletionPercentage = (items: TodoItem[]) => {
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.isCompleted).length;
    return Math.round((completed / items.length) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "low": return "text-green-600 bg-green-100 border-green-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const isToday = (date: string): boolean => {
    const today = new Date();
    const entryDate = new Date(date);
    return entryDate.toDateString() === today.toDateString();
  };

  const filteredTodoLists = (todosData?.todoLists || []).filter((list: TodoList) => {
    const listTitle = list.title.replace("[MANAGER] ", "");
    const matchesSearch = searchTerm === "" || 
      listTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

        {/* Todo Lists Grid - Matching screenshot look */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600" />
          </div>
        ) : filteredTodoLists.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTodoLists.map((list: TodoList, index: number) => {
              const completionPercentage = getCompletionPercentage(list.items);
              const isCompleted = completionPercentage === 100;
              const displayTitle = list.title.replace("[MANAGER] ", "");
              
              return (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className={`hover:shadow-lg transition-all duration-300 border-2 ${isCompleted ? 'ring-2 ring-green-200 bg-green-50/30 border-green-200' : 'border-blue-100 dark:border-blue-900/30'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <span className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <Award className="w-5 h-5 text-green-600" />
                            </span>
                            {displayTitle}
                            {isToday(list.createdAt) && (
                              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Today</Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{list.description}</p>
                        </div>
                        <Badge className={`${getPriorityColor(list.priority)} text-xs px-3 py-1`}>
                          {list.priority}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 font-medium">
                          <span>Progress</span>
                          <span>{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-green-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercentage}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Todo Items */}
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {list.items.map((item: TodoItem) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              item.isCompleted 
                                ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-900/30 shadow-sm' 
                                : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <button
                              onClick={() => toggleTodoItemMutation.mutate({ itemId: item.id, isCompleted: !item.isCompleted })}
                              className="flex-shrink-0 focus:outline-none"
                            >
                              {item.isCompleted ? (
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center border border-green-500">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-500" />
                              )}
                            </button>
                            <span className={`flex-1 text-sm font-medium ${item.isCompleted ? 'text-green-700 dark:text-green-300 line-through opacity-70' : 'text-gray-900 dark:text-white'}`}>
                              {item.title}
                            </span>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-green-500 opacity-60" />
                              <div className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-600">
                                <Bell className="w-4 h-4" />
                              </div>
                              <div className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600">
                                <X className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Item Input */}
                      <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                        <Input
                          placeholder="Add new task..."
                          className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
                          value={newItemTexts[list.id] || ""}
                          onChange={(e) => setNewItemTexts(prev => ({ ...prev, [list.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newItemTexts[list.id]?.trim()) {
                              addTodoItemMutation.mutate({ todoListId: list.id, text: newItemTexts[list.id].trim(), priority: "medium" });
                            }
                          }}
                        />
                        <Button 
                          size="icon" 
                          className="rounded-xl bg-indigo-200 hover:bg-indigo-300 text-indigo-700"
                          onClick={() => {
                            if (newItemTexts[list.id]?.trim()) {
                              addTodoItemMutation.mutate({ todoListId: list.id, text: newItemTexts[list.id].trim(), priority: "medium" });
                            }
                          }}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-50 dark:border-gray-700 text-[11px] text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{list.createdBy?.firstName || 'System'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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
