import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, Plus, UserPlus, Edit, Trash2, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

interface Department {
  name: string;
  manager: any;
  employees: any[];
}

export default function DepartmentManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [showEditDept, setShowEditDept] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptManagerId, setNewDeptManagerId] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [renameDeptName, setRenameDeptName] = useState("");
  
  const [employeeForm, setEmployeeForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "security",
    position: "",
    phoneNumber: "",
    managerId: "",
    department: ""
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/users");
      return await response.json();
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const response = await authenticatedRequest("POST", "/api/users", {
        ...employeeData,
        status: "active"
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create employee");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowAddEmployee(false);
      setEmployeeForm({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        role: "security",
        position: "",
        phoneNumber: "",
        managerId: "",
        department: ""
      });
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await authenticatedRequest("PATCH", `/api/users/${id}`, updates);
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setShowCreateDept(false);
      setShowEditEmployee(false);
      setNewDeptName("");
      setNewDeptManagerId("");
      setSelectedEmployee(null);
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
    mutationFn: async (userId: number) => {
      const response = await authenticatedRequest("DELETE", `/api/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
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
  
  // Group users by department
  const departments: Record<string, Department> = {};
  
  users.forEach((u: any) => {
    const dept = u.department || "Unassigned";
    if (!departments[dept]) {
      departments[dept] = {
        name: dept,
        manager: null,
        employees: []
      };
    }
    
    if (u.role === "manager" && u.department === dept) {
      departments[dept].manager = u;
    }
    departments[dept].employees.push(u);
  });

  const availableManagers = users.filter((u: any) => u.role === "manager" && !u.department);
  const allManagers = users.filter((u: any) => u.role === "manager");

  const handleCreateDepartment = () => {
    if (!newDeptName || !newDeptManagerId) {
      toast({
        title: "Error",
        description: "Please provide department name and select a manager",
        variant: "destructive",
      });
      return;
    }

    updateUserMutation.mutate({
      id: parseInt(newDeptManagerId),
      updates: {
        department: newDeptName,
        position: `${newDeptName} Manager`
      }
    });
  };

  const handleCreateEmployee = () => {
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.username || 
        !employeeForm.email || !employeeForm.password || !employeeForm.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createEmployeeMutation.mutate({
      ...employeeForm,
      managerId: employeeForm.managerId ? parseInt(employeeForm.managerId) : null
    });
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setEditDepartment(employee.department || "");
    setShowEditEmployee(true);
  };

  const handleUpdateEmployeeDepartment = () => {
    if (!selectedEmployee) return;

    updateUserMutation.mutate({
      id: selectedEmployee.id,
      updates: {
        department: editDepartment || null
      }
    });
  };

  const handleRemoveFromDepartment = (employee: any) => {
    if (confirm(`Remove ${employee.firstName} ${employee.lastName} from their department?`)) {
      updateUserMutation.mutate({
        id: employee.id,
        updates: {
          department: null
        }
      });
    }
  };

  const handleDeleteEmployee = (employee: any) => {
    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(employee.id);
    }
  };

  const handleEditDepartment = (deptName: string) => {
    setSelectedDepartment(deptName);
    setRenameDeptName(deptName);
    setShowEditDept(true);
  };

  const handleRenameDepartment = async () => {
    if (!selectedDepartment || !renameDeptName) {
      toast({
        title: "Error",
        description: "Please provide a new department name",
        variant: "destructive",
      });
      return;
    }

    if (selectedDepartment === renameDeptName) {
      setShowEditDept(false);
      return;
    }

    const employeesInDept = users.filter((u: any) => u.department === selectedDepartment);
    
    try {
      for (const emp of employeesInDept) {
        await authenticatedRequest("PATCH", `/api/users/${emp.id}`, {
          department: renameDeptName
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Department renamed successfully",
      });
      setShowEditDept(false);
      setSelectedDepartment(null);
      setRenameDeptName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename department",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async (deptName: string) => {
    if (deptName === "Unassigned") {
      toast({
        title: "Error",
        description: "Cannot delete the Unassigned category",
        variant: "destructive",
      });
      return;
    }

    const employeesInDept = users.filter((u: any) => u.department === deptName);
    
    if (!confirm(`Delete department "${deptName}"? All ${employeesInDept.length} employee(s) will be moved to Unassigned.`)) {
      return;
    }

    try {
      for (const emp of employeesInDept) {
        await authenticatedRequest("PATCH", `/api/users/${emp.id}`, {
          department: null
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
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
            <Building2 className="h-6 w-6 text-dashboard-primary" />
            <h1 className="text-2xl font-bold text-dashboard-text-dark dark:text-dashboard-text-light">
              {t("departmentManagement")}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddEmployee(true)}
              variant="outline"
              className="border-dashboard-primary text-dashboard-primary hover:bg-dashboard-primary/10"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t("addEmployee")}
            </Button>
            <Button 
              onClick={() => setShowCreateDept(true)}
              className="bg-dashboard-primary hover:bg-dashboard-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("createDepartment")}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(departments).map((dept) => (
            <Card 
              key={dept.name}
              className="bg-white dark:bg-dashboard-card-dark border-dashboard-border-light dark:border-dashboard-border-dark hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-dashboard-primary" />
                    <span>{dept.name}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {dept.employees.length} {dept.employees.length === 1 ? 'member' : 'members'}
                    </Badge>
                    {dept.name !== "Unassigned" && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDepartment(dept.name)}
                          className="h-6 w-6 p-0"
                          data-testid={`button-edit-dept-${dept.name}`}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDepartment(dept.name)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          data-testid={`button-delete-dept-${dept.name}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {dept.manager ? (
                    <div className="flex items-center space-x-2 mt-2">
                      <User className="h-4 w-4" />
                      <span>Manager: {dept.manager.firstName} {dept.manager.lastName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">{t("noManagerAssigned")}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-dashboard-text-dark dark:text-dashboard-text-light">
                    {t("teamMembers")}:
                  </div>
                  {dept.employees.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {dept.employees.map((emp: any) => (
                        <div 
                          key={emp.id}
                          className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800 group"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {emp.position || emp.role}
                            </div>
                          </div>
                          <Badge variant={emp.role === 'manager' ? 'default' : 'secondary'} className="text-xs">
                            {emp.role}
                          </Badge>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEmployee(emp)}
                              className="h-6 w-6 p-0"
                              data-testid={`button-edit-employee-${emp.id}`}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEmployee(emp)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              data-testid={`button-delete-employee-${emp.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("noEmployeesInDept")}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Department Dialog */}
        <Dialog open={showCreateDept} onOpenChange={setShowCreateDept}>
          <DialogContent className="bg-white dark:bg-dashboard-card-dark">
            <DialogHeader>
              <DialogTitle>{t("createNewDepartment")}</DialogTitle>
              <DialogDescription>
                {t("enterDepartmentDetails")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deptName">{t("departmentNameLabel")} *</Label>
                <Input
                  id="deptName"
                  placeholder="e.g., Finance, Operations, Legal"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  data-testid="input-department-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deptManager">{t("assignManagerLabel")} *</Label>
                <Select value={newDeptManagerId} onValueChange={setNewDeptManagerId}>
                  <SelectTrigger id="deptManager" data-testid="select-department-manager">
                    <SelectValue placeholder={t("selectManagerPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {allManagers.map((manager: any) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.firstName} {manager.lastName} 
                        {manager.department && ` (${manager.department})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("managerWillBeAssigned")}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDept(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={handleCreateDepartment}
                disabled={updateUserMutation.isPending}
                data-testid="button-create-department"
              >
                {updateUserMutation.isPending ? t("creating") : t("createDepartment")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Employee Dialog */}
        <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
          <DialogContent className="bg-white dark:bg-dashboard-card-dark max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("addEmployee")}</DialogTitle>
              <DialogDescription>
                {t("createEmployeeAndAssign")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("firstName")} *</Label>
                  <Input
                    id="firstName"
                    value={employeeForm.firstName}
                    onChange={(e) => setEmployeeForm({...employeeForm, firstName: e.target.value})}
                    data-testid="input-employee-firstname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("lastName")} *</Label>
                  <Input
                    id="lastName"
                    value={employeeForm.lastName}
                    onChange={(e) => setEmployeeForm({...employeeForm, lastName: e.target.value})}
                    data-testid="input-employee-lastname"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t("username")} *</Label>
                  <Input
                    id="username"
                    value={employeeForm.username}
                    onChange={(e) => setEmployeeForm({...employeeForm, username: e.target.value})}
                    data-testid="input-employee-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                    data-testid="input-employee-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")} *</Label>
                <Input
                  id="password"
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({...employeeForm, password: e.target.value})}
                  data-testid="input-employee-password"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">{t("role")} *</Label>
                  <Select value={employeeForm.role} onValueChange={(value) => setEmployeeForm({...employeeForm, role: value})}>
                    <SelectTrigger id="role" data-testid="select-employee-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security">Employee</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">{t("positionLabel")}</Label>
                  <Input
                    id="position"
                    placeholder="e.g., Senior Analyst"
                    value={employeeForm.position}
                    onChange={(e) => setEmployeeForm({...employeeForm, position: e.target.value})}
                    data-testid="input-employee-position"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">{t("departmentNameLabel")} *</Label>
                <Select 
                  value={employeeForm.department} 
                  onValueChange={(value) => {
                    setEmployeeForm({...employeeForm, department: value});
                    // Auto-select manager if department has one
                    const dept = Object.values(departments).find(d => d.name === value);
                    if (dept?.manager) {
                      setEmployeeForm({...employeeForm, department: value, managerId: dept.manager.id.toString()});
                    }
                  }}
                >
                  <SelectTrigger id="department" data-testid="select-employee-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(departments).filter(d => d !== "Unassigned").map((deptName) => (
                      <SelectItem key={deptName} value={deptName}>
                        {deptName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Assign to Manager</Label>
                <Select value={employeeForm.managerId} onValueChange={(value) => setEmployeeForm({...employeeForm, managerId: value})}>
                  <SelectTrigger id="manager" data-testid="select-employee-manager">
                    <SelectValue placeholder="Select manager (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {allManagers
                      .filter((m: any) => m.department === employeeForm.department)
                      .map((manager: any) => (
                        <SelectItem key={manager.id} value={manager.id.toString()}>
                          {manager.firstName} {manager.lastName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("phoneNumberLabel")}</Label>
                <Input
                  id="phone"
                  placeholder="+1-555-0000"
                  value={employeeForm.phoneNumber}
                  onChange={(e) => setEmployeeForm({...employeeForm, phoneNumber: e.target.value})}
                  data-testid="input-employee-phone"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddEmployee(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={handleCreateEmployee}
                disabled={createEmployeeMutation.isPending}
                data-testid="button-add-employee"
              >
                {createEmployeeMutation.isPending ? t("creating") : t("addEmployee")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Department Dialog */}
        <Dialog open={showEditEmployee} onOpenChange={setShowEditEmployee}>
          <DialogContent className="bg-white dark:bg-dashboard-card-dark">
            <DialogHeader>
              <DialogTitle>{t("editEmployeeDepartment")}</DialogTitle>
              <DialogDescription>
                Change the department assignment for {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editDepartment">{t("departmentNameLabel")}</Label>
                <Select value={editDepartment} onValueChange={setEditDepartment}>
                  <SelectTrigger id="editDepartment" data-testid="select-edit-department">
                    <SelectValue placeholder="Select department or leave unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {Object.keys(departments).filter(d => d !== "Unassigned").map((deptName) => (
                      <SelectItem key={deptName} value={deptName}>
                        {deptName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Current: {selectedEmployee?.department || "Unassigned"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleRemoveFromDepartment(selectedEmployee)}
                className="mr-auto"
                data-testid="button-remove-from-department"
              >
                {t("removeFromDepartment")}
              </Button>
              <Button variant="outline" onClick={() => setShowEditEmployee(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={handleUpdateEmployeeDepartment}
                disabled={updateUserMutation.isPending}
                data-testid="button-update-department"
              >
                {updateUserMutation.isPending ? t("updating") : t("updateDepartment")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Department Dialog */}
        <Dialog open={showEditDept} onOpenChange={setShowEditDept}>
          <DialogContent className="bg-white dark:bg-dashboard-card-dark">
            <DialogHeader>
              <DialogTitle>{t("renameDepartment")}</DialogTitle>
              <DialogDescription>
                Change the name of "{selectedDepartment}". All employees in this department will be updated.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="renameDept">{t("newDepartmentNameLabel")} *</Label>
                <Input
                  id="renameDept"
                  placeholder="e.g., Finance, Operations, Legal"
                  value={renameDeptName}
                  onChange={(e) => setRenameDeptName(e.target.value)}
                  data-testid="input-rename-department"
                />
                <p className="text-xs text-muted-foreground">
                  This will update the department name for all {departments[selectedDepartment || ""]?.employees?.length || 0} employee(s)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDept(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={handleRenameDepartment}
                disabled={!renameDeptName}
                data-testid="button-save-rename"
              >
                {t("renameDepartment")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
