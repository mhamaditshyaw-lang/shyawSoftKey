import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, User } from "lucide-react";
import AddUserModal from "@/components/modals/add-user-modal";
import { HelpTooltip, FeatureTooltip, RoleTooltip, StatusTooltip, ActionTooltip } from "@/components/ui/help-tooltip";
import { useTranslation } from "react-i18next";

export default function UsersPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const { toast } = useToast();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/users");
      return await response.json();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await authenticatedRequest("PATCH", `/api/users/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedRequest("DELETE", `/api/users/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setUserToDelete(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const users = usersData?.users || [];

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "security":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleApproveUser = (userId: number) => {
    updateUserMutation.mutate({
      id: userId,
      updates: { status: "active" }
    });
  };

  const handleRejectUser = (userId: number) => {
    updateUserMutation.mutate({
      id: userId,
      updates: { status: "inactive" }
    });
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    updateUserMutation.mutate({
      id: editingUser.id,
      updates: {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status
      }
    });
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete.id);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="mb-8">
            <div className="h-8 bg-dashboard-secondary/20 rounded w-64 mb-2"></div>
            <div className="h-4 bg-dashboard-secondary/20 rounded w-96"></div>
          </div>
          <div className="h-96 bg-dashboard-secondary/20 rounded-xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-3xl font-bold text-dashboard-text-light dark:text-dashboard-text-dark mb-2">{t("employeeManagement")}</h2>
              <p className="text-dashboard-secondary dark:text-dashboard-text-dark/70">{t("manageEmployeeAccountsDesc")}</p>
            </div>
            <HelpTooltip
              content="This page allows you to manage all internal employees. You can view, search, filter, add, edit, and manage employee roles and statuses. Use the filters to find specific employees and the action buttons to perform management tasks."
              type="info"
            />
          </div>
          <FeatureTooltip
            feature="Add New Employee"
            description="Create a new employee account with role assignment and access permissions. Required information includes personal details, contact info, and role selection."
            shortcut="Click to open form"
          >
            <Button onClick={() => setShowAddModal(true)} className="bg-dashboard-primary hover:bg-dashboard-primary/90">
              <Plus className="w-4 h-4 mr-2" />
{t("addEmployee")}
            </Button>
          </FeatureTooltip>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <FeatureTooltip
                feature="Employee Search"
                description="Search by employee name, email, or username. Results update in real-time as you type."
                shortcut="Type to search"
              >
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </FeatureTooltip>
            </div>
            <HelpTooltip
              content="Filter employees by their assigned role. Each role has different access permissions and responsibilities within the system."
              type="tip"
            >
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="office_team">Office Team</SelectItem>
                </SelectContent>
              </Select>
            </HelpTooltip>
            <StatusTooltip
              status="Filter Status"
              description="Filter employees by their account status"
              nextAction="Select status to filter"
            >
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </StatusTooltip>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleTooltip
                    role={user.role}
                    permissions={
                      user.role === "admin" 
                        ? ["Manage all users", "Access all data", "System settings", "Reports"] 
                        : user.role === "manager"
                        ? ["Manage employees", "View reports", "Approve interviews", "Data access"]
                        : ["View assigned tasks", "Submit interviews", "Basic operations"]
                    }
                  >
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </RoleTooltip>
                </TableCell>
                <TableCell>
                  <StatusTooltip
                    status={user.status}
                    description={
                      user.status === "active" ? "Employee has full access to the system" :
                      user.status === "inactive" ? "Employee account is disabled" :
                      "Employee registration is awaiting approval"
                    }
                    nextAction={
                      user.status === "pending" ? "Review and approve/reject" :
                      user.status === "inactive" ? "Can be reactivated if needed" :
                      undefined
                    }
                  >
                    <Badge className={getStatusBadgeColor(user.status)}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </StatusTooltip>
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {user.lastActiveAt
                    ? new Date(user.lastActiveAt).toLocaleDateString()
                    : "Never"
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {user.status === "pending" ? (
                      <>
                        <ActionTooltip
                          action="Approve Employee"
                          description="Grant access to the system and activate the employee account"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApproveUser(user.id)}
                            disabled={updateUserMutation.isPending}
                          >
                            Approve
                          </Button>
                        </ActionTooltip>
                        <ActionTooltip
                          action="Reject Employee"
                          description="Deny access and mark the account as inactive"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRejectUser(user.id)}
                            disabled={updateUserMutation.isPending}
                          >
                            Reject
                          </Button>
                        </ActionTooltip>
                      </>
                    ) : (
                      <>
                        <ActionTooltip
                          action="Edit Employee"
                          description="Modify employee information, role, and account settings"
                        >
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </ActionTooltip>
                        <ActionTooltip
                          action="Delete Employee"
                          description="Permanently remove employee account and all associated data"
                          danger={true}
                        >
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </ActionTooltip>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AddUserModal open={showAddModal} onOpenChange={setShowAddModal} />

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Edit User</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                  <Input
                    id="firstName"
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editingUser.lastName}
                    onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value) => setEditingUser({...editingUser, role: value})}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Status</Label>
                <Select 
                  value={editingUser.status} 
                  onValueChange={(value) => setEditingUser({...editingUser, status: value})}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditingUser(null)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateUserMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <DialogContent className="bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">Delete User</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {userToDelete && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {userToDelete.firstName} {userToDelete.lastName}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {userToDelete.email}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs">
                @{userToDelete.username}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUserToDelete(null)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}