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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";
import {
  Users,
  Edit,
  Trash2,
  Plus,
  Shield,
  Eye,
  Settings,
  Phone,
  Mail,
  Building,
  UserCheck,
  Key,
  UserCog
} from "lucide-react";
import type { User } from "@shared/schema";

const roleColors = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  security: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  office: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  office_team: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
};

const formatRoleName = (role: string) => {
  switch (role) {
    case 'office_team':
      return 'Office Team';
    case 'admin':
      return 'Admin';
    case 'manager':
      return 'Manager';
    case 'security':
      return 'Security';
    case 'office':
      return 'Office';
    default:
      return role;
  }
};

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

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
  // Component visibility permissions
  canViewNavigation?: boolean;
  canViewSidebar?: boolean;
  canViewHeader?: boolean;
  canAccessAdminTools?: boolean;
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

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
      setIsEditDialogOpen(false);
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

  if (currentUser?.role !== "admin" && currentUser?.role !== "manager" && currentUser?.role !== "office") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <CardContent className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-600">
              You don't have permission to access user management.
            </p>
          </CardContent>
        </Card>
      </div>
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

  const handleAddUser = (formData: FormData) => {
    const userData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
      status: formData.get("status") as string,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    };
    addUserMutation.mutate(userData);
  };

  const handleUpdateUser = (formData: FormData) => {
    if (!selectedUser) return;

    const userData: any = {
      id: selectedUser.id,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      role: selectedUser.role, // Use the role from selectedUser state
      status: selectedUser.status, // Use the status from selectedUser state
      department: formData.get("department") as string,
      position: formData.get("position") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    };

    // Only include password if it's provided and current user is admin
    const password = formData.get("password") as string;
    if (password && password.trim() && currentUser?.role === "admin") {
      userData.password = password;
    }

    updateUserMutation.mutate(userData);
  };

  const handleUpdatePermissions = (permissions: UserPermissions) => {
    if (!selectedUser) return;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      User Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Manage users, roles, and permissions with advanced controls
                    </p>
                  </div>
                </div>
              </div>

              {currentUser?.role === "admin" && (
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6"
                      data-testid="button-add-user"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add New User
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Input
                  placeholder="Search users by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-2xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 transition-colors duration-200"
                  data-testid="input-search-users"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Eye className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="rounded-2xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3" data-testid="select-role-filter">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="office_team">Office Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Add User Dialog Content */}
        {currentUser?.role === "admin" && (
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddUser(new FormData(e.target as HTMLFormElement));
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" required />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select name="role" required>
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
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue="active">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" name="department" />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" name="position" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" name="phoneNumber" />
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

        {/* Enhanced Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Users</h2>
                  <p className="text-gray-600 dark:text-gray-300">Total: {filteredUsers.length} users</p>
                </div>
              </div>
              <Badge className="text-sm px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 rounded-full">
                {isLoading ? 'Loading...' : `${filteredUsers.length} Results`}
              </Badge>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse" />
                <span className="text-lg text-gray-600 dark:text-gray-300">Loading users...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-4">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4" />
                        <span>Name</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Username</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Role</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>Department</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Position</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-gray-200 dark:border-gray-600"
                      data-testid={`row-user-${user.id}`}
                    >
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                            @{user.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${roleColors[user.role as keyof typeof roleColors]} px-3 py-1 rounded-full font-medium shadow-sm`}>
                          {formatRoleName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-400' : user.status === 'inactive' ? 'bg-gray-400' : 'bg-yellow-400'}`} />
                          <Badge className={`${statusColors[user.status as keyof typeof statusColors]} px-3 py-1 rounded-full font-medium`}>
                            {user.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                          {user.department || "Not set"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {user.position || "Not set"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                            title="Edit User"
                            className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900 dark:hover:text-blue-300 rounded-xl transition-colors"
                            data-testid={`button-edit-${user.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {(currentUser?.role === "admin" || currentUser?.role === "manager") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsPasswordDialogOpen(true);
                              }}
                              title="Change Password"
                              className="hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900 dark:hover:text-orange-300 rounded-xl transition-colors"
                              data-testid={`button-password-${user.id}`}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          )}
                          {currentUser?.role === "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsRoleDialogOpen(true);
                              }}
                              title="Change Role"
                              className="hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900 dark:hover:text-purple-300 rounded-xl transition-colors"
                              data-testid={`button-role-${user.id}`}
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsPermissionsDialogOpen(true);
                            }}
                            title="Manage Permissions"
                            className="hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900 dark:hover:text-green-300 rounded-xl transition-colors"
                            data-testid={`button-permissions-${user.id}`}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          {currentUser?.role === "admin" && user.id !== currentUser.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete User"
                              className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300 rounded-xl transition-colors"
                              data-testid={`button-delete-${user.id}`}
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
            </div>
          )}
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditFormData({});
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const userData: any = {
                id: selectedUser.id,
                firstName: formData.get("firstName") as string,
                lastName: formData.get("lastName") as string,
                email: formData.get("email") as string,
                role: editFormData.role || selectedUser.role,
                status: editFormData.status || selectedUser.status,
                department: formData.get("department") as string,
                position: formData.get("position") as string,
                phoneNumber: formData.get("phoneNumber") as string,
              };

              // Only include password if it's provided and current user is admin
              const password = formData.get("password") as string;
              if (password && password.trim() && currentUser?.role === "admin") {
                userData.password = password;
              }

              updateUserMutation.mutate(userData);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={selectedUser.firstName}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={selectedUser.lastName}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedUser.email}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={editFormData.role || selectedUser.role}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value as User['role'] }))}
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
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editFormData.status || selectedUser.status}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as User['status'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      defaultValue={selectedUser.department || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      name="position"
                      defaultValue={selectedUser.position || ""}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    defaultValue={selectedUser.phoneNumber || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Set New Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Only enter a password if you want to change it
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <PermissionsForm
              user={selectedUser}
              onSave={handleUpdatePermissions}
              isLoading={updateUserMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      {selectedUser && (
        <ChangePasswordModal
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
          userId={selectedUser.id}
          username={selectedUser.username}
        />
      )}

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Change User Role
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const newRole = formData.get("role") as string;

              updateUserMutation.mutate({
                id: selectedUser.id,
                role: newRole,
              });
              setIsRoleDialogOpen(false);
            }}>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-sm text-gray-600">@{selectedUser.username}</p>
                    <p className="text-xs text-gray-500">Current role: <span className="font-medium">{formatRoleName(selectedUser.role)}</span></p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">New Role</Label>
                  <Select name="role" defaultValue={selectedUser.role} required>
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

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> Changing a user's role will update their access permissions.
                    Make sure this change is authorized.
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Change Role"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
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

  const permissionLabels = {
    canViewUsers: "View Users",
    canEditUsers: "Edit Users",
    canDeleteUsers: "Delete Users",
    canViewTodos: "View Todo Lists",
    canEditTodos: "Edit Todo Lists",
    canViewInterviews: "View Interviews",
    canEditInterviews: "Edit Interviews",
    canViewReports: "View Reports",
    canManageNotifications: "Manage Notifications",
    // Page visibility permissions
    canViewDashboard: "Access Dashboard Page",
    canViewUserManagement: "Access User Management Page",
    canViewAllData: "Access All Data Page",
    canViewAddEmployee: "Access Add Employee Page",
    canViewSettings: "Access Settings Page",
    // Component visibility permissions
    canViewNavigation: "Show Navigation Menu",
    canViewSidebar: "Show Sidebar",
    canViewHeader: "Show Header Components",
    canAccessAdminTools: "Access Admin Tools",
  };

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

        <div className="space-y-6">
          {/* Data Permissions */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Data Access Permissions</h4>
            <div className="space-y-3">
              {['canViewUsers', 'canEditUsers', 'canDeleteUsers', 'canViewTodos', 'canEditTodos', 'canViewInterviews', 'canEditInterviews', 'canViewReports', 'canManageNotifications'].map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key}>{permissionLabels[key as keyof typeof permissionLabels]}</Label>
                  <Switch
                    id={key}
                    checked={permissions[key as keyof UserPermissions] || false}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(key as keyof UserPermissions, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Page Access Permissions */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Page Access Permissions</h4>
            <div className="space-y-3">
              {['canViewDashboard', 'canViewUserManagement', 'canViewAllData', 'canViewAddEmployee', 'canViewSettings'].map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key}>{permissionLabels[key as keyof typeof permissionLabels]}</Label>
                  <Switch
                    id={key}
                    checked={permissions[key as keyof UserPermissions] || false}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(key as keyof UserPermissions, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Component Visibility Permissions */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Component Visibility Permissions</h4>
            <div className="space-y-3">
              {['canViewNavigation', 'canViewSidebar', 'canViewHeader', 'canAccessAdminTools'].map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key}>{permissionLabels[key as keyof typeof permissionLabels]}</Label>
                  <Switch
                    id={key}
                    checked={permissions[key as keyof UserPermissions] || false}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(key as keyof UserPermissions, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Permissions"}
        </Button>
      </DialogFooter>
    </form>
  );
}