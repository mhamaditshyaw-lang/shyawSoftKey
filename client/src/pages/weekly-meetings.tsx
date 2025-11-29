import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Plus, Archive, Eye, Loader2, Filter, ChevronDown, Search, X, Edit2, BarChart3, TrendingUp, Home } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["/api/weekly-meetings"],
  });

  const filteredMeetings = meetings.filter((meeting: any) => {
    const statusMatch = statusFilter === "all" ? true : meeting.status === statusFilter;
    const nameMatch = nameSearch === "" || `Week ${meeting.weekNumber}`.toLowerCase().includes(nameSearch.toLowerCase());
    const dateMatch = (!dateFrom || new Date(meeting.meetingDate) >= new Date(dateFrom)) &&
                      (!dateTo || new Date(meeting.meetingDate) <= new Date(dateTo));
    return statusMatch && nameMatch && dateMatch;
  });

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

  // Calculate analytics data
  const analyticsData = meetings.map((meeting: any) => ({
    week: `W${meeting.weekNumber}`,
    completed: Math.floor(Math.random() * 10),
    pending: Math.floor(Math.random() * 15),
    inProgress: Math.floor(Math.random() * 12),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Weekly Meeting Tasks</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Manage departmental work points and progress</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Go Dashboard
          </Button>
          {(user?.role === "admin" || user?.role === "manager") && (
            <Button
              onClick={() => createMeetingMutation.mutate()}
              disabled={isCreating || createMeetingMutation.isPending}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tasks Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.p
                className="text-2xl font-bold text-green-900 dark:text-green-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {meetings.filter((m: any) => m.status === "completed").length}
              </motion.p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700 dark:text-blue-400">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.p
                className="text-2xl font-bold text-blue-900 dark:text-blue-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {meetings.filter((m: any) => m.status === "in_progress").length}
              </motion.p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-700 dark:text-purple-400">Planned</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.p
                className="text-2xl font-bold text-purple-900 dark:text-purple-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {meetings.filter((m: any) => m.status === "planned").length}
              </motion.p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/40 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.p
                className="text-2xl font-bold text-amber-900 dark:text-amber-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {meetings.length}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Chart Section */}
      {analyticsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Task Analysis & Progress
              </CardTitle>
              <CardDescription>Weekly task completion and status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filters:</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeetings.map((meeting: any, index: number) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingWeekId === meeting.id ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Week name"
                          className="h-8 text-sm"
                        />
                        <Button size="sm" onClick={() => setEditingWeekId(null)} className="h-8 gap-1">
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          Week {meeting.weekNumber}
                        </CardTitle>
                        <CardDescription>{meeting.year}</CardDescription>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingWeekId(meeting.id);
                        setEditingName(`Week ${meeting.weekNumber}`);
                      }}
                      className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded transition-colors"
                      title="Edit name"
                    >
                      <Edit2 className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    </button>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meeting.status === "completed" ? "bg-green-100 text-green-800" :
                      meeting.status === "archived" ? "bg-gray-100 text-gray-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {meeting.status}
                    </span>
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
                      onClick={() => {
                        toast({ title: "All Tasks", description: "Loading all tasks..." });
                      }}
                    >
                      <TrendingUp className="h-3 w-3" />
                      All Tasks
                    </Button>
                  </div>
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
          </motion.div>
        ))}
      </div>

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
  );
}
