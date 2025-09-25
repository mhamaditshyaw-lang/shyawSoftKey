
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Settings, User, Eye, Shield, Database, FileText, Users, Calendar, MessageSquare } from "lucide-react";

interface UserPermissions {
  canViewUsers?: boolean;
  canEditUsers?: boolean;
  canDeleteUsers?: boolean;
  canViewTodos?: boolean;
  canEditTodos?: boolean;
  canViewInterviews?: boolean;
  canEditInterviews?: boolean;
  canViewReports?: boolean;
  canManageNotifications?: boolean;
  // Page visibility permissions
  canViewDashboard?: boolean;
  canViewUserManagement?: boolean;
  canViewAllData?: boolean;
  canViewAddEmployee?: boolean;
  canViewSettings?: boolean;
  canViewReminders?: boolean;
  canViewFeedback?: boolean;
  canViewArchive?: boolean;
  // Component visibility permissions
  canViewNavigation?: boolean;
  canViewSidebar?: boolean;
  canViewHeader?: boolean;
  canAccessAdminTools?: boolean;
}

export default function UserSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [permissions, setPermissions] = useState<UserPermissions>(
    (user?.permissions as UserPermissions) || {}
  );

  // Update user permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: (newPermissions: UserPermissions) =>
      apiRequest(`/api/users/${user?.id}`, "PATCH", { permissions: newPermissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Success", description: "Permissions updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      });
    },
  });

  const handlePermissionChange = (key: keyof UserPermissions, value: boolean) => {
    const newPermissions = { ...permissions, [key]: value };
    setPermissions(newPermissions);
  };

  const handleSavePermissions = () => {
    updatePermissionsMutation.mutate(permissions);
  };

  const pagePermissions = [
    { key: "canViewDashboard", label: "Dashboard", icon: <Database className="w-4 h-4" /> },
    { key: "canViewUserManagement", label: "User Management", icon: <Users className="w-4 h-4" /> },
    { key: "canViewAllData", label: "All Data", icon: <FileText className="w-4 h-4" /> },
    { key: "canViewAddEmployee", label: "Add Employee", icon: <User className="w-4 h-4" /> },
    { key: "canViewReminders", label: "Reminders", icon: <Calendar className="w-4 h-4" /> },
    { key: "canViewFeedback", label: "Feedback", icon: <MessageSquare className="w-4 h-4" /> },
    { key: "canViewArchive", label: "Archive", icon: <FileText className="w-4 h-4" /> },
    { key: "canViewSettings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const dataPermissions = [
    { key: "canViewUsers", label: "View Users" },
    { key: "canEditUsers", label: "Edit Users" },
    { key: "canDeleteUsers", label: "Delete Users" },
    { key: "canViewTodos", label: "View Todo Lists" },
    { key: "canEditTodos", label: "Edit Todo Lists" },
    { key: "canViewInterviews", label: "View Interviews" },
    { key: "canEditInterviews", label: "Edit Interviews" },
    { key: "canViewReports", label: "View Reports" },
    { key: "canManageNotifications", label: "Manage Notifications" },
  ];

  const componentPermissions = [
    { key: "canViewNavigation", label: "Show Navigation Menu" },
    { key: "canViewSidebar", label: "Show Sidebar" },
    { key: "canViewHeader", label: "Show Header Components" },
    { key: "canAccessAdminTools", label: "Access Admin Tools" },
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Settings</h1>
            <p className="text-gray-600">Manage your permissions and page access settings</p>
          </div>
          <Button onClick={handleSavePermissions} disabled={updatePermissionsMutation.isPending}>
            {updatePermissionsMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Name</Label>
                <p className="text-lg">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Username</Label>
                <p className="text-lg">@{user.username}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Role</Label>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="capitalize">{user.role}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Department</Label>
                <p>{user.department || "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Settings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Permission Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pages" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pages">Page Access</TabsTrigger>
                    <TabsTrigger value="data">Data Permissions</TabsTrigger>
                    <TabsTrigger value="components">UI Components</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pages" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Page Visibility Permissions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pagePermissions.map((permission) => (
                          <div key={permission.key} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {permission.icon}
                              <Label htmlFor={permission.key} className="cursor-pointer">
                                {permission.label}
                              </Label>
                            </div>
                            <Switch
                              id={permission.key}
                              checked={permissions[permission.key as keyof UserPermissions] || false}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission.key as keyof UserPermissions, checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="data" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Data Access Permissions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dataPermissions.map((permission) => (
                          <div key={permission.key} className="flex items-center justify-between p-3 border rounded-lg">
                            <Label htmlFor={permission.key} className="cursor-pointer">
                              {permission.label}
                            </Label>
                            <Switch
                              id={permission.key}
                              checked={permissions[permission.key as keyof UserPermissions] || false}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission.key as keyof UserPermissions, checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="components" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">UI Component Permissions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {componentPermissions.map((permission) => (
                          <div key={permission.key} className="flex items-center justify-between p-3 border rounded-lg">
                            <Label htmlFor={permission.key} className="cursor-pointer">
                              {permission.label}
                            </Label>
                            <Switch
                              id={permission.key}
                              checked={permissions[permission.key as keyof UserPermissions] || false}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission.key as keyof UserPermissions, checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
