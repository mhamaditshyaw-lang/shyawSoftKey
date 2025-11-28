import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, Save, CheckCircle, Clock, Zap, Send } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WeeklyMeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [newTask, setNewTask] = useState({
    department: "",
    title: "",
    description: "",
    target: "",
    assignedUserId: "",
  });
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: meeting, isLoading } = useQuery({
    queryKey: ["/api/weekly-meetings", id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/weekly-meetings/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to fetch meeting');
      return res.json();
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/weekly-meetings", id, "tasks"],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/weekly-meetings/${id}/tasks`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/weekly-meetings/${id}/tasks`, {
        meetingId: parseInt(id!),
        departmentName: newTask.department,
        title: newTask.title,
        description: newTask.description,
        targetValue: parseInt(newTask.target) || 0,
        assignedUserId: newTask.assignedUserId ? parseInt(newTask.assignedUserId) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-meetings", id, "tasks"] });
      setNewTask({ department: "", title: "", description: "", target: "", assignedUserId: "" });
      toast({ title: "Success", description: "Task added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("POST", `/api/weekly-meetings/tasks/${taskId}/comments`, {
        comment: newComment,
        proofUrl: "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-meetings", id, "tasks"] });
      setNewComment("");
      toast({ title: "Success", description: "Comment added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Button variant="outline" onClick={() => setLocation("/weekly-meetings")}>
        ← Back to Meetings
      </Button>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Week Number</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">{meeting?.weekNumber}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Meeting Status</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {meeting?.status}
            </span>
          </CardContent>
        </Card>
      </div>

      {(user?.role === "admin" || user?.role === "manager") && meeting?.status === "planned" && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
            <CardDescription>Assign work points to departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Department"
                value={newTask.department}
                onChange={(e) => setNewTask({ ...newTask, department: e.target.value })}
              />
              <Input
                placeholder="Target Value"
                type="number"
                value={newTask.target}
                onChange={(e) => setNewTask({ ...newTask, target: e.target.value })}
              />
              <Select value={newTask.assignedUserId} onValueChange={(value) => setNewTask({ ...newTask, assignedUserId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows={3}
            />
            <Button
              onClick={() => addTaskMutation.mutate()}
              disabled={!newTask.department || !newTask.title || addTaskMutation.isPending}
              className="w-full gap-2"
            >
              {addTaskMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Task
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Department work points for this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task: any) => (
              <Card key={task.id} className="bg-slate-50 dark:bg-slate-900">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{task.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{task.departmentName}</p>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded text-xs font-medium">
                      Target: {task.targetValue}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{task.description}</p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                    className="gap-1"
                  >
                    <Zap className="h-3 w-3" />
                    {selectedTask === task.id ? "Hide" : "View"} Progress
                  </Button>
                  {selectedTask === task.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Progress</span>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">0%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full w-0 transition-all"></div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Target: {task.targetValue} | Current: 0 | Status: Not Started
                        </p>
                      </div>

                      <div className="space-y-2 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded border border-indigo-200 dark:border-indigo-800">
                        <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">Comments & Progress</p>
                        
                        {task.comments && task.comments.length > 0 && (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {task.comments.map((comment: any) => (
                              <div key={comment.id} className="bg-white dark:bg-slate-800 p-2 rounded text-xs">
                                <p className="font-medium text-slate-900 dark:text-white">{comment.authorId}</p>
                                <p className="text-slate-600 dark:text-slate-400">{comment.comment}</p>
                                <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 items-end">
                          <Textarea
                            placeholder="Add comment or proof..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={2}
                            className="text-xs flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => addCommentMutation.mutate(task.id)}
                            disabled={!newComment.trim() || addCommentMutation.isPending}
                            className="gap-1"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
