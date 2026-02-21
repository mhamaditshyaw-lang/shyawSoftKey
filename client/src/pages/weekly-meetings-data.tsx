import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Loader2, Filter, Download, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: number;
  weeklyMeetingId: number;
  title: string;
  description: string;
  departmentName: string;
  assignedUserId?: number;
}

export default function WeeklyMeetingsDataPage() {
  const { toast } = useToast();
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: meetings = [] as any[], isLoading: meetingsLoading } = useQuery({
    queryKey: ["/api/weekly-meetings"],
  });

  const { data: tasks = [] as any[], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/weekly-meetings/all-tasks"],
  });

  const { data: usersData = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const users = Array.isArray(usersData) ? usersData : (usersData as any)?.users || [];
  const isLoading = meetingsLoading || tasksLoading || usersLoading;

  // Get unique departments
  const departments = useMemo(() => {
    const tasksList = Array.isArray(tasks) ? tasks : (tasks as any) || [];
    const depts = new Set(tasksList.map((t: any) => t.departmentName));
    return Array.from(depts);
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const tasksList = Array.isArray(tasks) ? tasks : (tasks as any) || [];
    return tasksList.filter((task: any) => {
      const deptMatch = departmentFilter === "all" || task.departmentName === departmentFilter;
      const userMatch = userFilter === "all" || task.assignedUserId?.toString() === userFilter;
      const searchMatch = searchQuery === "" || task.title.toLowerCase().includes(searchQuery.toLowerCase());
      return deptMatch && userMatch && searchMatch;
    });
  }, [tasks, departmentFilter, userFilter, searchQuery]);

  // Chart data - Tasks by Department
  const tasksByDeptChart = {
    series: [
      {
        name: "Total Tasks",
        data: departments.map((dept: any) => {
          const tasksList = Array.isArray(tasks) ? tasks : (tasks as any) || [];
          return tasksList.filter((t: any) => t.departmentName === dept).length;
        }),
      },
      {
        name: "Assigned Tasks",
        data: departments.map((dept: any) => {
          const tasksList = Array.isArray(tasks) ? tasks : (tasks as any) || [];
          return tasksList.filter((t: any) => t.departmentName === dept && t.assignedUserId).length;
        }),
      },
    ],
    options: {
      chart: { type: "bar", toolbar: { show: true } },
      xaxis: { categories: departments },
      colors: ["#3b82f6", "#10b981"],
      plotOptions: { bar: { horizontal: false, columnWidth: "55%" } },
    },
  };

  // Chart data - Status distribution
  const statusDistribution = [
    (filteredTasks || []).filter((t: any) => !t.assignedUserId).length,
    (filteredTasks || []).filter((t: any) => t.assignedUserId).length,
  ];

  const statusChart = {
    series: statusDistribution,
    options: {
      chart: { type: "donut" },
      labels: ["Unassigned", "Assigned"],
      colors: ["#f59e0b", "#10b981"],
      plotOptions: { pie: { donut: { size: "60%" } } },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const downloadCSV = () => {
    const headers = ["Task ID", "Title", "Department", "Assigned User"];
    const rows = (filteredTasks || []).map((t: any) => [
      t.id,
      t.title,
      t.departmentName,
      t.assignedUserId ? ((users || []).find((u: any) => u.id === t.assignedUserId)?.firstName || "") : "Unassigned",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly-tasks-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({ title: "Success", description: "Data exported to CSV" });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/weekly-meetings" asChild>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meetings
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Weekly Tasks Data Analysis</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">View and analyze all task data with advanced filtering</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept as string} value={dept as string}>
                      {dept as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned User</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {(users || []).map((user: any) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={downloadCSV}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setDepartmentFilter("all");
                setUserFilter("all");
                setSearchQuery("");
              }}
              variant="ghost"
              size="sm"
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-400">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.p
              className="text-2xl font-bold text-blue-900 dark:text-blue-200"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {filteredTasks.length}
            </motion.p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 dark:text-green-400">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.p
              className="text-2xl font-bold text-green-900 dark:text-green-200"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {filteredTasks.filter((t: any) => t.assignedUserId).length}
            </motion.p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700 dark:text-amber-400">Unassigned</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.p
              className="text-2xl font-bold text-amber-900 dark:text-amber-200"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {filteredTasks.filter((t: any) => !t.assignedUserId).length}
            </motion.p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 dark:text-purple-400">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.p
              className="text-2xl font-bold text-purple-900 dark:text-purple-200"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {departments.length}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tasks by Department
              </CardTitle>
              <CardDescription>Total vs Assigned tasks per department</CardDescription>
            </CardHeader>
            <CardContent>
              {typeof Chart !== "undefined" && (
                <Chart
                  type="bar"
                  series={tasksByDeptChart.series}
                  options={tasksByDeptChart.options as any}
                  height={300}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Assignment Status</CardTitle>
              <CardDescription>Distribution of assigned vs unassigned tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {typeof Chart !== "undefined" && (
                <Chart
                  type="donut"
                  series={statusChart.series}
                  options={statusChart.options as any}
                  height={300}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tasks Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
            <CardDescription>Detailed view of all filtered tasks ({filteredTasks.length})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Task</th>
                    <th className="text-left py-2 px-4">Department</th>
                    <th className="text-left py-2 px-4">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {(filteredTasks || []).map((task: any) => (
                    <tr key={task.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="py-2 px-4 font-medium">{task.title}</td>
                      <td className="py-2 px-4 text-slate-600 dark:text-slate-400">{task.departmentName}</td>
                      <td className="py-2 px-4">
                        {task.assignedUserId ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                            {(users || []).find((u: any) => u.id === task.assignedUserId)?.firstName}
                          </span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
