import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  BarChart,
  Lightbulb,
  X,
  Archive,
  Undo2,
} from "lucide-react";

interface TodoItem {
  id: number;
  text: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  priority: "low" | "medium" | "high";
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
  const [showPriorities, setShowPriorities] = useState(false);
  const [smartRecommendations, setSmartRecommendations] = useState<any>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [lastArchivedItem, setLastArchivedItem] = useState<{id: number, data: any, type: 'task' | 'list'} | null>(null);

  // Fetch todos data
  const { data: todosData, isLoading } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos");
      return response.json();
    },
  });

  // Fetch smart priorities
  const { data: prioritiesData, isLoading: prioritiesLoading } = useQuery({
    queryKey: ["/api/todos/priorities"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos/priorities");
      return response.json();
    },
    enabled: showPriorities,
  });

  // Fetch recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/todos/recommendations"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos/recommendations");
      return response.json();
    },
    enabled: showPriorities,
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

  const handleCreateTodoList = () => {
    if (!newListTitle.trim()) return;
    
    createTodoListMutation.mutate({
      title: newListTitle,
      description: newListDescription,
      priority: newListPriority,
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

  // Archive mutations
  const archiveTodoList = useMutation({
    mutationFn: async (listId: number) => {
      return authenticatedRequest("POST", "/api/archive", {
        body: JSON.stringify({
          itemType: "todo_list",
          itemId: listId,
          reason: "Task list completed or no longer needed"
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
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
      return authenticatedRequest("POST", "/api/archive", {
        body: JSON.stringify({
          itemType: "todo_item",
          itemId: itemId,
          reason: "Task completed and archived"
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.h1 
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Daily Work & Task Management
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-600 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Organize your daily tasks and track progress with animated completions
        </motion.p>
        
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <ListTodo className="w-4 h-4" />
            {filteredTodoLists.length} lists
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            {filteredTodoLists.reduce((acc, list) => acc + list.items.length, 0)} tasks
          </Badge>
          {dateFilter === "today" && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Today's Tasks Only
            </Badge>
          )}
        </div>
      </div>

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
                    placeholder="Search task lists, descriptions, or assignees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPriorities(!showPriorities)}
                  variant={showPriorities ? "default" : "outline"}
                  className={showPriorities ? "bg-gradient-to-r from-purple-600 to-indigo-600" : ""}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Smart Priority
                </Button>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Daily List
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="date-filter" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Filter
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="date-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today Only</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Date</SelectItem>
                    <SelectItem value="all">All Dates</SelectItem>
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
                  Priority
                </Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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

      {/* Smart Prioritization Panel */}
      <AnimatePresence>
        {showPriorities && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Brain className="w-5 h-5" />
                  Smart Prioritization Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prioritiesLoading || recommendationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="ml-2 text-purple-700">Analyzing your tasks...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Daily Recommendations */}
                    {recommendationsData?.recommendations && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Today's Recommendations
                        </h4>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                          {/* Top Priority */}
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h5 className="font-medium text-red-800 flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4" />
                              Critical Focus ({recommendationsData.recommendations.topPriority.length})
                            </h5>
                            {recommendationsData.recommendations.topPriority.slice(0, 2).map((item: any) => (
                              <div key={item.listId} className="text-sm text-red-700 mb-1">
                                • Score: {item.score} - {item.recommendation}
                              </div>
                            ))}
                          </div>

                          {/* Quick Wins */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4" />
                              Quick Wins ({recommendationsData.recommendations.quickWins.length})
                            </h5>
                            {recommendationsData.recommendations.quickWins.slice(0, 2).map((item: any) => (
                              <div key={item.listId} className="text-sm text-green-700 mb-1">
                                • Score: {item.score} - Nearly complete
                              </div>
                            ))}
                          </div>

                          {/* Overdue */}
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h5 className="font-medium text-orange-800 flex items-center gap-2 mb-2">
                              <TrendingDown className="w-4 h-4" />
                              Overdue ({recommendationsData.recommendations.overdue.length})
                            </h5>
                            {recommendationsData.recommendations.overdue.slice(0, 2).map((item: any) => (
                              <div key={item.listId} className="text-sm text-orange-700 mb-1">
                                • Score: {item.score} - Needs immediate attention
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Suggestions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-blue-800 flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4" />
                            Smart Suggestions
                          </h5>
                          <div className="space-y-1">
                            {recommendationsData.recommendations.suggestions.map((suggestion: string, index: number) => (
                              <div key={index} className="text-sm text-blue-700">
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Priority Scores */}
                    {prioritiesData?.priorities && (
                      <div>
                        <h4 className="font-semibold text-purple-800 flex items-center gap-2 mb-3">
                          <BarChart className="w-4 h-4" />
                          Priority Scores (Top 5)
                        </h4>
                        <div className="space-y-2">
                          {prioritiesData.priorities.slice(0, 5).map((priority: any) => {
                            const list = filteredTodoLists.find(l => l.id === priority.listId);
                            if (!list) return null;
                            
                            return (
                              <div key={priority.listId} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                                <div className="flex-1">
                                  <div className="font-medium">{list.title}</div>
                                  <div className="text-sm text-gray-600">{priority.recommendation}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-lg">{priority.score}</div>
                                  <div className="text-xs text-gray-500">Priority Score</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
                            {item.title || item.text}
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
                      
                      {/* Smart Priority Score */}
                      {showPriorities && prioritiesData?.priorities && (
                        <div className="mt-2 pt-2 border-t">
                          {(() => {
                            const priority = prioritiesData.priorities.find((p: any) => p.listId === list.id);
                            if (!priority) return null;
                            
                            return (
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Brain className="w-3 h-3 text-purple-600" />
                                  <span className="text-purple-600 font-medium">Smart Score: {priority.score}</span>
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {priority.score >= 75 ? 'High' : priority.score >= 50 ? 'Medium' : 'Low'}
                                </Badge>
                              </div>
                            );
                          })()}
                        </div>
                      )}
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
  );
}