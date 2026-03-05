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
import { Textarea } from "@/components/ui/textarea";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, User, Search, Filter, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { HelpTooltip, FeatureTooltip, RoleTooltip, StatusTooltip, ActionTooltip } from "@/components/ui/help-tooltip";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export default function EmployeeManagementPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSearchChange = (val: string) => { setSearchTerm(val); setCurrentPage(1); };
  const handleRoleChange = (val: string) => { setRoleFilter(val); setCurrentPage(1); };
  const handleStatusChange = (val: string) => { setStatusFilter(val); setCurrentPage(1); };

  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  const [assigningManager, setAssigningManager] = useState<any>(null);
  const { toast} = useToast();

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/users");
      return await response.json();
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await authenticatedRequest("PATCH", `/api/users/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingEmployee(null);
      toast({
        title: t("success"),
        description: t("employeeUpdatedSuccessfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || t("failedToUpdateEmployee"),
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedRequest("DELETE", `/api/users/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEmployeeToDelete(null);
      toast({
        title: t("success"),
        description: t("employeeDeletedSuccessfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || t("failedToDeleteEmployee"),
        variant: "destructive",
      });
    },
  });

  const assignManagerMutation = useMutation({
    mutationFn: async ({ staffId, managerId }: { staffId: number; managerId: number | null }) => {
      if (managerId) {
        const response = await authenticatedRequest("POST", `/api/staff/${staffId}/assign-manager`, { managerId });
        return await response.json();
      } else {
        const response = await authenticatedRequest("POST", `/api/staff/${staffId}/remove-manager`, {});
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setAssigningManager(null);
      toast({
        title: t("success"),
        description: "Manager assignment updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || "Failed to update manager assignment",
        variant: "destructive",
      });
    },
  });

  const filteredEmployees = employeesData?.users?.filter((employee: any) => {
    const matchesSearch = employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "manager": return "default";
      case "security": return "secondary";
      default: return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "pending": return "outline";
      default: return "outline";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dashboard-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-dashboard-primary" />
            <h1 className="text-2xl font-bold text-dashboard-text-dark dark:text-dashboard-text-light">
              {t("employeeManagement")}
            </h1>
            <HelpTooltip content={t("manageAllEmployeesHelpText")} />
          </div>
          <Link href="/add-employee">
            <Button className="bg-dashboard-primary hover:bg-dashboard-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              {t("addEmployee")}
            </Button>
          </Link>
        </div>

        <Card className="bg-white dark:bg-dashboard-card-dark border-dashboard-border-light dark:border-dashboard-border-dark">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>{t("filterAndSearch")}</span>
              <FeatureTooltip feature={t("filterAndSearch")} description={t("filterEmployeesHelpText")} />
            </CardTitle>
            <CardDescription>
              {t("searchAndFilterEmployees")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t("searchEmployees")}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("filterByRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allRoles")}</SelectItem>
                  <SelectItem value="admin">{t("admin")}</SelectItem>
                  <SelectItem value="manager">{t("manager")}</SelectItem>
                  <SelectItem value="security">{t("security")}</SelectItem>
                  <SelectItem value="office">{t("office")}</SelectItem>
                  <SelectItem value="secretary">{t("secretary")}</SelectItem>
                  <SelectItem value="office_team">{t("officeTeam")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses")}</SelectItem>
                  <SelectItem value="active">{t("active")}</SelectItem>
                  <SelectItem value="inactive">{t("inactive")}</SelectItem>
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-dashboard-card-dark border-dashboard-border-light dark:border-dashboard-border-dark">
          <CardHeader>
            <CardTitle>{t("employees")} ({filteredEmployees.length})</CardTitle>

            <CardDescription>
              {t("manageEmployeeAccounts")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-dashboard-border-light dark:border-dashboard-border-dark">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("employee")}</TableHead>
                    <TableHead>{t("username")}</TableHead>
                    <TableHead>
                      {t("role")}
                      <RoleTooltip role="User Role" permissions={["View tasks", "Edit profile"]} />
                    </TableHead>
                    <TableHead>
                      {t("status")}
                      <StatusTooltip status="Active" description="Current account status" />
                    </TableHead>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("comments")}</TableHead>
                    <TableHead>
                      {t("actions")}
                      <ActionTooltip action="Edit or Delete" description="Manage employee accounts" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {t("noEmployeesFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEmployees.map((employee: any) => (
                      <TableRow key={employee.id}>
                        <TableCell className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-dashboard-accent text-white">
                              {employee.firstName.charAt(0).toUpperCase()}
                              {employee.lastName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                          </div>
                        </TableCell>
                        <TableCell>{employee.username}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(employee.role)}>
                            {t(employee.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(employee.status)}>
                            {t(employee.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">
                            {employee.comments || <span className="text-gray-400">{t("noComments")}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {(employee.role === 'secretary' || employee.role === 'office' || employee.role === 'office_team') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAssigningManager(employee)}
                                data-testid={`button-assign-manager-${employee.id}`}
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingEmployee(employee)}
                              data-testid={`button-edit-${employee.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEmployeeToDelete(employee)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-${employee.id}`}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span className="font-semibold text-gray-700">{filteredEmployees.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, []).map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                ) : (
                  <Button key={p} size="sm" variant={currentPage === p ? "default" : "outline"} onClick={() => setCurrentPage(p as number)} className="h-8 w-8 p-0 text-sm">
                    {p}
                  </Button>
                )
              )}
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Edit Employee Dialog */}
        {editingEmployee && (
          <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("editEmployee")}</DialogTitle>
                <DialogDescription>
                  {t("updateEmployeeInformation")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">
                    {t("role")}
                  </Label>
                  <Select
                    value={editingEmployee.role}
                    onValueChange={(value) => 
                      setEditingEmployee({ ...editingEmployee, role: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t("admin")}</SelectItem>
                      <SelectItem value="manager">{t("manager")}</SelectItem>
                      <SelectItem value="security">{t("security")}</SelectItem>
                      <SelectItem value="office">{t("office")}</SelectItem>
                      <SelectItem value="secretary">{t("secretary")}</SelectItem>
                      <SelectItem value="office_team">{t("officeTeam")}</SelectItem>
                      <SelectItem value="employee">{t("employee")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    {t("status")}
                  </Label>
                  <Select
                    value={editingEmployee.status}
                    onValueChange={(value) => 
                      setEditingEmployee({ ...editingEmployee, status: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("active")}</SelectItem>
                      <SelectItem value="inactive">{t("inactive")}</SelectItem>
                      <SelectItem value="pending">{t("pending")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-comments" className="text-right mt-2">
                    {t("comments")}
                  </Label>
                  <Textarea
                    id="edit-comments"
                    value={editingEmployee.comments || ""}
                    onChange={(e) => 
                      setEditingEmployee({ ...editingEmployee, comments: e.target.value })
                    }
                    placeholder={t("addComments")}
                    className="col-span-3"
                    rows={4}
                    data-testid="input-comments"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setEditingEmployee(null)}
                  variant="outline"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={() => updateEmployeeMutation.mutate({
                    id: editingEmployee.id,
                    updates: {
                      role: editingEmployee.role,
                      status: editingEmployee.status,
                      comments: editingEmployee.comments
                    }
                  })}
                  disabled={updateEmployeeMutation.isPending}
                >
                  {updateEmployeeMutation.isPending ? t("updating") : t("update")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Employee Dialog */}
        {employeeToDelete && (
          <Dialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("deleteEmployee")}</DialogTitle>
                <DialogDescription>
                  {t("deleteEmployeeConfirmation", {
                    name: `${employeeToDelete.firstName} ${employeeToDelete.lastName}`
                  })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => setEmployeeToDelete(null)}
                  variant="outline"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={() => deleteEmployeeMutation.mutate(employeeToDelete.id)}
                  disabled={deleteEmployeeMutation.isPending}
                  variant="destructive"
                >
                  {deleteEmployeeMutation.isPending ? t("deleting") : t("delete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Assign Manager Dialog */}
        {assigningManager && (
          <Dialog open={!!assigningManager} onOpenChange={() => setAssigningManager(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Manager</DialogTitle>
                <DialogDescription>
                  Assign a manager to {assigningManager.firstName} {assigningManager.lastName}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Manager</Label>
                  <Select
                    value={assigningManager.managerId?.toString() || "none"}
                    onValueChange={(value) => 
                      setAssigningManager({ 
                        ...assigningManager, 
                        managerId: value === "none" ? null : parseInt(value) 
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3" data-testid="select-manager">
                      <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Remove Manager)</SelectItem>
                      {employeesData?.users
                        ?.filter((u: any) => u.role === 'manager')
                        .map((manager: any) => (
                          <SelectItem key={manager.id} value={manager.id.toString()}>
                            {manager.firstName} {manager.lastName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setAssigningManager(null)}
                  variant="outline"
                  data-testid="button-cancel-assign"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={() => {
                    assignManagerMutation.mutate({
                      staffId: assigningManager.id,
                      managerId: assigningManager.managerId
                    });
                  }}
                  disabled={assignManagerMutation.isPending}
                  data-testid="button-save-manager"
                >
                  {assignManagerMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}