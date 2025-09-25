
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="space-y-8 p-6 max-w-6xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        User Settings
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Customize your permissions and page access settings
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleSavePermissions} 
                  disabled={updatePermissionsMutation.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6"
                  data-testid="button-save-settings"
                >
                  {updatePermissionsMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced User Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    User Information
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</Label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</Label>
                    <p className="text-lg font-mono bg-white dark:bg-gray-600 px-3 py-2 rounded-xl mt-1 border">@{user.username}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-700">
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role & Access</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="text-lg font-semibold capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</Label>
                    <p className="text-lg text-gray-900 dark:text-white mt-1">
                      {user.department || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Permissions Settings */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Permission Settings
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <Tabs defaultValue="pages" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl">
                      <TabsTrigger value="pages" className="rounded-2xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-md transition-all duration-200">
                        <span className="flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span>Page Access</span>
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="data" className="rounded-2xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-md transition-all duration-200">
                        <span className="flex items-center space-x-2">
                          <Database className="w-4 h-4" />
                          <span>Data Rights</span>
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="components" className="rounded-2xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-md transition-all duration-200">
                        <span className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>UI Access</span>
                        </span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pages" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <Eye className="w-5 h-5 text-blue-600" />
                          <span>Page Visibility Permissions</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pagePermissions.map((permission) => (
                            <div 
                              key={permission.key} 
                              className="group p-4 border border-gray-200 dark:border-gray-600 rounded-2xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-md bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10"
                              data-testid={`permission-${permission.key}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    {permission.icon}
                                  </div>
                                  <Label 
                                    htmlFor={permission.key} 
                                    className="cursor-pointer font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                  >
                                    {permission.label}
                                  </Label>
                                </div>
                                <Switch
                                  id={permission.key}
                                  checked={permissions[permission.key as keyof UserPermissions] || false}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(permission.key as keyof UserPermissions, checked)
                                  }
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="data" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <Database className="w-5 h-5 text-green-600" />
                          <span>Data Access Permissions</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dataPermissions.map((permission) => (
                            <div 
                              key={permission.key} 
                              className="group p-4 border border-gray-200 dark:border-gray-600 rounded-2xl hover:border-green-300 dark:hover:border-green-500 transition-all duration-200 hover:shadow-md bg-gradient-to-r from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10"
                              data-testid={`data-permission-${permission.key}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <Database className="w-4 h-4 text-green-600" />
                                  </div>
                                  <Label 
                                    htmlFor={permission.key} 
                                    className="cursor-pointer font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
                                  >
                                    {permission.label}
                                  </Label>
                                </div>
                                <Switch
                                  id={permission.key}
                                  checked={permissions[permission.key as keyof UserPermissions] || false}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(permission.key as keyof UserPermissions, checked)
                                  }
                                  className="data-[state=checked]:bg-green-600"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="components" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-purple-600" />
                          <span>UI Component Permissions</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {componentPermissions.map((permission) => (
                            <div 
                              key={permission.key} 
                              className="group p-4 border border-gray-200 dark:border-gray-600 rounded-2xl hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200 hover:shadow-md bg-gradient-to-r from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10"
                              data-testid={`component-permission-${permission.key}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <Shield className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <Label 
                                    htmlFor={permission.key} 
                                    className="cursor-pointer font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                                  >
                                    {permission.label}
                                  </Label>
                                </div>
                                <Switch
                                  id={permission.key}
                                  checked={permissions[permission.key as keyof UserPermissions] || false}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(permission.key as keyof UserPermissions, checked)
                                  }
                                  className="data-[state=checked]:bg-purple-600"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
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
