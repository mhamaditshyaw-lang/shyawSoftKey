import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, Save, CheckCircle, Clock, Zap, Send, FileCheck, Eye, TrendingUp, Check, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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
    assignedUserIds: [] as string[],
  });
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [expandedCommentId, setExpandedCommentId] = useState<number | null>(null);
  const [expandedCommentsSection, setExpandedCommentsSection] = useState<Set<number>>(new Set());
  const [taskProgress, setTaskProgress] = useState<Record<number, {current: number, status: string}>>({});
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskName, setEditTaskName] = useState("");

  const { data: usersData = [] } = useQuery({
    queryKey: ["/api/users"],
  });
  
  const users = Array.isArray(usersData) ? usersData : (usersData as any)?.users || [];

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
        assignedUserIds: newTask.assignedUserIds.map(id => parseInt(id)),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-meetings", id, "tasks"] });
      setNewTask({ department: "", title: "", description: "", target: "", assignedUserIds: [] });
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
        comment: newComment[taskId] || "",
        proofUrl: "",
      });
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-meetings", id, "tasks"] });
      setNewComment(prev => ({ ...prev, [taskId]: "" }));
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

  const updateProgressMutation = useMutation({
    mutationFn: async ({ taskId, current, status }: { taskId: number; current: number; status: string }) => {
      return apiRequest("PATCH", `/api/weekly-meetings/tasks/${taskId}/progress`, {
        current,
        status,
      });
    },
    onSuccess: (_, { taskId, current, status }) => {
      setTaskProgress(prev => ({...prev, [taskId]: {current, status}}));
      toast({ title: "Success", description: "Progress updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: number; isCompleted: boolean }) => {
      if (isCompleted && (user?.role === "office" || user?.role === "manager" || user?.role === "admin")) {
        return apiRequest("PATCH", `/api/weekly-meetings/tasks/${taskId}/uncomplete`, {});
      }
      return apiRequest("PATCH", `/api/weekly-meetings/tasks/${taskId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-meetings", id, "tasks"] });
      toast({ title: "Success", description: "Task updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskNameMutation = useMutation({
    mutationFn: async ({ taskId, newName }: { taskId: number; newName: string }) => {
      return apiRequest("PATCH", `/api/weekly-meetings/tasks/${taskId}`, { title: newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-meetings", id, "tasks"] });
      setEditingTaskId(null);
      toast({ title: "Success", description: "Task name updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("DELETE", `/api/weekly-meetings/tasks/${taskId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-meetings", id, "tasks"] });
      toast({ title: "Success", description: "Task deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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


      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Department work points for this week</CardDescription>
          </div>
          {(user?.role === "admin" || user?.role === "manager") && meeting?.status === "planned" && (
            <Button
              onClick={() => setShowAddTaskModal(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.filter((task: any) => {
              if (user?.role === "office" || user?.role === "manager" || user?.role === "admin") return true;
              if (!task.assignedUserIds || task.assignedUserIds.length === 0) return true;
              return task.assignedUserIds.includes(user?.id);
            }).map((task: any) => (
              <Card key={task.id} className={`${task.isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-900'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        <button
                          onClick={() => completeTaskMutation.mutate({ taskId: task.id, isCompleted: task.isCompleted })}
                          disabled={completeTaskMutation.isPending}
                          className={`p-1.5 rounded ${task.isCompleted ? 'bg-green-500 text-white' : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500'} transition-all`}
                        >
                          {task.isCompleted ? <Check className="h-4 w-4" /> : <div className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex-1">
                        {editingTaskId === task.id ? (
                          <div className="flex gap-2 mb-2">
                            <Input
                              value={editTaskName}
                              onChange={(e) => setEditTaskName(e.target.value)}
                              className="text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => updateTaskNameMutation.mutate({ taskId: task.id, newName: editTaskName })}
                              disabled={updateTaskNameMutation.isPending}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTaskId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <h4 className={`font-semibold ${task.isCompleted ? 'line-through text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>{task.title}</h4>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-400">{task.departmentName}</p>
                        {task.assignedUserIds && task.assignedUserIds.length > 0 && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                            Assigned: {task.assignedUserIds.map((uid: number) => {
                              const assignedUser = Array.isArray(users) && users.find((u: any) => u.id === uid);
                              return assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : `User ${uid}`;
                            }).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded text-xs font-medium">
                        Target: {task.targetValue}
                      </span>
                      {(user?.role === "admin" || user?.role === "manager") && editingTaskId !== task.id && (
                        <button
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditTaskName(task.title);
                          }}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Edit task name"
                        >
                          <Edit2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                      )}
                      {(user?.role === "admin" || user?.role === "manager") && editingTaskId !== task.id && (
                        <button
                          onClick={() => {
                            if (confirm("Delete this task?")) {
                              deleteTaskMutation.mutate(task.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Delete task"
                        >
                          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{task.description}</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        const newSet = new Set(expandedCommentsSection);
                        if (newSet.has(task.id)) newSet.delete(task.id);
                        else newSet.add(task.id);
                        setExpandedCommentsSection(newSet);
                      }}
                      className="flex items-center gap-2 hover:opacity-75 transition-opacity w-full"
                    >
                      <ChevronDown 
                        className={`h-4 w-4 text-indigo-600 transition-transform ${expandedCommentsSection.has(task.id) ? 'rotate-180' : ''}`}
                      />
                      <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <p className="font-semibold text-slate-900 dark:text-white">Comments & Progress</p>
                    </button>
                    {expandedCommentsSection.has(task.id) && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700 p-4 space-y-4 mt-3">
                      
                      {task.comments && task.comments.length > 0 && (
                        <div className="space-y-3 max-h-64 overflow-y-auto border-l-4 border-indigo-400 dark:border-indigo-600 pl-3">
                          {task.comments.map((comment: any) => {
                            const commenter = Array.isArray(users) && users.find((u: any) => u.id === comment.authorId);
                            return (
                              <div key={comment.id} className={`p-3 rounded-lg text-sm transition-all ${comment.proofUrl ? 'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500' : 'bg-slate-100 dark:bg-slate-700/50'}`}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                      {commenter ? `${commenter.firstName} ${commenter.lastName}` : `User ${comment.authorId}`}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(comment.createdAt).toLocaleString()}</p>
                                  </div>
                                  {comment.proofUrl && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300 rounded text-xs font-semibold whitespace-nowrap">
                                      <FileCheck className="h-3 w-3" />
                                      Proof
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap mb-2">{comment.comment}</p>
                                {comment.proofUrl && (
                                  <button 
                                    onClick={() => setExpandedCommentId(expandedCommentId === comment.id ? null : comment.id)}
                                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-medium transition-colors"
                                  >
                                    <Eye className="h-3 w-3" />
                                    {expandedCommentId === comment.id ? "Hide Proof" : "View Proof"}
                                  </button>
                                )}
                                {expandedCommentId === comment.id && comment.proofUrl && (
                                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded border-l-2 border-blue-400 dark:border-blue-600">
                                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">📎 Proof File Link:</p>
                                    <a 
                                      href={comment.proofUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all font-medium"
                                    >
                                      {comment.proofUrl.length > 60 ? comment.proofUrl.substring(0, 60) + "..." : comment.proofUrl}
                                    </a>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="space-y-2 pt-2 border-t border-indigo-200 dark:border-indigo-700">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Add Update</p>
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Write your comment or progress update..."
                            value={newComment[task.id] || ""}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [task.id]: e.target.value }))}
                            rows={2}
                            className="text-sm flex-1 resize-none"
                          />
                          <Button
                            size="sm"
                            onClick={() => addCommentMutation.mutate(task.id)}
                            disabled={!newComment[task.id]?.trim() || addCommentMutation.isPending}
                            className="gap-2 self-end px-4"
                          >
                            {addCommentMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            Send
                          </Button>
                      </div>
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>


      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Task</h2>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
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
                <div className="relative">
                  <div className="border rounded p-2 min-h-10 bg-white dark:bg-slate-950 flex flex-wrap gap-1 items-center">
                    {newTask.assignedUserIds.map((userId: string) => {
                      const u = Array.isArray(users) && users.find((u: any) => u.id.toString() === userId);
                      return (
                        <div key={userId} className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                          {u ? `${u.firstName} ${u.lastName}` : `User ${userId}`}
                          <button onClick={() => setNewTask({ ...newTask, assignedUserIds: newTask.assignedUserIds.filter(id => id !== userId) })}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                    <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                      + Add User
                    </button>
                  </div>
                  {showUserDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 border rounded bg-white dark:bg-slate-800 shadow-lg z-10">
                      <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                        {Array.isArray(users) && users.map((u: any) => (
                          <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newTask.assignedUserIds.includes(u.id.toString())}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewTask({ ...newTask, assignedUserIds: [...newTask.assignedUserIds, u.id.toString()] });
                                } else {
                                  setNewTask({ ...newTask, assignedUserIds: newTask.assignedUserIds.filter(id => id !== u.id.toString()) });
                                }
                              }}
                            />
                            {u.firstName} {u.lastName}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddTaskModal(false)}>Cancel</Button>
                <Button
                  onClick={() => addTaskMutation.mutate()}
                  disabled={!newTask.department || !newTask.title || addTaskMutation.isPending}
                  className="gap-2"
                >
                  {addTaskMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Task
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
