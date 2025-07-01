import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CheckSquare, Plus, Trash2, ArrowLeft, Save, Calendar, User, Clock } from "lucide-react";

interface TodoItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
}

export default function AddDailyListPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [listData, setListData] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedToId: "",
    dueDate: new Date().toISOString().split('T')[0]
  });

  const [todoItems, setTodoItems] = useState<TodoItem[]>([
    { id: '1', title: "", description: "", priority: "medium", dueDate: "" }
  ]);

  // Fetch users for assignment
  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    }
  });

  const createTodoListMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create todo list");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: t("success"),
        description: "Daily task list created successfully",
      });
      setLocation("/todos");
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || "Failed to create daily task list",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = todoItems.filter(item => item.title.trim() !== "");
    
    if (validItems.length === 0) {
      toast({
        title: t("error"),
        description: "Please add at least one task item",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...listData,
      assignedToId: listData.assignedToId ? parseInt(listData.assignedToId) : null,
      items: validItems.map(item => ({
        title: item.title,
        description: item.description,
        priority: item.priority,
        dueDate: item.dueDate || listData.dueDate
      }))
    };

    createTodoListMutation.mutate(submitData);
  };

  const addTodoItem = () => {
    const newItem: TodoItem = {
      id: Date.now().toString(),
      title: "",
      description: "",
      priority: "medium",
      dueDate: ""
    };
    setTodoItems(prev => [...prev, newItem]);
  };

  const removeTodoItem = (id: string) => {
    if (todoItems.length > 1) {
      setTodoItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateTodoItem = (id: string, field: keyof TodoItem, value: string) => {
    setTodoItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleListDataChange = (field: string, value: string) => {
    setListData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/todos")}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("add")} {t("dailyTasks")}</h1>
                <p className="text-gray-600 mt-1">Create a new daily task list with multiple items</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            <CheckSquare className="w-4 h-4 mr-2" />
            New Daily List
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* List Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Calendar className="w-6 h-6 mr-3 text-primary" />
                Daily List Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4" />
                    <span>{t("title")}</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter daily list title"
                    value={listData.title}
                    onChange={(e) => handleListDataChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">{t("priority")}</Label>
                  <Select value={listData.priority} onValueChange={(value) => handleListDataChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{t("assignedTo")}</span>
                  </Label>
                  <Select value={listData.assignedToId} onValueChange={(value) => handleListDataChange("assignedToId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {usersData?.users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.firstName} {user.lastName} ({user.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{t("dueDate")}</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={listData.dueDate}
                    onChange={(e) => handleListDataChange("dueDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  placeholder="Enter daily list description..."
                  value={listData.description}
                  onChange={(e) => handleListDataChange("description", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Task Items Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl">
                  <CheckSquare className="w-6 h-6 mr-3 text-primary" />
                  Task Items ({todoItems.length})
                </CardTitle>
                <Button 
                  type="button" 
                  onClick={addTodoItem}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {todoItems.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Task Item #{index + 1}</h4>
                      {todoItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTodoItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("title")}</Label>
                        <Input
                          type="text"
                          placeholder="Enter task title"
                          value={item.title}
                          onChange={(e) => updateTodoItem(item.id, "title", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t("priority")}</Label>
                        <Select value={item.priority} onValueChange={(value) => updateTodoItem(item.id, "priority", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("description")}</Label>
                        <Textarea
                          placeholder="Enter task description"
                          value={item.description}
                          onChange={(e) => updateTodoItem(item.id, "description", e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Due Date (Optional)</Label>
                        <Input
                          type="date"
                          value={item.dueDate}
                          onChange={(e) => updateTodoItem(item.id, "dueDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setLocation("/todos")}
            >
              {t("cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={createTodoListMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{createTodoListMutation.isPending ? t("loading") : t("save")} Daily List</span>
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}