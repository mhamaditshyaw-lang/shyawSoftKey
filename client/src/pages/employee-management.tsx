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
import { Plus, Edit, Trash, User, Search, Filter, Users } from "lucide-react";
import { HelpTooltip, FeatureTooltip, RoleTooltip, StatusTooltip, ActionTooltip } from "@/components/ui/help-tooltip";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export default function EmployeeManagementPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  const { toast } = useToast();

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

  const filteredEmployees = employeesData?.users?.filter((employee: any) => {
    const matchesSearch = employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                    <TableHead>
                      {t("actions")}
                      <ActionTooltip action="Edit or Delete" description="Manage employee accounts" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {t("noEmployeesFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee: any) => (
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
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingEmployee(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEmployeeToDelete(employee)}
                              className="text-red-600 hover:text-red-700"
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
                      status: editingEmployee.status
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
      </div>
    </DashboardLayout>
  );
}