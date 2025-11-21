import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  AlertCircle, 
  CheckCircle,
  Users,
  MessageSquare
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function BroadcastNotification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const broadcastMutation = useMutation({
    mutationFn: async (data: { title: string; message: string }) => {
      const response = await apiRequest('POST', '/api/broadcast-notification', data);
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: `Notification sent to all ${data.usersCount} users`,
        className: "bg-green-50 text-green-900 border-green-200"
      });
      setTitle("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/device-notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send broadcast notification",
        className: "bg-red-50 text-red-900 border-red-200"
      });
    },
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message",
        className: "bg-yellow-50 text-yellow-900 border-yellow-200"
      });
      return;
    }

    broadcastMutation.mutate({ title, message });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Send className="h-8 w-8 text-dashboard-primary" />
            <h1 className="text-3xl font-bold text-dashboard-text-light dark:text-dashboard-text-dark">
              Broadcast Notification
            </h1>
          </div>
          <p className="text-dashboard-secondary dark:text-dashboard-text-dark/60">
            Send messages to all users in the system
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Compose Section */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-dashboard-secondary/10 bg-white dark:bg-dashboard-bg-dark">
              <CardHeader>
                <CardTitle className="text-lg">Compose Message</CardTitle>
                <CardDescription>Create a notification to send to all system users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title Input */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Notification Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., System Maintenance Notice"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-dashboard-secondary/20 focus:border-dashboard-primary focus:ring-dashboard-primary/30"
                    data-testid="input-notification-title"
                  />
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold">
                    Message Content
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your notification message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="border-dashboard-secondary/20 focus:border-dashboard-primary focus:ring-dashboard-primary/30 resize-none"
                    data-testid="textarea-notification-message"
                  />
                  <p className="text-xs text-dashboard-secondary dark:text-dashboard-text-dark/50">
                    {message.length} characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setIsPreview(!isPreview)}
                    variant="outline"
                    className="border-dashboard-secondary/20 hover:bg-dashboard-secondary/5"
                    data-testid="button-preview"
                  >
                    {isPreview ? "Hide Preview" : "Preview"}
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={broadcastMutation.isPending || !title.trim() || !message.trim()}
                    className="flex-1 bg-dashboard-primary hover:bg-dashboard-primary/90 text-white gap-2"
                    data-testid="button-send-notification"
                  >
                    <Send className="h-4 w-4" />
                    {broadcastMutation.isPending ? "Sending..." : "Send to All Users"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info & Preview */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="border-dashboard-secondary/10 bg-white dark:bg-dashboard-bg-dark">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-dashboard-primary" />
                  Broadcasting Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 mt-0.5 text-dashboard-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-dashboard-text-light dark:text-dashboard-text-dark">
                      All Active Users
                    </p>
                    <p className="text-xs text-dashboard-secondary dark:text-dashboard-text-dark/60">
                      Message will reach every user in the system
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-dashboard-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium text-dashboard-text-light dark:text-dashboard-text-dark">
                      Real-time Delivery
                    </p>
                    <p className="text-xs text-dashboard-secondary dark:text-dashboard-text-dark/60">
                      Users see notifications instantly
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {isPreview && (title || message) && (
              <Card className="border-dashboard-primary/30 bg-dashboard-primary/5 dark:bg-dashboard-primary/10">
                <CardHeader>
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-lg bg-white dark:bg-dashboard-bg-dark border border-dashboard-primary/20">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-dashboard-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-dashboard-text-light dark:text-dashboard-text-dark break-words">
                          {title || "Notification Title"}
                        </h3>
                        <p className="text-sm text-dashboard-secondary dark:text-dashboard-text-dark/60 mt-1 break-words">
                          {message || "Your message will appear here"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Activity Notice */}
        <Card className="border-dashboard-secondary/10 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-400">
                Important: Broadcast notifications are critical communications
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300/80 mt-1">
                Only send messages that require immediate attention from all users. All notifications are logged in the system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
