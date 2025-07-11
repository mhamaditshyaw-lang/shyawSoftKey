import { useState } from "react";
import { Smartphone, TestTube, AlertTriangle, Bell, CheckCircle, Clock, ShieldAlert, Settings, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDeviceNotifications } from "@/hooks/use-device-notifications";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function NotificationTestPage() {
  const { toast } = useToast();
  const { 
    permission, 
    requestPermission, 
    sendDeviceNotification, 
    createTestNotification,
    isSupported,
    isGranted 
  } = useDeviceNotifications();

  const [customNotification, setCustomNotification] = useState({
    title: "",
    message: "",
    type: "general",
    priority: "normal",
    icon: "🔔"
  });

  const notificationTypes = [
    { value: "system_alert", label: "System Alert", icon: "⚠️" },
    { value: "task_reminder", label: "Task Reminder", icon: "📋" },
    { value: "user_activity", label: "User Activity", icon: "👤" },
    { value: "security_alert", label: "Security Alert", icon: "🔒" },
    { value: "maintenance_notice", label: "Maintenance Notice", icon: "🔧" },
    { value: "deadline_warning", label: "Deadline Warning", icon: "⏰" },
    { value: "achievement", label: "Achievement", icon: "🏆" },
    { value: "general", label: "General", icon: "🔔" }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" }
  ];

  const handleQuickTest = (type: string, title: string, message: string, priority: string = "normal") => {
    if (!isGranted) {
      toast({
        title: "Permission Required",
        description: "Please enable device notifications first.",
        variant: "destructive",
      });
      return;
    }

    sendDeviceNotification(title, {
      body: message,
      icon: notificationTypes.find(t => t.value === type)?.icon || "🔔",
      tag: `test-${type}-${Date.now()}`,
    });

    toast({
      title: "Test Sent",
      description: `${title} notification sent to your device.`,
    });
  };

  const handleCustomNotification = async () => {
    if (!customNotification.title || !customNotification.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and message.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await authenticatedRequest("/api/device-notifications/test", {
        method: "POST",
        body: JSON.stringify({
          title: customNotification.title,
          message: customNotification.message,
          type: customNotification.type,
          priority: customNotification.priority,
          icon: customNotification.icon,
        }),
      });

      if (response.ok) {
        toast({
          title: "Custom Notification Sent",
          description: "Your custom notification has been created and sent.",
        });
        
        // Reset form
        setCustomNotification({
          title: "",
          message: "",
          type: "general",
          priority: "normal",
          icon: "🔔"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send custom notification.",
        variant: "destructive",
      });
    }
  };

  const handleSystemAlert = async () => {
    try {
      const response = await authenticatedRequest("/api/device-notifications/system-alert", {
        method: "POST",
        body: JSON.stringify({
          title: "System Alert Test",
          message: "This is a system-wide alert notification sent to all users.",
          priority: "high"
        }),
      });

      if (response.ok) {
        toast({
          title: "System Alert Sent",
          description: "System alert has been sent to all users.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send system alert. Admin access may be required.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Device Notification Test Center</h1>
            <p className="text-muted-foreground">
              Test and verify the device notification system functionality
            </p>
          </div>
        </div>

        {/* Permission Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Notification Permission Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Label>Browser Support:</Label>
                <Badge variant={isSupported ? "default" : "destructive"}>
                  {isSupported ? "Supported" : "Not Supported"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Label>Permission:</Label>
                <Badge variant={
                  permission.permission === 'granted' ? 'default' : 
                  permission.permission === 'denied' ? 'destructive' : 'secondary'
                }>
                  {permission.permission === 'granted' ? 'Enabled' : 
                   permission.permission === 'denied' ? 'Blocked' : 'Not Set'}
                </Badge>
              </div>
              <div>
                {!isGranted && isSupported && (
                  <Button onClick={requestPermission}>
                    <Bell className="w-4 h-4 mr-2" />
                    Request Permission
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Test Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TestTube className="w-5 h-5 mr-2" />
              Quick Test Notifications
            </CardTitle>
            <CardDescription>
              Send predefined test notifications to verify different types and priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleQuickTest("system_alert", "System Alert", "This is a test system alert notification", "high")}
                disabled={!isGranted}
                className="justify-start h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  <div className="text-left">
                    <div className="font-medium">System Alert Test</div>
                    <div className="text-sm text-muted-foreground">High priority system notification</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleQuickTest("task_reminder", "Task Reminder", "Don't forget to complete your daily tasks", "normal")}
                disabled={!isGranted}
                className="justify-start h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Task Reminder Test</div>
                    <div className="text-sm text-muted-foreground">Normal priority task notification</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleQuickTest("deadline_warning", "Deadline Warning", "Project deadline is approaching in 2 days", "urgent")}
                disabled={!isGranted}
                className="justify-start h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-red-500" />
                  <div className="text-left">
                    <div className="font-medium">Deadline Warning Test</div>
                    <div className="text-sm text-muted-foreground">Urgent priority deadline notification</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleQuickTest("achievement", "Achievement Unlocked", "Congratulations! You've completed all your tasks this week", "low")}
                disabled={!isGranted}
                className="justify-start h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="w-6 h-6 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Achievement Test</div>
                    <div className="text-sm text-muted-foreground">Low priority achievement notification</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Notification Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Notification Builder</CardTitle>
            <CardDescription>
              Create and send custom notifications with specific content and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={customNotification.title}
                  onChange={(e) => setCustomNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Icon/Emoji</Label>
                <Input
                  id="icon"
                  value={customNotification.icon}
                  onChange={(e) => setCustomNotification(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🔔"
                  className="w-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={customNotification.message}
                onChange={(e) => setCustomNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter notification message"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={customNotification.type}
                  onValueChange={(value) => setCustomNotification(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={customNotification.priority}
                  onValueChange={(value) => setCustomNotification(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <Badge className={priority.color} variant="secondary">
                          {priority.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button onClick={handleCustomNotification} disabled={!isGranted}>
                <TestTube className="w-4 h-4 mr-2" />
                Send Custom Notification
              </Button>
              
              <Button onClick={createTestNotification} disabled={!isGranted} variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Send Default Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2" />
              System Alert (Admin Only)
            </CardTitle>
            <CardDescription>
              Send system-wide alerts to all users (requires admin permissions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSystemAlert} variant="destructive">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Send System Alert to All Users
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}