import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Filter,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface Reminder {
  id: number;
  todoItemId: number;
  reminderDate: string;
  message?: string;
  isCompleted: boolean;
  createdById: number;
  createdAt: string;
}

export default function RemindersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<"all" | "today" | "upcoming" | "overdue">("today");

  // Fetch all reminders
  const { data: remindersData, isLoading } = useQuery({
    queryKey: ["/api/reminders"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/reminders");
      return response.json();
    },
  });

  // Fetch today's reminders
  const { data: todayRemindersData } = useQuery({
    queryKey: ["/api/reminders/today"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/reminders/today");
      return response.json();
    },
  });

  // Update reminder mutation
  const updateReminderMutation = useMutation({
    mutationFn: async (data: { id: number; isCompleted: boolean }) => {
      const response = await authenticatedRequest("PATCH", `/api/reminders/${data.id}`, { isCompleted: data.isCompleted });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/today"] });
      toast({
        title: "Success",
        description: "Reminder updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update reminder",
        variant: "destructive",
      });
    },
  });

  // Delete reminder mutation
  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedRequest("DELETE", `/api/reminders/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/today"] });
      toast({
        title: "Success",
        description: "Reminder deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete reminder",
        variant: "destructive",
      });
    },
  });

  const reminders: Reminder[] = remindersData?.reminders || [];
  const todayReminders: Reminder[] = todayRemindersData?.reminders || [];

  // Filter reminders based on type
  const filterReminders = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterType) {
      case "today":
        return todayReminders;
      case "upcoming":
        return reminders.filter(reminder => {
          const reminderDate = new Date(reminder.reminderDate);
          return reminderDate > today && !reminder.isCompleted;
        });
      case "overdue":
        return reminders.filter(reminder => {
          const reminderDate = new Date(reminder.reminderDate);
          return reminderDate < now && !reminder.isCompleted;
        });
      case "all":
      default:
        return reminders;
    }
  };

  const filteredReminders = filterReminders();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date() && filterType !== "upcoming";
  };

  const handleToggleComplete = (id: number, isCompleted: boolean) => {
    updateReminderMutation.mutate({ id, isCompleted: !isCompleted });
  };

  const handleDeleteReminder = (id: number) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      deleteReminderMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-600 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
                <p className="text-sm text-gray-600 mt-1">Manage your task reminders and notifications</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter Controls */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={filterType === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("today")}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Today ({todayReminders.length})
              </Button>
              <Button
                variant={filterType === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("upcoming")}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Upcoming
              </Button>
              <Button
                variant={filterType === "overdue" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("overdue")}
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Overdue
              </Button>
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                All ({reminders.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/reminders/today"] });
                }}
                className="ml-auto"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reminders List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Loading reminders...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredReminders.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reminders Found</h3>
                <p className="text-gray-500">
                  {filterType === "today" 
                    ? "No reminders scheduled for today" 
                    : `No ${filterType} reminders to display`}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredReminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group"
                >
                  <Card className={`${
                    reminder.isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : isOverdue(reminder.reminderDate) 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white border-gray-200'
                  } hover:shadow-md transition-shadow`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Completion Toggle */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleComplete(reminder.id, reminder.isCompleted)}
                          className="flex-shrink-0 p-1"
                        >
                          {reminder.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-400 hover:border-blue-500" />
                          )}
                        </Button>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={
                                  reminder.isCompleted 
                                    ? "secondary" 
                                    : isOverdue(reminder.reminderDate) 
                                      ? "destructive" 
                                      : "default"
                                }>
                                  {reminder.isCompleted 
                                    ? "Completed" 
                                    : isOverdue(reminder.reminderDate) 
                                      ? "Overdue" 
                                      : "Pending"}
                                </Badge>
                                {isOverdue(reminder.reminderDate) && !reminder.isCompleted && (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Clock className="w-4 h-4" />
                                <span className={reminder.isCompleted ? 'line-through' : ''}>
                                  {formatDate(reminder.reminderDate)}
                                </span>
                              </div>

                              {reminder.message && (
                                <p className={`text-sm text-gray-800 ${reminder.isCompleted ? 'line-through' : ''}`}>
                                  {reminder.message}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteReminder(reminder.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                                title="Delete reminder"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}