import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";
import { DeleteEmployeeModal } from "@/components/modals/delete-employee-modal";
import { Users, Plus, Search, Filter, Mail, Phone, MapPin, Calendar, UserCheck, Edit, Lock, Trash2 } from "lucide-react";

export default function EmployeeManagementPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [changePasswordModal, setChangePasswordModal] = useState<{
    open: boolean;
    userId: number;
    username: string;
  }>({ open: false, userId: 0, username: "" });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    userId: number;
    username: string;
  }>({ open: false, userId: 0, username: "" });
  const [editModal, setEditModal] = useState<{
    open: boolean;
    employee: any;
  }>({ open: false, employee: null });

  // Fetch users/employees
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    }
  });

  const employees = usersData?.users || [];

  const filteredEmployees = employees.filter((employee: any) => {
    const matchesSearch = !searchTerm || 
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 border-red-200";
      case "manager": return "bg-blue-100 text-blue-800 border-blue-200";
      case "security": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleEditEmployee = (employee: any) => {
    setEditModal({ open: true, employee });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("employeeManagement")}
            </h1>
            <p className="text-lg text-gray-600">{t("manageEmployeeAccounts")}</p>
            <div className="flex items-center gap-6 mt-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t("total")}: {employees.length} {t("employees")}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {t("filtered")}: {filteredEmployees.length} {t("employees")}
              </Badge>
            </div>
          </div>
          <Button 
            onClick={() => setLocation("/add-employee")}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t("addNewEmployee")}</span>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("searchEmployees")}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t("searchByNameUsernameEmail")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("roleFilter")}</label>
                <Select value={roleFilter || "all"} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allRoles")}</SelectItem>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                    <SelectItem value="manager">{t("manager")}</SelectItem>
                    <SelectItem value="security">{t("security")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("statusFilter")}</label>
                <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allStatus")}</SelectItem>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="inactive">{t("inactive")}</SelectItem>
                    <SelectItem value="pending">{t("pending")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("quickActions")}</label>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}
                  className="w-full"
                >
                  {t("clearFilters")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">{t("totalEmployees")}</p>
                  <p className="text-3xl font-bold">{employees.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">{t("active")}</p>
                  <p className="text-3xl font-bold">
                    {employees.filter((emp: any) => emp.status === 'active').length}
                  </p>
                </div>
                <UserCheck className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">{t("pending")}</p>
                  <p className="text-3xl font-bold">
                    {employees.filter((emp: any) => emp.status === 'pending').length}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">{t("managers")}</p>
                  <p className="text-3xl font-bold">
                    {employees.filter((emp: any) => emp.role === 'manager').length}
                  </p>
                </div>
                <Users className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Users className="w-6 h-6 mr-3 text-primary" />
              {t("employeeDirectory")} ({filteredEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p>{t("loading")}</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("noEmployeesFound")}</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? `${t("noEmployeesMatch")} "${searchTerm}"` : t("noEmployeesAvailable")}
                </p>
                <Button onClick={() => setLocation("/add-employee")}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("addFirstEmployee")}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("employee")}</TableHead>
                    <TableHead>{t("contact")}</TableHead>
                    <TableHead>{t("role")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("joinDate")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee: any) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(employee.firstName, employee.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">@{employee.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {employee.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(employee.role)}>
                          {t(employee.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(employee.status)}>
                          {t(employee.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(employee.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEmployee(employee)}
                            title="Edit Employee"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setChangePasswordModal({
                              open: true,
                              userId: employee.id,
                              username: employee.username
                            })}
                            title="Change Password"
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteModal({
                              open: true,
                              userId: employee.id,
                              username: employee.username
                            })}
                            title="Delete Employee"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={changePasswordModal.open}
        onOpenChange={(open) => setChangePasswordModal(prev => ({ ...prev, open }))}
        userId={changePasswordModal.userId}
        username={changePasswordModal.username}
      />

      {/* Edit Employee Modal */}
      {editModal.open && (
        <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ ...editModal, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("editEmployee")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-firstName">{t("firstName")}</Label>
                <Input
                  id="edit-firstName"
                  defaultValue={editModal.employee?.firstName}
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">{t("lastName")}</Label>
                <Input
                  id="edit-lastName"
                  defaultValue={editModal.employee?.lastName}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">{t("email")}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  defaultValue={editModal.employee?.email}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">{t("role")}</Label>
                <Select defaultValue={editModal.employee?.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                    <SelectItem value="manager">{t("manager")}</SelectItem>
                    <SelectItem value="security">{t("security")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModal({ open: false, employee: null })}>
                {t("cancel")}
              </Button>
              <Button onClick={() => {
                // Handle update logic here
                setEditModal({ open: false, employee: null });
              }}>
                {t("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Employee Modal */}
      <DeleteEmployeeModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}
        userId={deleteModal.userId}
        username={deleteModal.username}
      />
    </DashboardLayout>
  );
}