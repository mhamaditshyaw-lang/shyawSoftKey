import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  User,
  MapPin,
  Bell,
  CheckCircle2,
  X,
  Plus,
  Eye,
  Edit,
  AlertCircle,
  Users,
} from "lucide-react";

interface CalendarEvent {
  id: number;
  type: "reminder" | "interview";
  title: string;
  date: string;
  time?: string;
  description?: string;
  status?: string;
  isCompleted?: boolean;
  candidateName?: string;
  position?: string;
  duration?: number;
  location?: string;
}

interface Reminder {
  id: number;
  todoItemId: number;
  reminderDate: string;
  message?: string;
  title?: string;
  itemText?: string;
  isCompleted: boolean;
  createdById: number;
  createdAt: string;
}

interface InterviewRequest {
  id: number;
  position: string;
  candidateName: string;
  candidateEmail?: string;
  proposedDateTime: string;
  duration: number;
  description?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Calculate date range for current month (plus buffer for prev/next month visibility)
  const getDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0]
    };
  };

  const dateRange = getDateRange();

  // Fetch calendar events for date range
  const { data: calendarData, isLoading: calendarLoading, error: calendarError } = useQuery({
    queryKey: ["/api/calendar/events", dateRange],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", `/api/calendar/events?from=${dateRange.from}&to=${dateRange.to}`);
      return response.json();
    },
  });

  const calendarEvents: CalendarEvent[] = calendarData?.events || [];

  // Get events for selected date (using local timezone)
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === dateStr;
    });
  };

  // Get dates that have events (using local timezone)
  const getEventDates = () => {
    return calendarEvents.map(event => {
      const eventDate = new Date(event.date);
      return new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    });
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  // Update reminder mutation
  const updateReminderMutation = useMutation({
    mutationFn: async (data: { id: number; isCompleted: boolean }) => {
      const response = await authenticatedRequest("PATCH", `/api/reminders/${data.id}`, { isCompleted: data.isCompleted });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events", dateRange] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] }); // Keep for other pages that might use it
      toast({
        title: "Success",
        description: "Reminder updated successfully!",
      });
    },
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (dateString: string, isCompleted?: boolean) => {
    if (isCompleted) return false;
    return new Date(dateString) < new Date();
  };

  const getEventStatusColor = (event: CalendarEvent) => {
    if (event.type === "reminder") {
      if (event.isCompleted) return "bg-green-100 text-green-800 border-green-200";
      if (isOverdue(event.date, event.isCompleted)) return "bg-red-100 text-red-800 border-red-200";
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else {
      switch (event.status) {
        case "approved": return "bg-green-100 text-green-800 border-green-200";
        case "rejected": return "bg-red-100 text-red-800 border-red-200";
        default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      }
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleToggleComplete = (event: CalendarEvent) => {
    if (event.type === "reminder") {
      updateReminderMutation.mutate({ id: event.id, isCompleted: !event.isCompleted });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
                <p className="text-sm text-gray-600 mt-1">Interactive calendar for all reminders and events</p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Calendar
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Reminders</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Interviews</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                data-testid="calendar-widget"
                modifiers={{
                  hasEvents: getEventDates(),
                }}
                modifiersClassNames={{
                  hasEvents: "bg-gradient-to-br from-blue-100 to-purple-100 text-blue-900 font-semibold",
                }}
              />
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {isToday(selectedDate) ? "Today's Events" : formatDate(selectedDate.toISOString())}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {calendarLoading ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-8 h-8 animate-pulse text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Loading events...</p>
                </div>
              ) : calendarError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Events</h3>
                  <p className="text-red-500 text-sm">Failed to load calendar events. Please try again.</p>
                </div>
              ) : selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Events</h3>
                  <p className="text-gray-500 text-sm">No events scheduled for this date</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {selectedDateEvents
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((event) => (
                        <motion.div
                          key={`${event.type}-${event.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all hover:shadow-md ${getEventStatusColor(event)}`}
                            onClick={() => handleEventClick(event)}
                            data-testid={`event-card-${event.type}-${event.id}`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  {event.type === "reminder" ? (
                                    <Bell className="w-4 h-4 mt-0.5" />
                                  ) : (
                                    <Users className="w-4 h-4 mt-0.5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-sm truncate">{event.title}</h4>
                                    {event.type === "reminder" && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleComplete(event);
                                        }}
                                        className="p-1 h-auto"
                                        data-testid={`toggle-complete-${event.id}`}
                                      >
                                        {event.isCompleted ? (
                                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(event.date)}</span>
                                    {event.type === "interview" && event.duration && (
                                      <span>({event.duration}min)</span>
                                    )}
                                  </div>
                                  {event.candidateName && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                      <User className="w-3 h-3" />
                                      <span>{event.candidateName}</span>
                                    </div>
                                  )}
                                  {event.type === "reminder" && isOverdue(event.date, event.isCompleted) && (
                                    <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                      <AlertCircle className="w-3 h-3" />
                                      <span>Overdue</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Details Modal */}
        <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
          <DialogContent className="max-w-md" data-testid="event-details-modal">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedEvent?.type === "reminder" ? (
                  <Bell className="w-5 h-5" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
                Event Details
              </DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.date)}
                  </p>
                </div>

                {selectedEvent.type === "reminder" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={selectedEvent.isCompleted ? "secondary" : isOverdue(selectedEvent.date, selectedEvent.isCompleted) ? "destructive" : "default"}>
                        {selectedEvent.isCompleted ? "Completed" : isOverdue(selectedEvent.date, selectedEvent.isCompleted) ? "Overdue" : "Pending"}
                      </Badge>
                    </div>
                    {selectedEvent.description && (
                      <div>
                        <span className="text-sm font-medium block mb-1">Message:</span>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{selectedEvent.description}</p>
                      </div>
                    )}
                    <Button
                      onClick={() => handleToggleComplete(selectedEvent)}
                      className="w-full"
                      variant={selectedEvent.isCompleted ? "outline" : "default"}
                      data-testid="modal-toggle-complete"
                    >
                      {selectedEvent.isCompleted ? "Mark as Pending" : "Mark as Complete"}
                    </Button>
                  </div>
                )}

                {selectedEvent.type === "interview" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={
                        selectedEvent.status === "approved" ? "secondary" :
                        selectedEvent.status === "rejected" ? "destructive" : "default"
                      }>
                        {selectedEvent.status ? selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1) : "Unknown"}
                      </Badge>
                    </div>
                    {selectedEvent.candidateName && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Candidate:</span>
                        <span className="text-sm">{selectedEvent.candidateName}</span>
                      </div>
                    )}
                    {selectedEvent.position && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Position:</span>
                        <span className="text-sm">{selectedEvent.position}</span>
                      </div>
                    )}
                    {selectedEvent.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Duration:</span>
                        <span className="text-sm">{selectedEvent.duration} minutes</span>
                      </div>
                    )}
                    {selectedEvent.description && (
                      <div>
                        <span className="text-sm font-medium block mb-1">Description:</span>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{selectedEvent.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}