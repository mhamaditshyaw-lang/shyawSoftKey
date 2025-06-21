import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Plus, User, CheckSquare } from "lucide-react";
import AddTodoModal from "@/components/modals/add-todo-modal";

export default function TodosPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  const { data: todosData, isLoading } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/todos");
      return await response.json();
    },
  });

  const updateTodoItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await authenticatedRequest("PATCH", `/api/todos/items/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update todo item",
        variant: "destructive",
      });
    },
  });

  const todoLists = todosData?.todoLists || [];

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (items: any[]) => {
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.isCompleted).length;
    return Math.round((completed / items.length) * 100);
  };

  const handleToggleTodoItem = (itemId: number, currentStatus: boolean) => {
    updateTodoItemMutation.mutate({
      id: itemId,
      updates: { isCompleted: !currentStatus }
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Todo Management</h2>
            <p className="text-gray-600">Organize and assign tasks across your organization</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Todo List
          </Button>
        </div>
      </div>

      {/* Todo Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {todoLists.map((list: any) => {
          const progress = calculateProgress(list.items);
          const completedCount = list.items.filter((item: any) => item.isCompleted).length;
          
          return (
            <Card key={list.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{list.title}</CardTitle>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <CheckSquare className="w-4 h-4 mr-1" />
                    {list.items.length} tasks
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {list.assignedTo 
                      ? `${list.assignedTo.firstName} ${list.assignedTo.lastName}`
                      : list.createdBy.firstName + " " + list.createdBy.lastName
                    }
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  {list.items.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        checked={item.isCompleted}
                        onCheckedChange={() => handleToggleTodoItem(item.id, item.isCompleted)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          item.isCompleted ? "text-gray-500 line-through" : "text-gray-900"
                        }`}>
                          {item.title}
                        </p>
                        {item.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        {item.isCompleted && item.completedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Completed {new Date(item.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge className={getPriorityBadgeColor(item.priority)}>
                        {item.isCompleted ? "Done" : item.priority}
                      </Badge>
                    </div>
                  ))}
                  
                  {list.items.length > 5 && (
                    <p className="text-sm text-gray-600 text-center py-2">
                      +{list.items.length - 5} more tasks
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-900">
                      {completedCount}/{list.items.length} completed
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add New Todo List Card */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer">
          <CardContent 
            className="flex items-center justify-center p-12"
            onClick={() => setShowAddModal(true)}
          >
            <div className="text-center">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Create New Todo List</h3>
              <p className="text-sm text-gray-500 mt-2">Organize tasks for your team</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddTodoModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
