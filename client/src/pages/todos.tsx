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

interface TodoItem {
  id: number;
  text: string;
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

  const [showUndoToast, setShowUndoToast] = useState(false);
  const [lastArchivedItem, setLastArchivedItem] = useState<{id: number, data: any, type: 'task' | 'list'} | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [selectedLists, setSelectedLists] = useState<Set<number>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedItemForReminder, setSelectedItemForReminder] = useState<number | null>(null);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");

  // Fetch todos data
  const { data: todosData, isLoading } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos");
      return response.json();
    },
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
    mutationFn: async (data: { todoItemId: number; reminderDate: string; message?: string }) => {
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
    
    createReminderMutation.mutate({
      todoItemId: selectedItemForReminder,
      reminderDate: new Date(reminderDate).toISOString(),
      message: reminderMessage.trim() || undefined,
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

  // Remove all tasks mutation
  const removeAllTasksMutation = useMutation({
    mutationFn: async (todoListId: number) => {
      const response = await authenticatedRequest("DELETE", `/api/todos/${todoListId}/items`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to remove all tasks');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "All tasks removed successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove all tasks",
        variant: "destructive",
      });
    },
  });

  const handleRemoveAllTasks = (todoListId: number) => {
    if (window.confirm("Are you sure you want to remove all tasks? This action cannot be undone.")) {
      removeAllTasksMutation.mutate(todoListId);
    }
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

  // Archive mutations
  const archiveTodoList = useMutation({
    mutationFn: async (listId: number) => {
      const response = await fetch("/api/archive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          itemType: "todo_list",
          itemId: listId,
          reason: "Task list completed or no longer needed"
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: (data, listId) => {
      const listData = todoLists.find(list => list.id === listId);
      if (listData) {
        setLastArchivedItem({
          id: listId,
          data: listData,
          type: 'list'
        });
        setShowUndoToast(true);
        setTimeout(() => {
          setShowUndoToast(false);
          setLastArchivedItem(null);
        }, 10000); // 10 seconds to undo
      }
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive todo list",
        variant: "destructive",
      });
    },
  });

  const archiveTodoItem = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await fetch("/api/archive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          itemType: "todo_item",
          itemId: itemId,
          reason: "Task completed and archived"
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: (data, itemId) => {
      // Find the item data before it's removed
      let itemData = null;
      for (const list of todoLists) {
        const item = list.items.find(item => item.id === itemId);
        if (item) {
          itemData = item;
          break;
        }
      }
      
      if (itemData) {
        setLastArchivedItem({
          id: itemId,
          data: itemData,
          type: 'task'
        });
        setShowUndoToast(true);
        setTimeout(() => {
          setShowUndoToast(false);
          setLastArchivedItem(null);
        }, 10000); // 10 seconds to undo
      }
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive task",
        variant: "destructive",
      });
    },
  });

  const undoArchive = useMutation({
    mutationFn: async () => {
      if (!lastArchivedItem) return;
      
      // Find the archived item and restore it
      const response = await authenticatedRequest("GET", "/api/archive");
      const archiveData = await response.json();
      
      // Find the most recent archive entry for this item
      const archivedEntry = archiveData.archivedItems
        .filter((item: any) => 
          item.itemType === (lastArchivedItem.type === 'list' ? 'todo_list' : 'todo_item') &&
          item.itemId === lastArchivedItem.id
        )
        .sort((a: any, b: any) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime())[0];
      
      if (archivedEntry) {
        return authenticatedRequest("POST", `/api/archive/${archivedEntry.id}/restore`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setShowUndoToast(false);
      setLastArchivedItem(null);
      toast({
        title: "Restored",
        description: "Item has been restored successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore item",
        variant: "destructive",
      });
    },
  });

  // Archive all tasks mutation
  const archiveAllTasksMutation = useMutation({
    mutationFn: async () => {
      const allTasks: any[] = [];
      todoLists.forEach(list => {
        list.items.forEach(item => {
          allTasks.push({ type: 'task', id: item.id, data: item });
        });
        allTasks.push({ type: 'list', id: list.id, data: list });
      });

      // Archive all items sequentially
      for (const task of allTasks) {
        try {
          const response = await fetch("/api/archive", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              itemType: task.type === 'list' ? 'todo_list' : 'todo_item',
              itemId: task.id,
              reason: `Bulk archive operation - ${task.type === 'list' ? 'Todo list' : 'Todo item'} archived`
            })
          });
          
          if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
          }
        } catch (error) {
          console.warn(`Failed to archive ${task.type} ${task.id}:`, error);
        }
      }
      
      return allTasks.length;
    },
    onSuccess: (archivedCount) => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: `${archivedCount} items have been archived`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive all tasks",
        variant: "destructive",
      });
    },
  });

  const handleArchiveAllTasks = () => {
    const totalItems = todoLists.reduce((acc, list) => acc + list.items.length + 1, 0);
    if (window.confirm(`Are you sure you want to archive all ${totalItems} items (tasks + lists)? You can restore them from the Archive page.`)) {
      archiveAllTasksMutation.mutate();
    }
  };

  // Archive selected items mutation
  const archiveSelectedMutation = useMutation({
    mutationFn: async () => {
      const selectedItems: any[] = [];
      
      // Add selected tasks
      todoLists.forEach(list => {
        list.items.forEach(item => {
          if (selectedTasks.has(item.id)) {
            selectedItems.push({ type: 'task', id: item.id, data: item });
          }
        });
      });

      // Add selected lists
      todoLists.forEach(list => {
        if (selectedLists.has(list.id)) {
          selectedItems.push({ type: 'list', id: list.id, data: list });
        }
      });

      // Archive selected items sequentially
      for (const item of selectedItems) {
        try {
          const response = await fetch("/api/archive", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              itemType: item.type === 'list' ? 'todo_list' : 'todo_item',
              itemId: item.id,
              reason: `Selected archive operation - ${item.type === 'list' ? 'Todo list' : 'Todo item'} archived`
            })
          });
          
          if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
          }
        } catch (error) {
          console.warn(`Failed to archive ${item.type} ${item.id}:`, error);
        }
      }
      
      return selectedItems.length;
    },
    onSuccess: (archivedCount) => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setSelectedTasks(new Set());
      setSelectedLists(new Set());
      setSelectionMode(false);
      toast({
        title: "Success",
        description: `${archivedCount} selected items have been archived`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive selected items",
        variant: "destructive",
      });
    },
  });

  const handleToggleTaskSelection = (taskId: number) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const handleToggleListSelection = (listId: number) => {
    const newSelection = new Set(selectedLists);
    if (newSelection.has(listId)) {
      newSelection.delete(listId);
    } else {
      newSelection.add(listId);
    }
    setSelectedLists(newSelection);
  };

  const handleArchiveSelected = () => {
    const totalSelected = selectedTasks.size + selectedLists.size;
    if (totalSelected === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to archive",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to archive ${totalSelected} selected items? You can restore them from the Archive page.`)) {
      archiveSelectedMutation.mutate();
    }
  };

  const handleSelectAll = () => {
    const allTaskIds = new Set<number>();
    const allListIds = new Set<number>();
    
    todoLists.forEach(list => {
      allListIds.add(list.id);
      list.items.forEach(item => {
        allTaskIds.add(item.id);
      });
    });
    
    setSelectedTasks(allTaskIds);
    setSelectedLists(allListIds);
  };

  const handleClearSelection = () => {
    setSelectedTasks(new Set());
    setSelectedLists(new Set());
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
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

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
                    placeholder={t("searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
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
                {todoLists.length > 0 && (
                  <>
                    <Button
                      onClick={() => setSelectionMode(!selectionMode)}
                      variant="outline"
                      className={selectionMode ? "bg-blue-50 border-blue-300 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      {selectionMode ? t("cancel") : t("selectAllTasks")}
                    </Button>
                    {selectionMode && (
                      <>
                        <Button
                          onClick={handleSelectAll}
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          Select All
                        </Button>
                        <Button
                          onClick={handleClearSelection}
                          variant="outline"
                          size="sm"
                          className="border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={handleArchiveSelected}
                          disabled={archiveSelectedMutation.isPending || (selectedTasks.size === 0 && selectedLists.size === 0)}
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          {archiveSelectedMutation.isPending ? "Archiving..." : `Archive Selected (${selectedTasks.size + selectedLists.size})`}
                        </Button>
                      </>
                    )}
                    {!selectionMode && (
                      <Button
                        onClick={handleArchiveAllTasks}
                        disabled={archiveAllTasksMutation.isPending}
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {archiveAllTasksMutation.isPending ? "Archiving..." : "Archive All"}
                      </Button>
                    )}
                  </>
                )}
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
                    placeholder="e.g., Morning Tasks, Project Work"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this task list"
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
                Set Reminder
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
                    placeholder="Add a reminder message..."
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
                <Card className={`hover:shadow-lg transition-all duration-300 ${isCompleted ? 'ring-2 ring-green-200 bg-green-50' : ''} ${selectedLists.has(list.id) ? 'ring-2 ring-blue-300 bg-blue-50' : ''}`}>
                  <CardHeader className="pb-3">
                    {selectionMode && (
                      <div className="absolute top-3 right-3 z-10">
                        <input
                          type="checkbox"
                          checked={selectedLists.has(list.id)}
                          onChange={() => handleToggleListSelection(list.id)}
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    )}
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
                          {list.title}
                          {isToday(list.createdAt) && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Today</Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                      </div>
                      <Badge className={`${getPriorityColor(list.priority)} text-xs`}>
                        {list.priority}
                      </Badge>
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
                          } ${selectedTasks.has(item.id) ? 'ring-2 ring-blue-300 bg-blue-50' : ''}`}
                        >
                          {selectionMode && (
                            <input
                              type="checkbox"
                              checked={selectedTasks.has(item.id)}
                              onChange={() => handleToggleTaskSelection(item.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                            />
                          )}
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
                            {item.text}
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
                            {!selectionMode && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedItemForReminder(item.id);
                                    setShowReminderDialog(true);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1"
                                  title="Set reminder"
                                >
                                  <Bell className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => archiveTodoItem.mutate(item.id)}
                                  disabled={archiveTodoItem.isPending}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1"
                                  title="Archive task"
                                >
                                  <Archive className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveTask(item.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                                  title="Delete task"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Add New Item */}
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <Input
                        placeholder="Add new task..."
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
                    
                    {/* List Actions */}
                    {!selectionMode && (
                      <div className="flex items-center justify-between gap-2 pt-3 border-t">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => archiveTodoList.mutate(list.id)}
                          disabled={archiveTodoList.isPending}
                          className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          Archive List
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveAllTasks(list.id)}
                          disabled={removeAllTasksMutation.isPending}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete All
                        </Button>
                      </div>
                    )}

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

      {/* Undo Toast */}
      <AnimatePresence>
        {showUndoToast && lastArchivedItem && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className="bg-blue-900 text-white border-blue-700 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Archive className="w-5 h-5 text-blue-300" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {lastArchivedItem.type === 'list' ? 'List' : 'Task'} archived
                    </p>
                    <p className="text-sm text-blue-200">
                      "{lastArchivedItem.data.title || lastArchivedItem.data.text}"
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => undoArchive.mutate()}
                    disabled={undoArchive.isPending}
                    className="bg-blue-800 border-blue-600 text-white hover:bg-blue-700"
                  >
                    <Undo2 className="w-4 h-4 mr-1" />
                    Undo
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowUndoToast(false);
                      setLastArchivedItem(null);
                    }}
                    className="text-blue-300 hover:text-white hover:bg-blue-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </DashboardLayout>
  );
}