import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Plus, Archive, Eye, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function WeeklyMeetingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["/api/weekly-meetings"],
  });

  const createMeetingMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const weekNumber = Math.ceil((now.getDate() - now.getDay()) / 7);
      
      return apiRequest("/api/weekly-meetings", {
        method: "POST",
        body: JSON.stringify({
          weekNumber,
          year: now.getFullYear(),
          meetingDate: now.toISOString(),
        }),
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map((meeting: any) => (
          <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    Week {meeting.weekNumber}
                  </CardTitle>
                  <CardDescription>{meeting.year}</CardDescription>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  meeting.status === "completed" ? "bg-green-100 text-green-800" :
                  meeting.status === "archived" ? "bg-gray-100 text-gray-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {meeting.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(meeting.meetingDate).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Link href={`/weekly-meetings/${meeting.id}`} asChild>
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                </Link>
                {meeting.status === "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      toast({ title: "Archive", description: "Archive feature coming soon" });
                    }}
                  >
                    <Archive className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meetings.length === 0 && (
        <Card className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-400">No weekly meetings yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create one to get started</p>
        </Card>
      )}
    </div>
  );
}
