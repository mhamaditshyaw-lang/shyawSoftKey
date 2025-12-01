import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Plus, Archive, Eye, Loader2, Filter, ChevronDown, Search, X, Edit2, BarChart3, TrendingUp, Home, Save, PieChart, Send, Clock, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WeeklyMeetingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedMeetings, setExpandedMeetings] = useState<Set<number>>(new Set());
  const [nameSearch, setNameSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editingWeekId, setEditingWeekId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [expandedDataWeek, setExpandedDataWeek] = useState<number | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: meetings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/weekly-meetings"],
  });

  const { data: allTasks = [] } = useQuery<any[]>({
    queryKey: ["/api/weekly-meetings/all-tasks"],
  });


  const filteredMeetings = meetings.filter((meeting: any) => {
    const statusMatch = statusFilter === "all" ? true : meeting.status === statusFilter;
    const nameMatch = nameSearch === "" || `Week ${meeting.weekNumber}`.toLowerCase().includes(nameSearch.toLowerCase());
    const dateMatch = (!dateFrom || new Date(meeting.meetingDate) >= new Date(dateFrom)) &&
                      (!dateTo || new Date(meeting.meetingDate) <= new Date(dateTo));
    return statusMatch && nameMatch && dateMatch;
  });

  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const paginatedMeetings = filteredMeetings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const createMeetingMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const weekNumber = Math.ceil((now.getDate() - now.getDay()) / 7);
      
      return apiRequest("POST", "/api/weekly-meetings", {
        weekNumber,
        year: now.getFullYear(),
        meetingDate: now.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-meetings"] });
      toast({
        title: "Success",
        description: "Weekly meeting created successfully",
      });
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create meeting",
        variant: "destructive",
      });
    },
  });

  const updateMeetingNameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      return apiRequest("PATCH", `/api/weekly-meetings/${id}`, {
        name: name,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-meetings"] });
      setEditingWeekId(null);
      toast({
        title: "Success",
        description: "Meeting name updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update meeting",
        variant: "destructive",
      });
    },
  });

  const updateMeetingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/weekly-meetings/${id}`, {
        status: status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-meetings"] });
      toast({
        title: "Success",
        description: "Meeting status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-2xl shadow-2xl">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">📊 Weekly Meeting Tasks</h1>
            <p className="text-blue-100 mt-2 text-lg">Manage departmental work points and progress</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            {(user?.role === "manager" || user?.role === "office" || user?.role === "staff_office") && (
              <Button
                onClick={() => createMeetingMutation.mutate()}
                disabled={isCreating || createMeetingMutation.isPending}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createMeetingMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                New Meeting
              </Button>
            )}
          </div>
        </div>

      {/* Analytics Section */}
      {meetings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold">Completed</p>
                <p className="text-4xl font-bold text-white mt-2">{meetings.filter((m: any) => m.status === "completed").length}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold">In Progress</p>
                <p className="text-4xl font-bold text-white mt-2">{meetings.filter((m: any) => m.status === "in_progress").length}</p>
              </div>
              <Clock className="h-12 w-12 text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-semibold">Planned</p>
                <p className="text-4xl font-bold text-white mt-2">{meetings.filter((m: any) => m.status === "planned").length}</p>
              </div>
              <Zap className="h-12 w-12 text-purple-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-semibold">Total Meetings</p>
                <p className="text-4xl font-bold text-white mt-2">{meetings.length}</p>
              </div>
              <BarChart3 className="h-12 w-12 text-orange-200 opacity-50" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filters:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search by week..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="w-40 h-9"
          />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40 h-9"
            placeholder="From"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40 h-9"
            placeholder="To"
          />
          {(nameSearch || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNameSearch("");
                setDateFrom("");
                setDateTo("");
              }}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
          {filteredMeetings.length > 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
              {filteredMeetings.length} result{filteredMeetings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedMeetings.map((meeting: any, index: number) => (
          <Card key={meeting.id} className="bg-white dark:bg-slate-800 hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden shadow-lg">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <CardHeader className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingWeekId === meeting.id ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Week name"
                        className="h-8 text-sm border-blue-300"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => {
                          if (editingName.trim()) {
                            updateMeetingNameMutation.mutate({ id: meeting.id, name: editingName });
                          } else {
                            setEditingWeekId(null);
                          }
                        }} 
                        className="h-8 gap-1 bg-blue-600 hover:bg-blue-700"
                        disabled={updateMeetingNameMutation.isPending}
                      >
                        {updateMeetingNameMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        {meeting.name || `Week ${meeting.weekNumber}`}
                      </CardTitle>
                      <CardDescription className="text-indigo-600 dark:text-indigo-400">{meeting.year}</CardDescription>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingWeekId(meeting.id);
                      setEditingName(meeting.name || `Week ${meeting.weekNumber}`);
                    }}
                    className="p-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded transition-colors"
                    title="Edit name"
                  >
                    <Edit2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </button>
                  <Select value={meeting.status} onValueChange={(value) => updateMeetingStatusMutation.mutate({ id: meeting.id, status: value })}>
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Complete</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(meeting.meetingDate).toLocaleDateString()}
                </p>
                  {meeting.description && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded border border-indigo-200 dark:border-indigo-800">
                      <button
                        onClick={() => {
                          const newSet = new Set(expandedMeetings);
                          if (newSet.has(meeting.id)) newSet.delete(meeting.id);
                          else newSet.add(meeting.id);
                          setExpandedMeetings(newSet);
                        }}
                        className="flex items-center gap-2 w-full text-left hover:opacity-75 transition-opacity"
                      >
                        <ChevronDown
                          className={`h-3 w-3 text-indigo-600 transition-transform ${
                            expandedMeetings.has(meeting.id) ? "rotate-180" : ""
                          }`}
                        />
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          Description
                        </span>
                      </button>
                      {expandedMeetings.has(meeting.id) && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{meeting.description}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-col">
                  <div className="flex gap-2">
                    <Link href={`/weekly-meetings/${meeting.id}`} asChild>
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Eye className="h-3 w-3" />
                        View Tasks
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => setExpandedDataWeek(expandedDataWeek === meeting.id ? null : meeting.id)}
                    >
                      <PieChart className="h-3 w-3" />
                      View Data
                    </Button>
                  </div>
                  {expandedDataWeek === meeting.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-3 rounded border border-indigo-200 dark:border-indigo-800 space-y-2 text-xs"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded">
                          <p className="text-slate-600 dark:text-slate-400">Total Tasks</p>
                          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {meetings.find((m: any) => m.id === meeting.id)?.tasksCount || 0}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-2 rounded">
                          <p className="text-slate-600 dark:text-slate-400">Status</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400 capitalize">
                            {meeting.status}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => {
                          setSelectedMeetingId(meeting.id);
                          setShowAnalysisModal(true);
                        }}
                      >
                        <BarChart3 className="h-3 w-3" />
                        View Full Analysis
                      </Button>
                    </motion.div>
                  )}
                  {meeting.status === "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1"
                      onClick={() => {
                        toast({ title: "Archive", description: "Archive feature coming soon" });
                      }}
                    >
                      <Archive className="h-3 w-3" />
                      Archive
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
        ))}
      </div>

      {showAnalysisModal && selectedMeetingId && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Tasks Analysis</h2>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {(() => {
                const meetingTasks = allTasks.filter((t: any) => t.meeting_id === selectedMeetingId);
                const departments = [...new Set(meetingTasks.map((t: any) => t.department_name))];
                
                return (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</p>
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{meetingTasks.length}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Departments</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{departments.length}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Assigned</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{meetingTasks.filter((t: any) => t.assigned_user_id).length}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {meetingTasks.length > 0 && (
                      <>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Tasks by Department</h3>
                          <Chart
                            type="bar"
                            series={[
                              {
                                name: "Tasks",
                                data: departments.map((dept: any) => meetingTasks.filter((t: any) => t.department_name === dept).length),
                              },
                            ]}
                            options={{
                              chart: { type: "bar", toolbar: { show: false } },
                              xaxis: { categories: departments },
                              colors: ["#3b82f6"],
                            }}
                            height={300}
                          />
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Assignment Status</h3>
                          <Chart
                            type="donut"
                            series={[
                              meetingTasks.filter((t: any) => !t.assigned_user_id).length,
                              meetingTasks.filter((t: any) => t.assigned_user_id).length,
                            ]}
                            options={{
                              chart: { type: "donut" },
                              labels: ["Unassigned", "Assigned"],
                              colors: ["#f59e0b", "#10b981"],
                            }}
                            height={300}
                          />
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </motion.div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 pb-6">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline"
            className="gap-1"
          >
            ← Previous
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            className="gap-1"
          >
            Next →
          </Button>
        </div>
      )}

      {/* Page info */}
      {filteredMeetings.length > 0 && (
        <div className="text-center text-sm text-slate-600 dark:text-slate-400 pb-4">
          Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredMeetings.length)} of {filteredMeetings.length} meetings
        </div>
      )}

      {filteredMeetings.length === 0 && (
        <Card className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-400">
            {statusFilter === "all" ? "No weekly meetings yet" : "No meetings found matching your filter"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {statusFilter === "all" ? "Create one to get started" : "Try adjusting your filter"}
          </p>
        </Card>
      )}

      </div>
    </div>
  );
}
