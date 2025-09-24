import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  User,
  Filter,
  Search,
  RefreshCw,
  Trash2,
  Edit,
  Star,
  Target,
  TrendingUp,
  ListTodo,
  Sparkles,
  Award,
  Bell,
  X,
  Archive,
  Undo2,
  CheckSquare,
} from "lucide-react";
import { Checkbox } from "./ui/checkbox";

interface TodoItem {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  priority: "low" | "medium" | "high";
  reminderDate?: string;
}

interface TodoList {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  assignedTo: any;
  createdBy: any;
  items: TodoItem[];
}

export default function TodosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingList, setEditingList] = useState<TodoList | null>(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newListPriority, setNewListPriority] = useState<"low" | "medium" | "high">("medium");
  const [newItemText, setNewItemText] = useState("");

  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedItemForReminder, setSelectedItemForReminder] = useState<TodoItem | null>(null);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  // Fetch todos data
  const { data: todosData, isLoading, error } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      try {
        const response = await authenticatedRequest("GET", "/api/todos");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Todos data fetched:", data);
        return data;
      } catch (error) {
        console.error("Error fetching todos:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
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

  // Filter todos based on criteria
  const todoLists: TodoList[] = todosData?.todoLists || [];

  // Debug empty data
  if (todoLists.length === 0 && todosData) {
    console.log("No todo lists found in data:", todosData);
  }

  const filteredTodoLists = todoLists.filter((list: TodoList) => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (list.assignedTo?.firstName + " " + list.assignedTo?.lastName).toLowerCase().includes(searchTerm.toLowerCase());

    // Date filter
    let matchesDate = true;
    switch (dateFilter) {
      case "today":
        matchesDate = isToday(list.createdAt);
        break;
      case "week":
        matchesDate = isThisWeek(list.createdAt);
        break;
      case "month":
        matchesDate = isThisMonth(list.createdAt);
        break;
      case "custom":
        matchesDate = matchesCustomDate(list.createdAt);
        break;
      case "all":
      default:
        matchesDate = true;
        break;
    }

    // Priority filter
    const matchesPriority = priorityFilter === "all" || list.priority === priorityFilter;

    // Status filter
    let matchesStatus = true;
    if (statusFilter === "completed") {
      matchesStatus = list.items.every(item => item.isCompleted);
    } else if (statusFilter === "pending") {
      matchesStatus = list.items.some(item => !item.isCompleted);
    }

    return matchesSearch && matchesDate && matchesPriority && matchesStatus;
  });

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Create todo list mutation
  const createTodoListMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; priority: string }) => {
      const response = await authenticatedRequest("POST", "/api/todos", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setShowCreateForm(false);
      setNewListTitle("");
      setNewListDescription("");
      setNewListPriority("medium");
      toast({
        title: "Success",
        description: "Daily work list created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create todo list",
        variant: "destructive",
      });
    },
  });

  // Add todo item mutation
  const addTodoItemMutation = useMutation({
    mutationFn: async (data: { todoListId: number; text: string; priority: string }) => {
      console.log("Mutation function called with:", data);
      try {
        const response = await authenticatedRequest("POST", "/api/todos/items", data);
        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(errorText || 'Failed to add task');
        }

        const result = await response.json();
        console.log("Success response:", result);
        return result;
      } catch (error) {
        console.error("Mutation error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Todo item created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setNewItemText("");
      toast({
        title: "Success",
        description: "Task added successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Todo item creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add task",
        variant: "destructive",
      });
    },
  });

  // Toggle todo item completion mutation
  const toggleTodoItemMutation = useMutation({
    mutationFn: async (data: { itemId: number; isCompleted: boolean }) => {
      const response = await authenticatedRequest("PATCH", `/api/todos/items/${data.itemId}`, { isCompleted: data.isCompleted });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (data: { todoItemId: number; reminderDate: string; message?: string; itemText: string; itemData: any }) => {
      const response = await authenticatedRequest("POST", "/api/reminders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setShowReminderDialog(false);
      setSelectedItemForReminder(null);
      setReminderDate("");
      setReminderMessage("");
      toast({
        title: "Success",
        description: "Reminder set successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set reminder",
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

  const handleCreateReminder = () => {
    if (!selectedItemForReminder || !reminderDate) return;

    // Find the list that contains this item for context
    let listContext = null;
    for (const list of todoLists) {
      if (list.items.some(item => item.id === selectedItemForReminder.id)) {
        listContext = list;
        break;
      }
    }

    createReminderMutation.mutate({
      todoItemId: selectedItemForReminder.id,
      reminderDate: reminderDate,
      message: reminderMessage.trim() || `Reminder for: ${selectedItemForReminder.title}`,
      itemText: selectedItemForReminder.title,
      itemData: {
        item: selectedItemForReminder,
        list: listContext ? {
          id: listContext.id,
          title: listContext.title,
          description: listContext.description,
          priority: listContext.priority
        } : null,
        createdAt: new Date().toISOString()
      },
    });
  };

  const handleAddTodoItem = (todoListId: number) => {
    if (!newItemText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    console.log("Adding todo item to list:", todoListId, "with text:", newItemText.trim());

    addTodoItemMutation.mutate({
      todoListId,
      text: newItemText.trim(),
      priority: "medium",
    });
  };

  const handleToggleItem = (itemId: number, isCompleted: boolean) => {
    toggleTodoItemMutation.mutate({
      itemId,
      isCompleted: !isCompleted,
    });
  };


  // Remove individual task mutation
  const removeTaskMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await authenticatedRequest("DELETE", `/api/todos/items/${itemId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to remove task');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Task removed successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove task",
        variant: "destructive",
      });
    },
  });

  const handleRemoveTask = (itemId: number) => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      removeTaskMutation.mutate(itemId);
    }
  };

  // Delete todo list mutation
  const deleteTodoListMutation = useMutation({
    mutationFn: async (listId: number) => {
      const response = await authenticatedRequest('DELETE', `/api/todos/${listId}`);
      // No need to parse JSON for 204 No Content responses
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Todo list deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete todo list",
        variant: "destructive",
      });
    },
  });

  // Edit todo list mutation
  const editTodoListMutation = useMutation({
    mutationFn: async ({ listId, title }: { listId: number; title: string }) => {
      const response = await authenticatedRequest('PATCH', `/api/todos/${listId}`, { title: title.trim() });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setEditingListId(null);
      setEditedTitle("");
      toast({
        title: "Success",
        description: "Todo list updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update todo list",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTodoList = (listId: number) => {
    if (window.confirm("Are you sure you want to delete this entire todo list? This action cannot be undone.")) {
      deleteTodoListMutation.mutate(listId);
    }
  };

  const handleStartEditTitle = (list: TodoList) => {
    setEditingListId(list.id);
    setEditedTitle(list.title);
  };

  const handleSaveTitle = () => {
    if (!editedTitle.trim()) return;
    if (editingListId) {
      editTodoListMutation.mutate({ 
        listId: editingListId, 
        title: editedTitle.trim() 
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditedTitle("");
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
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

  const completionVariants = {
    initial: { scale: 1 },
    completed: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <h2 className="text-xl font-semibold">Error Loading Todos</h2>
            <p className="text-sm mt-2">{error.message || "Failed to load todo data"}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Debug logging
  console.log("Todos render - user:", user);
  console.log("Todos render - todosData:", todosData);
  console.log("Todos render - todoLists:", todoLists);

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >


      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    aria-label={t("searchPlaceholder")}
                  />
                </div>
              </div>
              <div className="flex gap-2">

                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("createNewList")}
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="date-filter" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("filter")} {t("today")}
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="date-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">{t("today")}</SelectItem>
                    <SelectItem value="week">{t("thisWeek")}</SelectItem>
                    <SelectItem value="month">{t("thisMonth")}</SelectItem>
                    <SelectItem value="custom">{t("custom")}</SelectItem>
                    <SelectItem value="all">{t("allTasks")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateFilter === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-date" className="text-sm font-medium">
                    Select Date
                  </Label>
                  <Input
                    id="custom-date"
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {t("priority")}
                </Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("priority")}</SelectItem>
                    <SelectItem value="high">{t("highPriority")}</SelectItem>
                    <SelectItem value="medium">{t("mediumPriority")}</SelectItem>
                    <SelectItem value="low">{t("lowPriority")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {t("status")}
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("status")}</SelectItem>
                    <SelectItem value="pending">{t("pending")}</SelectItem>
                    <SelectItem value="completed">{t("completed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-refresh" className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin text-green-600' : 'text-gray-400'}`} />
                  Auto Refresh
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                  <span className="text-sm text-gray-600">
                    {autoRefresh ? 'Every 30s' : 'Off'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Create New Todo List Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Create Daily Work List
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">List Title</Label>
                  <Input
                    id="title"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Priority Level</Label>
                  <Select value={newListPriority} onValueChange={(value: "low" | "medium" | "high") => setNewListPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateTodoList}
                    disabled={!newListTitle.trim() || createTodoListMutation.isPending}
                    className="flex-1"
                  >
                    {createTodoListMutation.isPending ? "Creating..." : "Create List"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Set Reminder Modal */}
      <AnimatePresence>
        {showReminderDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => {
              setShowReminderDialog(false);
              setSelectedItemForReminder(null);
              setReminderDate("");
              setReminderMessage("");
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                Set Reminder for: "{selectedItemForReminder?.title}"
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reminder-date">Reminder Date & Time</Label>
                  <Input
                    id="reminder-date"
                    type="datetime-local"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <Label htmlFor="reminder-message">Message (Optional)</Label>
                  <Textarea
                    id="reminder-message"
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateReminder}
                    disabled={!reminderDate || createReminderMutation.isPending}
                    className="flex-1"
                  >
                    {createReminderMutation.isPending ? "Setting..." : "Set Reminder"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReminderDialog(false);
                      setSelectedItemForReminder(null);
                      setReminderDate("");
                      setReminderMessage("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo Lists Grid */}
      {filteredTodoLists.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-12"
        >
          <ListTodo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Task Lists Found</h3>
          <p className="text-gray-500">
            {todoLists.length === 0 
              ? "Create your first daily work list to get started!"
              : "No task lists match your current filters"}
          </p>
          {todoLists.length === 0 && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First List
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredTodoLists.map((list: TodoList, index: number) => {
            const completionPercentage = getCompletionPercentage(list.items);
            const isCompleted = completionPercentage === 100;

            return (
              <motion.div
                key={list.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className={`hover:shadow-lg transition-all duration-300 ${isCompleted ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          {isCompleted && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Award className="w-5 h-5 text-green-600" />
                            </motion.div>
                          )}
                          {editingListId === list.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveTitle();
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    handleCancelEdit();
                                  }
                                }}
                                className="text-lg font-semibold h-7 px-2"
                                autoFocus
                                data-testid={`input-edit-title-${list.id}`}
                              />
                              <Button
                                size="sm"
                                onClick={handleSaveTitle}
                                disabled={!editedTitle.trim() || editTodoListMutation.isPending}
                                className="h-7 px-2"
                                data-testid={`button-save-title-${list.id}`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-7 px-2"
                                data-testid={`button-cancel-edit-${list.id}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              {list.title}
                              {isToday(list.createdAt) && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">Today</Badge>
                              )}
                            </>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getPriorityColor(list.priority)} text-xs`}>
                          {list.priority}
                        </Badge>
                        {editingListId !== list.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEditTitle(list)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1 h-6 w-6"
                              title="Edit list title"
                              data-testid={`button-edit-list-${list.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTodoList(list.id)}
                              disabled={deleteTodoListMutation.isPending}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                              title="Delete entire list"
                              data-testid={`button-delete-list-${list.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Todo Items */}
                    <AnimatePresence>
                      {list.items.map((item: TodoItem) => (
                        <motion.div
                          key={item.id}
                          variants={completionVariants}
                          initial="initial"
                          animate={item.isCompleted ? "completed" : "initial"}
                          exit={{ opacity: 0, x: -20 }}
                          className={`group flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            item.isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <motion.button
                            onClick={() => handleToggleItem(item.id, item.isCompleted)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex-shrink-0"
                          >
                            {item.isCompleted ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </motion.div>
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                            )}
                          </motion.button>
                          <span className={`flex-1 text-sm font-medium ${
                            item.isCompleted ? 'text-green-700 line-through' : 'text-gray-900'
                          }`}>
                            {item.title}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.isCompleted && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <Sparkles className="w-4 h-4 text-green-500" />
                              </motion.div>
                            )}
                            {true && (
                              <div className="flex items-center gap-1 border border-red-300 rounded-md px-1 py-0.5 bg-red-50">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedItemForReminder(item);
                                    setShowReminderDialog(true);
                                  }}
                                  className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1 h-6 w-6"
                                  title="Set reminder"
                                  data-testid={`button-reminder-${item.id}`}
                                >
                                  <Bell className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveTask(item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                                  title="Delete task"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Add New Item */}
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <Input
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newItemText.trim()) {
                            e.preventDefault();
                            handleAddTodoItem(list.id);
                          }
                        }}
                        className="text-sm"
                        disabled={addTodoItemMutation.isPending}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddTodoItem(list.id)}
                        disabled={!newItemText.trim() || addTodoItemMutation.isPending}
                        className="shrink-0"
                      >
                        {addTodoItemMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>


                    {/* Footer Info */}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {list.assignedTo?.firstName || list.createdBy?.firstName || 'Unassigned'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(list.createdAt).toLocaleDateString()}
                        </span>
                      </div>


                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

    </motion.div>
    </DashboardLayout>
  );
}