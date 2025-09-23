import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AddTodoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTodoModal({ open, onOpenChange }: AddTodoModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedToId: "none",
    priority: "medium",
  });
  const { toast } = useToast();

  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      if (user?.role !== "admin") return { users: [] };
      const response = await authenticatedRequest("GET", "/api/users");
      return await response.json();
    },
    enabled: open && user?.role === "admin",
  });

  const createTodoMutation = useMutation({
    mutationFn: async (todoData: any) => {
      const response = await authenticatedRequest("POST", "/api/todos", {
        ...todoData,
        assignedToId: todoData.assignedToId && todoData.assignedToId !== "none" ? parseInt(todoData.assignedToId) : null,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Todo list created successfully",
      });
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        assignedToId: "none",
        priority: "medium",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create todo list",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTodoMutation.mutate(formData);
  };

  const users = usersData?.users || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("createTodoList")}</DialogTitle>
          <DialogDescription>
            {t("todoCreateDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("listName")}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <p className="text-sm text-gray-600">{t("todoTitleGuidance")}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t("todoDescription")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <p className="text-sm text-gray-600">{t("todoDescriptionGuidance")}</p>
          </div>
          
          {user?.role === "admin" && users.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assignedToId">{t("assignToUser")}</Label>
              <Select value={formData.assignedToId} onValueChange={(value) => setFormData({ ...formData, assignedToId: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("noAssignment")}</SelectItem>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.firstName} {user.lastName} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="priority">{t("todoPriority")}</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("priorityLow")}</SelectItem>
                <SelectItem value="medium">{t("priorityMedium")}</SelectItem>
                <SelectItem value="high">{t("priorityHigh")}</SelectItem>
                <SelectItem value="urgent">{t("priorityUrgent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTodoMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={createTodoMutation.isPending}>
              {createTodoMutation.isPending ? t("creating") : t("createTodoListAction")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
