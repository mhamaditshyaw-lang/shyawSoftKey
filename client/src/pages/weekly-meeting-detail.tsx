import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, Save, CheckCircle, Clock, Zap, Send, FileCheck, Eye, TrendingUp, Check, X, Edit2, ChevronDown } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 space-y-6 p-6">
      <Button variant="outline" onClick={() => setLocation("/weekly-meetings")} className="border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
        ← Back to Meetings
      </Button>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-xl">
          <p className="text-indigo-100 text-sm font-semibold">Week Number</p>
          <p className="text-4xl font-bold text-white mt-3">{meeting?.weekNumber}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl">
          <p className="text-blue-100 text-sm font-semibold">Total Tasks</p>
          <p className="text-4xl font-bold text-white mt-3">{tasks.length}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-6 rounded-2xl shadow-xl">
          <p className="text-teal-100 text-sm font-semibold">Meeting Status</p>
          <p className="text-2xl font-bold text-white mt-3 uppercase">{meeting?.status}</p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.filter((task: any) => {
              if (user?.role === "office" || user?.role === "manager" || user?.role === "admin") return true;
              if (!task.assignedUserIds || task.assignedUserIds.length === 0) return true;
              return task.assignedUserIds.includes(user?.id);
            }).map((task: any) => (
              <Card key={task.id} className={`flex flex-col ${task.isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow'}`}>
                <CardContent className="p-4 flex flex-col flex-1">
                  {/* Header with checkbox and actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2 flex-1">
                      {(user?.role === "admin" || user?.role === "manager") ? (
                        <button
                          onClick={() => completeTaskMutation.mutate({ taskId: task.id, isCompleted: task.isCompleted })}
                          disabled={completeTaskMutation.isPending}
                          className={`p-1 rounded flex-shrink-0 ${task.isCompleted ? 'bg-green-500 text-white' : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500'} transition-all cursor-pointer`}
                          title="Mark complete/incomplete"
                        >
                          {task.isCompleted ? <Check className="h-4 w-4" /> : <div className="h-4 w-4" />}
                        </button>
                      ) : (
                        <div className={`p-1 rounded flex-shrink-0 ${task.isCompleted ? 'bg-green-500 text-white' : 'border-2 border-slate-300 dark:border-slate-600'}`}>
                          {task.isCompleted ? <Check className="h-4 w-4" /> : <div className="h-4 w-4" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {editingTaskId === task.id ? (
                          <div className="flex gap-1 mb-2">
                            <Input
                              value={editTaskName}
                              onChange={(e) => setEditTaskName(e.target.value)}
                              className="text-xs h-8"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => updateTaskNameMutation.mutate({ taskId: task.id, newName: editTaskName })}
                              disabled={updateTaskNameMutation.isPending}
                              className="text-xs h-8"
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <h4 className={`text-sm font-semibold break-words ${task.isCompleted ? 'line-through text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>{task.title}</h4>
                        )}
                      </div>
                    </div>
                    {!editingTaskId && (user?.role === "admin" || user?.role === "manager") && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditTaskName(task.title);
                          }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this task?")) {
                              deleteTaskMutation.mutate(task.id);
                            }
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Delete"
                        >
                          <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Department and Target */}
                  <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{task.departmentName}</p>
                    <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">
                      Target: {task.targetValue}
                    </span>
                  </div>

                  {/* Assigned Users */}
                  {task.assignedUserIds && task.assignedUserIds.length > 0 && (
                    <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned to:</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {task.assignedUserIds.map((uid: number) => {
                          const assignedUser = Array.isArray(users) && users.find((u: any) => u.id === uid);
                          return assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : `User ${uid}`;
                        }).join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{task.description}</p>
                  )}

                  {/* Creator and Completer Info */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                    {task.createdById && (
                      <div>
                        <p className="text-xs">
                          Created by: <span className="font-semibold text-slate-900 dark:text-white">
                            {users.find((u: any) => u.id === task.createdById)?.firstName || 'User'} {users.find((u: any) => u.id === task.createdById)?.lastName || ''}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 ml-1">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    )}
                    {task.isCompleted && task.completedById && (
                      <div>
                        <p className="text-xs text-green-700 dark:text-green-400">
                          Completed by: <span className="font-semibold">
                            {users.find((u: any) => u.id === task.completedById)?.firstName || 'User'} {users.find((u: any) => u.id === task.completedById)?.lastName || ''}
                          </span>
                          <span className="ml-1">
                            {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Comments Toggle - Compact */}
                  <button
                    onClick={() => {
                      const newSet = new Set(expandedCommentsSection);
                      if (newSet.has(task.id)) newSet.delete(task.id);
                      else newSet.add(task.id);
                      setExpandedCommentsSection(newSet);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    <ChevronDown 
                      className={`h-3 w-3 transition-transform ${expandedCommentsSection.has(task.id) ? 'rotate-180' : ''}`}
                    />
                    <FileCheck className="h-3 w-3" />
                    <span>Updates ({task.comments?.length || 0})</span>
                  </button>

                  {expandedCommentsSection.has(task.id) && (
                    <div className="bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-3 mt-2">
                      
                      {task.comments && task.comments.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {task.comments.map((comment: any) => {
                            const commenter = Array.isArray(users) && users.find((u: any) => u.id === comment.authorId);
                            return (
                              <div key={comment.id} className={`p-2 rounded text-xs ${comment.proofUrl ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
                                <div className="flex items-start justify-between gap-1 mb-1">
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{commenter ? `${commenter.firstName}` : `User`}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(comment.createdAt).toLocaleTimeString()}</p>
                                  </div>
                                  {comment.proofUrl && (
                                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-600 text-white rounded text-xs whitespace-nowrap font-semibold">
                                      <FileCheck className="h-2.5 w-2.5" />
                                      Proof
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 break-words mb-1">{comment.comment}</p>
                                {comment.proofUrl && (
                                  <button 
                                    onClick={() => setExpandedCommentId(expandedCommentId === comment.id ? null : comment.id)}
                                    className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                                  >
                                    {expandedCommentId === comment.id ? "Hide" : "View"} Proof
                                  </button>
                                )}
                                {expandedCommentId === comment.id && comment.proofUrl && (
                                  <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-400">
                                    <a 
                                      href={comment.proofUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                                    >
                                      {comment.proofUrl.length > 40 ? comment.proofUrl.substring(0, 40) + "..." : comment.proofUrl}
                                    </a>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <Textarea
                          placeholder="Add update..."
                          value={newComment[task.id] || ""}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [task.id]: e.target.value }))}
                          rows={1}
                          className="text-xs resize-none h-20"
                        />
                        <Button
                          size="sm"
                          onClick={() => addCommentMutation.mutate(task.id)}
                          disabled={!newComment[task.id]?.trim() || addCommentMutation.isPending}
                          className="w-full gap-1 text-xs h-7"
                        >
                          {addCommentMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
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
