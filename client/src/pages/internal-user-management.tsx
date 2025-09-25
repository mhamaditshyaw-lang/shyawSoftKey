import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Users,
  Edit,
  Trash2,
  Plus,
  Shield,
  Settings,
  UserCheck,
  Key,
  UserCog,
  Eye,
  Search,
  Filter
} from "lucide-react";
import type { User } from "@shared/schema";

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
  canViewDashboard?: boolean;
  canViewUserManagement?: boolean;
  canViewAllData?: boolean;
  canViewAddEmployee?: boolean;
  canViewSettings?: boolean;
  canViewReminders?: boolean;
  canViewFeedback?: boolean;
  canViewArchive?: boolean;
  canViewNavigation?: boolean;
  canViewSidebar?: boolean;
  canViewHeader?: boolean;
  canAccessAdminTools?: boolean;
  // All page access permissions
  canAccessModernDashboard?: boolean;
  canAccessInterviews?: boolean;
  canAccessTodos?: boolean;
  canAccessReminders?: boolean;
  canAccessUsersPage?: boolean;
  canAccessEmployeeManagement?: boolean;
  canAccessAddEmployee?: boolean;
  canAccessFeedback?: boolean;
  canAccessArchive?: boolean;
  canAccessMetrics?: boolean;
  canAccessMultilingualDemo?: boolean;
  canAccessDataView?: boolean;
  canAccessAllData?: boolean;
  canAccessUserActivity?: boolean;
  canAccessReports?: boolean;
  canAccessNotificationTest?: boolean;
  canAccessNotificationManagement?: boolean;
  canAccessInternalUserManagement?: boolean;
  canAccessUserSettings?: boolean;
}

const roleColors = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  security: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  office: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  office_team: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  secretary: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export default function InternalUserManagementPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "security",
    department: "",
    position: "",
  });

  // Fetch users
  const { data: usersData, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/users"],
    enabled: currentUser?.role === "admin" || currentUser?.role === "manager",
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: (userData: any) => apiRequest("/api/users", "POST", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Success", description: "User added successfully" });
      setIsAddUserDialogOpen(false);
      setNewUserData({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "security",
        department: "",
        position: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...userData }: any) =>
      apiRequest(`/api/users/${id}`, "PATCH", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Success", description: "User updated successfully" });
      setIsPermissionsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => apiRequest(`/api/users/${userId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  if (currentUser?.role !== "admin" && currentUser?.role !== "manager") {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-center min-h-[400px] p-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-red-200 dark:border-red-700 p-8 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Access Restricted
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                  You don't have permission to access internal user management. Please contact your administrator.
                </p>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    Required Role: Admin or Manager
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const users = usersData?.users || [];
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUserMutation.mutate(newUserData);
  };

  const handleUpdatePermissions = (permissions: UserPermissions) => {
    if (!selectedUser) {
      console.error("No selected user");
      return;
    }
    if (!selectedUser.id) {
      console.error("Selected user has no ID:", selectedUser);
      toast({
        title: "Error",
        description: "User ID is missing. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }
    console.log("Updating permissions for user:", selectedUser.id, permissions);
    updateUserMutation.mutate({
      id: selectedUser.id,
      permissions,
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10" />
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                        Internal User Management
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Advanced user accounts, roles, and permissions management
                      </p>
                    </div>
                  </div>
                </div>

                {currentUser?.role === "admin" && (
                  <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6"
                        data-testid="button-add-internal-user"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Internal User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddUser}>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={newUserData.firstName}
                                onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={newUserData.lastName}
                                onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={newUserData.username}
                              onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUserData.email}
                              onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={newUserData.password}
                              onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Select
                              value={newUserData.role}
                              onValueChange={(value) => setNewUserData({...newUserData, role: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="security">Security</SelectItem>
                                <SelectItem value="office">Office</SelectItem>
                                <SelectItem value="office_team">Office Team</SelectItem>
                                <SelectItem value="secretary">Secretary</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="department">Department</Label>
                              <Input
                                id="department"
                                value={newUserData.department}
                                onChange={(e) => setNewUserData({...newUserData, department: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="position">Position</Label>
                              <Input
                                id="position"
                                value={newUserData.position}
                                onChange={(e) => setNewUserData({...newUserData, position: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="mt-6">
                          <Button type="submit" disabled={addUserMutation.isPending}>
                            {addUserMutation.isPending ? "Adding..." : "Add User"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="office_team">Office Team</SelectItem>
                    <SelectItem value="secretary">Secretary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[user.status as keyof typeof statusColors]}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.department || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log("Setting selected user:", user);
                                setSelectedUser(user);
                                setIsPermissionsDialogOpen(true);
                              }}
                              title="Manage Permissions"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            {currentUser?.role === "admin" && user.id !== currentUser.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Permissions Dialog */}
          <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Manage Permissions</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                {selectedUser && (
                  <PermissionsForm
                    user={selectedUser}
                    onSave={handleUpdatePermissions}
                    isLoading={updateUserMutation.isPending}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
}

function PermissionsForm({
  user,
  onSave,
  isLoading
}: {
  user: User;
  onSave: (permissions: UserPermissions) => void;
  isLoading: boolean;
}) {
  const [permissions, setPermissions] = useState<UserPermissions>(
    (user.permissions as UserPermissions) || {}
  );

  const handlePermissionChange = (key: keyof UserPermissions, value: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(permissions);
  };

  const pagePermissions = [
    { key: "canAccessModernDashboard", label: "Access Modern Dashboard" },
    { key: "canAccessInterviews", label: "Access Interviews Page" },
    { key: "canAccessTodos", label: "Access Todos Page" },
    { key: "canAccessReminders", label: "Access Reminders Page" },
    { key: "canAccessUsersPage", label: "Access Users Page" },
    { key: "canViewUserManagement", label: "Access User Management Page" },
    { key: "canAccessEmployeeManagement", label: "Access Employee Management Page" },
    { key: "canAccessAddEmployee", label: "Access Add Employee Page" },
    { key: "canAccessFeedback", label: "Access Feedback Page" },
    { key: "canAccessArchive", label: "Access Archive Page" },
    { key: "canAccessMetrics", label: "Access Metrics Page" },
    { key: "canAccessMultilingualDemo", label: "Access Multilingual Demo Page" },
    { key: "canAccessDataView", label: "Access Data View Page" },
    { key: "canAccessAllData", label: "Access All Data Dashboard" },
    { key: "canAccessUserActivity", label: "Access User Activity Page" },
    { key: "canAccessReports", label: "Access Reports Page" },
    { key: "canAccessNotificationTest", label: "Access Notification Test Page" },
    { key: "canAccessNotificationManagement", label: "Access Notification Management Page" },
    { key: "canAccessInternalUserManagement", label: "Access Internal User Management Page" },
    { key: "canAccessUserSettings", label: "Access User Settings Page" },
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
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="h-5 w-5" />
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-600">@{user.username} • {user.role}</p>
          </div>
        </div>

        <Tabs defaultValue="pages">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pages">Page Access</TabsTrigger>
            <TabsTrigger value="data">Data Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700 mb-3">Page Access Permissions</h4>
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
              {pagePermissions.map((perm) => (
                <div key={perm.key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <Label htmlFor={perm.key} className="cursor-pointer text-sm">{perm.label}</Label>
                  <Switch
                    id={perm.key}
                    checked={permissions[perm.key as keyof UserPermissions] || false}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(perm.key as keyof UserPermissions, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700 mb-3">Data Access Permissions</h4>
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
              {dataPermissions.map((perm) => (
                <div key={perm.key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <Label htmlFor={perm.key} className="cursor-pointer text-sm">{perm.label}</Label>
                  <Switch
                    id={perm.key}
                    checked={permissions[perm.key as keyof UserPermissions] || false}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(perm.key as keyof UserPermissions, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Permissions"}
        </Button>
      </DialogFooter>
    </form>
  );
}