import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Bell, Send, TestTube } from "lucide-react";

export default function NotificationTest() {
  const { user, authenticatedRequest } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [testData, setTestData] = useState({
    title: "",
    message: "",
    type: "system",
    priority: "medium"
  });

  const sendTestNotification = useMutation({
    mutationFn: async (data: any) => {
      const response = await authenticatedRequest("POST", "/api/test-notification", data);
      if (!response.ok) {
        throw new Error("Failed to send test notification");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test notification sent successfully",
      });
      setTestData({
        title: "",
        message: "",
        type: "system",
        priority: "medium"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test notification",
        variant: "destructive",
      });
    },
  });

  const sendQuickTests = [
    {
      title: "Welcome Message",
      message: "Welcome to the Employee Affairs Management System!",
      type: "system",
      priority: "low"
    },
    {
      title: "Task Reminder",
      message: "You have pending tasks that require your attention.",
      type: "task",
      priority: "medium"
    },
    {
      title: "Meeting Alert",
      message: "You have a meeting scheduled in 30 minutes.",
      type: "meeting",
      priority: "high"
    },
    {
      title: "System Update",
      message: "System maintenance will begin in 15 minutes.",
      type: "system",
      priority: "urgent"
    }
  ];

  const handleQuickTest = (testNotification: any) => {
    sendTestNotification.mutate(testNotification);
  };

  const handleCustomTest = () => {
    if (!testData.title || !testData.message) {
      toast({
        title: "Error",
        description: "Please fill in both title and message fields",
        variant: "destructive",
      });
      return;
    }
    sendTestNotification.mutate(testData);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TestTube className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('Notification Test Center')}
        </h1>
      </div>

      {/* Quick Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Quick Test Notifications
          </CardTitle>
          <CardDescription>
            Send predefined test notifications to verify the system is working properly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sendQuickTests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{test.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    test.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    test.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    test.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {test.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{test.message}</p>
                <Button 
                  onClick={() => handleQuickTest(test)}
                  disabled={sendTestNotification.isPending}
                  size="sm"
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Test Form */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Test Notification</CardTitle>
          <CardDescription>
            Create and send a custom notification with your own content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={testData.title}
                onChange={(e) => setTestData({...testData, title: e.target.value})}
                placeholder="Enter notification title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={testData.type} onValueChange={(value) => setTestData({...testData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={testData.priority} onValueChange={(value) => setTestData({...testData, priority: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={testData.message}
              onChange={(e) => setTestData({...testData, message: e.target.value})}
              placeholder="Enter notification message"
              rows={4}
            />
          </div>

          <Button 
            onClick={handleCustomTest}
            disabled={sendTestNotification.isPending}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {sendTestNotification.isPending ? "Sending..." : "Send Custom Test"}
          </Button>
        </CardContent>
      </Card>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Current User:</strong> {user?.username} ({user?.role})</p>
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>Status:</strong> All test notifications will be sent to your account</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}