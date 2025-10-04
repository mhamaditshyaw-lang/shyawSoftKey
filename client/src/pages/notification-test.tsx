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
import { useTranslation } from "react-i18next";

export default function NotificationTestPage() {
  const { t } = useTranslation();
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
    { value: "system_alert", label: t("systemAlertType"), icon: "⚠️" },
    { value: "task_reminder", label: t("taskReminderType"), icon: "📋" },
    { value: "user_activity", label: t("userActivityType"), icon: "👤" },
    { value: "security_alert", label: t("securityAlertType"), icon: "🔒" },
    { value: "maintenance_notice", label: t("maintenanceNoticeType"), icon: "🔧" },
    { value: "deadline_warning", label: t("deadlineWarningType"), icon: "⏰" },
    { value: "achievement", label: t("achievementType"), icon: "🏆" },
    { value: "general", label: t("generalType"), icon: "🔔" }
  ];

  const priorities = [
    { value: "low", label: t("lowPriority"), color: "bg-gray-100 text-gray-800" },
    { value: "normal", label: t("normalPriority"), color: "bg-blue-100 text-blue-800" },
    { value: "high", label: t("highPriority"), color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: t("urgentPriority"), color: "bg-red-100 text-red-800" }
  ];

  const handleQuickTest = (type: string, title: string, message: string, priority: string = "normal") => {
    if (!isGranted) {
      toast({
        title: t("permissionRequiredTitle"),
        description: t("pleaseEnableDeviceNotifications"),
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
      title: t("testSent"),
      description: `${title} ${t("notificationSentToDevice")}`,
    });
  };

  const handleCustomNotification = async () => {
    if (!customNotification.title || !customNotification.message) {
      toast({
        title: t("missingInformationTitle"),
        description: t("pleaseFillTitleAndMessage"),
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
          title: t("customNotificationTitle"),
          description: t("customNotificationSent"),
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
        title: t("error"),
        description: t("failedToSendCustomNotification"),
        variant: "destructive",
      });
    }
  };

  const handleSystemAlert = async () => {
    try {
      const response = await authenticatedRequest("/api/device-notifications/system-alert", {
        method: "POST",
        body: JSON.stringify({
          title: t("systemAlertTestTitle"),
          message: t("systemWideAlertMessage"),
          priority: "high"
        }),
      });

      if (response.ok) {
        toast({
          title: t("customNotificationTitle"),
          description: t("systemAlertSent"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failedToSendSystemAlert"),
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("deviceNotificationTestCenter")}</h1>
            <p className="text-muted-foreground">
              {t("testAndVerifyNotifications")}
            </p>
          </div>
        </div>

        {/* Permission Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              {t("notificationPermissionStatus")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Label>{t("browserSupport")}:</Label>
                <Badge variant={isSupported ? "default" : "destructive"}>
                  {isSupported ? t("supported") : t("notSupported")}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Label>{t("permission")}:</Label>
                <Badge variant={
                  permission.permission === 'granted' ? 'default' : 
                  permission.permission === 'denied' ? 'destructive' : 'secondary'
                }>
                  {permission.permission === 'granted' ? t("enabled") : 
                   permission.permission === 'denied' ? t("blocked") : t("notSet")}
                </Badge>
              </div>
              <div>
                {!isGranted && isSupported && (
                  <Button onClick={requestPermission}>
                    <Bell className="w-4 h-4 mr-2" />
                    {t("requestPermission")}
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
              {t("quickTestNotifications")}
            </CardTitle>
            <CardDescription>
              {t("sendPredefinedTestNotifications")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleQuickTest("system_alert", t("systemAlertType"), t("thisIsTestSystemAlert"), "high")}
                disabled={!isGranted}
                className="justify-start h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  <div className="text-left">
                    <div className="font-medium">{t("systemAlertTest")}</div>
                    <div className="text-sm text-muted-foreground">{t("highPrioritySystemNotification")}</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleQuickTest("task_reminder", t("taskReminderType"), t("dontForgetCompleteTask"), "normal")}
                disabled={!isGranted}
                className="justify-start h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">{t("taskReminderTest")}</div>
                    <div className="text-sm text-muted-foreground">{t("normalPriorityTaskNotification")}</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleQuickTest("deadline_warning", t("deadlineWarningType"), t("deadlineApproachingInDays"), "urgent")}
                disabled={!isGranted}
                className="justify-start h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-red-500" />
                  <div className="text-left">
                    <div className="font-medium">{t("deadlineWarningTest")}</div>
                    <div className="text-sm text-muted-foreground">{t("urgentPriorityDeadlineNotification")}</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleQuickTest("achievement", t("achievementType"), t("congratulationsCompletedTasks"), "low")}
                disabled={!isGranted}
                className="justify-start h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="w-6 h-6 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">{t("achievementTest")}</div>
                    <div className="text-sm text-muted-foreground">{t("lowPriorityAchievementNotification")}</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Notification Builder */}
        <Card>
          <CardHeader>
            <CardTitle>{t("customNotificationBuilder")}</CardTitle>
            <CardDescription>
              {t("createCustomNotifications")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("title")}</Label>
                <Input
                  id="title"
                  value={customNotification.title}
                  onChange={(e) => setCustomNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t("enterNotificationTitle")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">{t("iconEmoji")}</Label>
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
              <Label htmlFor="message">{t("message")}</Label>
              <Textarea
                id="message"
                value={customNotification.message}
                onChange={(e) => setCustomNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder={t("enterNotificationMessage")}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("type")}</Label>
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
                <Label>{t("priority")}</Label>
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
                {t("sendCustomNotification")}
              </Button>
              
              <Button onClick={createTestNotification} disabled={!isGranted} variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                {t("sendDefaultTest")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2" />
              {t("systemAlertAdminOnly")}
            </CardTitle>
            <CardDescription>
              {t("sendSystemWideAlerts")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSystemAlert} variant="destructive">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t("sendSystemAlertToAllUsers")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
