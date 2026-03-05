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
  Search,
  RefreshCw,
  Trash2,
  Edit,
  TrendingUp,
  ListTodo,
  Sparkles,
  Award,
  Bell,
  X,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  LayoutGrid,
  Zap,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface TodoItem {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completedById?: number;
  completedByNote?: string;
  priority: "low" | "medium" | "high";
  reminderDate?: string;
  completedBy?: any;
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
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
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
  
  const [showCompletionDetailsDialog, setShowCompletionDetailsDialog] = useState(false);
  const [selectedCompletedItem, setSelectedCompletedItem] = useState<TodoItem | null>(null);
  
  const [showCompletionProofModal, setShowCompletionProofModal] = useState(false);
  const [selectedItemForProof, setSelectedItemForProof] = useState<TodoItem | null>(null);
  const [completionProof, setCompletionProof] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

    // Department filter
    let matchesDepartment = true;
    if (departmentFilter !== "all") {
      const createdByDept = list.createdBy?.department || '';
      const assignedToDept = list.assignedTo?.department || '';
      matchesDepartment = createdByDept === departmentFilter || assignedToDept === departmentFilter;
    }

    // User filter
    let matchesUser = true;
    if (userFilter !== "all") {
      const createdByName = list.createdBy ? `${list.createdBy.firstName} ${list.createdBy.lastName}` : '';
      const assignedToName = list.assignedTo ? `${list.assignedTo.firstName} ${list.assignedTo.lastName}` : '';
      matchesUser = createdByName === userFilter || assignedToName === userFilter;
    }

    return matchesSearch && matchesDate && matchesDepartment && matchesUser;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTodoLists.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTodoLists = filteredTodoLists.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, customDate, departmentFilter, userFilter]);

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      }, 5000);
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
    // If marking as complete (not uncompleting), ask for proof
    if (!isCompleted) {
      const item = todoLists.flatMap(list => list.items).find(i => i.id === itemId);
      if (item) {
        setSelectedItemForProof(item);
        setShowCompletionProofModal(true);
      }
    } else {
      // If uncompleting, just toggle without proof
      toggleTodoItemMutation.mutate({
        itemId,
        isCompleted: !isCompleted,
      });
    }
  };

  const handleCompleteWithProof = () => {
    if (!selectedItemForProof) return;
    if (!completionProof.trim()) {
      toast({
        title: "Error",
        description: t('completionEvidenceRequired'),
        variant: "destructive",
      });
      return;
    }

    // Send completion with proof
    const response = authenticatedRequest("PATCH", `/api/todos/items/${selectedItemForProof.id}`, {
      isCompleted: true,
      completedByNote: completionProof.trim(),
    });

    response.then(res => res.json()).then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Task marked complete with proof!",
      });
      setShowCompletionProofModal(false);
      setSelectedItemForProof(null);
      setCompletionProof("");
    }).catch(err => {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
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

  const canSeeDepartments = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'office' || user?.role === 'office_team';

  const availableDepartments = Array.from(new Set(
    todoLists.flatMap(list => [
      list.assignedTo?.department,
      list.createdBy?.department,
    ]).filter(Boolean)
  )) as string[];

  const totalTasks = todoLists.reduce((acc, l) => acc + l.items.length, 0);
  const completedTasks = todoLists.reduce((acc, l) => acc + l.items.filter(i => i.isCompleted).length, 0);
  const todayLists = todoLists.filter(l => isToday(l.createdAt)).length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gradient-to-r from-violet-200 to-indigo-200 rounded-2xl"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-56 bg-gray-100 rounded-2xl"></div>
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
        className="space-y-6"
      >

      {/* Hero Header */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff opacity=.05%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{t("dailyTasks")}</h1>
            </div>
            <p className="text-white/70 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm border border-white/20">
              <div className="text-center">
                <div className="text-xl font-bold">{todayLists}</div>
                <div className="text-xs text-white/70">{t("todaysLists")}</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-xl font-bold">{completedTasks}</div>
                <div className="text-xs text-white/70">{t("done")}</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-xl font-bold">{totalTasks}</div>
                <div className="text-xs text-white/70">{t("total")}</div>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-white text-indigo-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("newList")}
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="relative mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>{t("overallProgress")}</span>
              <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <motion.div
                className="h-1.5 rounded-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((completedTasks / totalTasks) * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("searchTasks")}
              className="pl-9 border-0 bg-gray-50 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9 w-auto gap-1 rounded-xl border-gray-200 text-sm px-3 bg-gray-50">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
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

            {dateFilter === 'custom' && (
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="h-9 rounded-xl border-gray-200 text-sm bg-gray-50 w-auto"
              />
            )}

            {/* User Filter */}
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="h-9 w-auto gap-1 rounded-xl border-gray-200 text-sm px-3 bg-gray-50">
                <User className="w-3.5 h-3.5 text-gray-500" />
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {Array.from(new Set(
                  todoLists.flatMap(list => [
                    list.createdBy ? `${list.createdBy.firstName} ${list.createdBy.lastName}` : '',
                    list.assignedTo ? `${list.assignedTo.firstName} ${list.assignedTo.lastName}` : '',
                  ]).filter(Boolean)
                )).map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Filter — office / manager / admin only */}
            {canSeeDepartments && (
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-9 w-auto gap-1 rounded-xl border-gray-200 text-sm px-3 bg-gray-50">
                  <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {availableDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(v => !v)}
              className={`h-9 px-3 rounded-xl border text-sm flex items-center gap-1.5 transition-colors ${
                autoRefresh
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? t("liveStatus") : t("pausedStatus")}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {(departmentFilter !== 'all' || userFilter !== 'all' || dateFilter !== 'today') && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {dateFilter !== 'today' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full border border-indigo-100">
                <Calendar className="w-3 h-3" />
                {dateFilter === 'all' ? 'All time' : dateFilter === 'week' ? 'This week' : dateFilter === 'month' ? 'This month' : customDate || 'Custom'}
                <button onClick={() => setDateFilter('today')} className="ml-0.5 hover:text-indigo-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {userFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-100">
                <User className="w-3 h-3" />{userFilter}
                <button onClick={() => setUserFilter('all')} className="ml-0.5 hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {departmentFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-xs px-2.5 py-1 rounded-full border border-violet-100">
                <Building2 className="w-3 h-3" />{departmentFilter}
                <button onClick={() => setDepartmentFilter('all')} className="ml-0.5 hover:text-violet-900"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </motion.div>



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
                {t("createDailyWorkList")}
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">{t("listTitle")}</Label>
                  <Input
                    id="title"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">{t("description")}</Label>
                  <Textarea
                    id="description"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label>{t("priorityLevel")}</Label>
                  <Select value={newListPriority} onValueChange={(value: "low" | "medium" | "high") => setNewListPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t("highPriority")}</SelectItem>
                      <SelectItem value="medium">{t("mediumPriority")}</SelectItem>
                      <SelectItem value="low">{t("lowPriority")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateTodoList}
                    disabled={!newListTitle.trim() || createTodoListMutation.isPending}
                    className="flex-1"
                  >
                    {createTodoListMutation.isPending ? t("creating") : t("createList")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Proof Modal - Ask for proof when marking complete */}
      <Dialog open={showCompletionProofModal} onOpenChange={setShowCompletionProofModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              {t('markTaskComplete')}
            </DialogTitle>
            <DialogDescription>
              {t('completionEvidenceRequired')}
            </DialogDescription>
          </DialogHeader>
          {selectedItemForProof && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Task:</Label>
                <p className="text-sm text-gray-700 mt-1 font-medium">{selectedItemForProof.title}</p>
              </div>
              
              <div>
                <Label htmlFor="completion-proof" className="text-sm font-semibold">
                  {t('describeCompletion')}
                </Label>
                <Textarea
                  id="completion-proof"
                  value={completionProof}
                  onChange={(e) => setCompletionProof(e.target.value)}
                  placeholder="e.g., 'Sent report to Finance department', 'Interviewed 3 candidates', 'Updated database with Q4 metrics'"
                  rows={4}
                  className="mt-2"
                  data-testid="textarea-completion-proof"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCompleteWithProof}
                  disabled={!completionProof.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-complete-with-proof"
                >
                  {t('markComplete')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCompletionProofModal(false);
                    setSelectedItemForProof(null);
                    setCompletionProof("");
                  }}
                  className="flex-1"
                  data-testid="button-cancel-proof"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Completion Details Modal - Manager views proof */}
      <Dialog open={showCompletionDetailsDialog} onOpenChange={setShowCompletionDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {t('completionEvidence')}
            </DialogTitle>
            <DialogDescription>
              {t('completedByNote')}
            </DialogDescription>
          </DialogHeader>
          {selectedCompletedItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Task</Label>
                <p className="text-sm text-gray-700 mt-1">{selectedCompletedItem.title}</p>
              </div>
              
              {selectedCompletedItem.completedBy && (
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t('completedBy')}
                  </Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedCompletedItem.completedBy.firstName} {selectedCompletedItem.completedBy.lastName}
                  </p>
                </div>
              )}
              
              {selectedCompletedItem.completedAt && (
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('completionDate')}
                  </Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date(selectedCompletedItem.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Proof / Evidence
                </Label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedCompletedItem.completedByNote}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

      {/* Results summary */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">
          {t("showing")} <span className="font-semibold text-gray-700">{filteredTodoLists.length}</span> {t("lists")}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 w-7 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-500 px-1">{currentPage} / {totalPages}</span>
            <Button size="sm" variant="ghost" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-7 w-7 p-0">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Todo Lists Grid */}
      {filteredTodoLists.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white border border-dashed border-gray-200"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <LayoutGrid className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">{t("noTaskListsFound")}</h3>
          <p className="text-sm text-gray-400 mb-5">
            {todoLists.length === 0
              ? t("createFirstListMessage")
              : t("noMatchingFiltersMessage")}
          </p>
          {todoLists.length === 0 && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("createYourFirstList")}
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {paginatedTodoLists.map((list: TodoList, index: number) => {
            const completionPercentage = getCompletionPercentage(list.items);
            const isCompleted = completionPercentage === 100;
            const department = list.assignedTo?.department || list.createdBy?.department;

            return (
              <motion.div
                key={list.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className={`relative rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden
                  ${isCompleted ? 'border-green-200' : 'border-gray-100'}`}>
                  {/* Top accent bar */}
                  <div className={`h-1 w-full ${isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-violet-500 to-indigo-500'}`} />

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        {editingListId === list.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); handleSaveTitle(); }
                                else if (e.key === "Escape") { e.preventDefault(); handleCancelEdit(); }
                              }}
                              className="h-7 text-sm font-semibold px-2"
                              autoFocus
                              data-testid={`input-edit-title-${list.id}`}
                            />
                            <Button size="sm" onClick={handleSaveTitle} disabled={!editedTitle.trim() || editTodoListMutation.isPending} className="h-7 px-2 bg-indigo-600 hover:bg-indigo-700" data-testid={`button-save-title-${list.id}`}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 px-2" data-testid={`button-cancel-edit-${list.id}`}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isCompleted && <Award className="w-4 h-4 text-green-500 flex-shrink-0" />}
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{list.title}</h3>
                            {isToday(list.createdAt) && (
                              <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-blue-100">
                                <Zap className="w-2.5 h-2.5" />Today
                              </span>
                            )}
                          </div>
                        )}
                        {list.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{list.description}</p>
                        )}
                      </div>

                      {editingListId !== list.id && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => handleStartEditTitle(list)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Edit title" data-testid={`button-edit-list-${list.id}`}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteTodoList(list.id)}
                            disabled={deleteTodoListMutation.isPending}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete list" data-testid={`button-delete-list-${list.id}`}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                        <User className="w-3 h-3" />
                        {list.assignedTo?.firstName || list.createdBy?.firstName || 'Unassigned'}
                      </span>
                      {department && canSeeDepartments && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full border border-violet-100">
                          <Building2 className="w-2.5 h-2.5" />
                          {department}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
                        <Clock className="w-3 h-3" />
                        {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                        <span>{list.items.filter(i => i.isCompleted).length} / {list.items.length} tasks</span>
                        <span className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-indigo-600'}`}>{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <motion.div
                          className={`h-1.5 rounded-full ${isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-violet-500 to-indigo-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                          transition={{ duration: 0.6, delay: index * 0.05 }}
                        />
                      </div>
                    </div>

                    {/* Task Items */}
                    <div className="space-y-1.5">
                      <AnimatePresence>
                        {list.items.map((item: TodoItem) => (
                          <motion.div
                            key={item.id}
                            variants={completionVariants}
                            initial="initial"
                            animate={item.isCompleted ? "completed" : "initial"}
                            exit={{ opacity: 0, height: 0 }}
                            className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors
                              ${item.isCompleted ? 'bg-green-50 border border-green-100' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'}`}
                          >
                            <motion.button
                              onClick={() => handleToggleItem(item.id, item.isCompleted)}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.85 }}
                              className="flex-shrink-0"
                            >
                              {item.isCompleted ? (
                                <CheckCircle2 className="w-4.5 h-4.5 w-[18px] h-[18px] text-green-500" />
                              ) : (
                                <Circle className="w-[18px] h-[18px] text-gray-300 hover:text-indigo-400" />
                              )}
                            </motion.button>

                            <span className={`flex-1 text-[13px] leading-tight break-words min-w-0 ${
                              item.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'
                            }`}>
                              {item.title}
                            </span>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              {item.isCompleted && item.completedByNote && (
                                <Button size="sm" variant="ghost"
                                  onClick={() => { setSelectedCompletedItem(item); setShowCompletionDetailsDialog(true); }}
                                  className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                  title="View proof" data-testid={`button-view-proof-${item.id}`}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost"
                                onClick={() => { setSelectedItemForReminder(item); setShowReminderDialog(true); }}
                                className="h-6 w-6 p-0 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                                title="Set reminder" data-testid={`button-reminder-${item.id}`}>
                                <Bell className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost"
                                onClick={() => handleRemoveTask(item.id)}
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete task">
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Add new item */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Input
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newItemText.trim()) {
                            e.preventDefault();
                            handleAddTodoItem(list.id);
                          }
                        }}
                        placeholder={t("addATask")}
                        className="h-8 text-sm rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-indigo-400"
                        disabled={addTodoItemMutation.isPending}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddTodoItem(list.id)}
                        disabled={!newItemText.trim() || addTodoItemMutation.isPending}
                        className="h-8 w-8 p-0 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                      >
                        {addTodoItemMutation.isPending
                          ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          : <Plus className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

    </motion.div>
    </DashboardLayout>
  );
}