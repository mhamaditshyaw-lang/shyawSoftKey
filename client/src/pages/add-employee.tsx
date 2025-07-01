import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { User, Mail, Lock, UserCheck, ArrowLeft, Save, Building, Phone, MapPin, Calendar, Briefcase } from "lucide-react";

export default function AddEmployeePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [employeeData, setEmployeeData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    
    // Account Information
    username: "",
    password: "",
    role: "secretary",
    
    // Employment Information
    employeeId: "",
    department: "",
    position: "",
    salary: "",
    startDate: "",
    manager: "",
    workLocation: "",
    employmentType: "full-time",
    
    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    
    // Additional Information
    skills: "",
    notes: "",
    status: "active"
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create employee");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: t("success"),
        description: "Employee created successfully",
      });
      setLocation("/employee-management");
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for submission
    const submitData = {
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      username: employeeData.username,
      email: employeeData.email,
      password: employeeData.password,
      role: employeeData.role,
      status: employeeData.status,
      // Additional employee data can be stored in a separate employee details table
      employeeDetails: {
        phone: employeeData.phone,
        dateOfBirth: employeeData.dateOfBirth,
        address: employeeData.address,
        employeeId: employeeData.employeeId,
        department: employeeData.department,
        position: employeeData.position,
        salary: employeeData.salary,
        startDate: employeeData.startDate,
        manager: employeeData.manager,
        workLocation: employeeData.workLocation,
        employmentType: employeeData.employmentType,
        emergencyContactName: employeeData.emergencyContactName,
        emergencyContactPhone: employeeData.emergencyContactPhone,
        emergencyContactRelation: employeeData.emergencyContactRelation,
        skills: employeeData.skills,
        notes: employeeData.notes
      }
    };

    createEmployeeMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setEmployeeData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/employee-management")}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
                <p className="text-gray-600 mt-1">Create a comprehensive employee profile with all necessary information</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            <UserCheck className="w-4 h-4 mr-2" />
            New Employee Registration
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="w-6 h-6 mr-3 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{t("firstName")} *</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter first name"
                    value={employeeData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("lastName")} *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter last name"
                    value={employeeData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{t("email")} *</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="employee@company.com"
                    value={employeeData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={employeeData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date of Birth</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={employeeData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Address</span>
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main St, City, State"
                    value={employeeData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Lock className="w-6 h-6 mr-3 text-primary" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{t("username")} *</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={t("enterUsername")}
                    value={employeeData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>{t("password")} *</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("createStrongPassword")}
                    value={employeeData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">{t("role")} *</Label>
                  <Select value={employeeData.role} onValueChange={(value) => handleInputChange("role", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t("admin")}</SelectItem>
                      <SelectItem value="manager">{t("manager")}</SelectItem>
                      <SelectItem value="secretary">{t("secretary")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Account Status</Label>
                  <Select value={employeeData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("active")}</SelectItem>
                      <SelectItem value="pending">{t("pending")}</SelectItem>
                      <SelectItem value="inactive">{t("inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Briefcase className="w-6 h-6 mr-3 text-primary" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="EMP001"
                    value={employeeData.employeeId}
                    onChange={(e) => handleInputChange("employeeId", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Department</span>
                  </Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Enter department"
                    value={employeeData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position/Job Title</Label>
                  <Input
                    id="position"
                    type="text"
                    placeholder="Enter job position"
                    value={employeeData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="text"
                    placeholder="$50,000"
                    value={employeeData.salary}
                    onChange={(e) => handleInputChange("salary", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Start Date</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={employeeData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">Direct Manager</Label>
                  <Input
                    id="manager"
                    type="text"
                    placeholder="Manager name"
                    value={employeeData.manager}
                    onChange={(e) => handleInputChange("manager", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workLocation" className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Work Location</span>
                  </Label>
                  <Input
                    id="workLocation"
                    type="text"
                    placeholder="Office location"
                    value={employeeData.workLocation}
                    onChange={(e) => handleInputChange("workLocation", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select value={employeeData.employmentType} onValueChange={(value) => handleInputChange("employmentType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Phone className="w-6 h-6 mr-3 text-primary" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    type="text"
                    placeholder="Emergency contact name"
                    value={employeeData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={employeeData.emergencyContactPhone}
                    onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelation">Relationship</Label>
                  <Select value={employeeData.emergencyContactRelation || "none"} onValueChange={(value) => handleInputChange("emergencyContactRelation", value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No relationship selected</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <UserCheck className="w-6 h-6 mr-3 text-primary" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills & Qualifications</Label>
                <Textarea
                  id="skills"
                  placeholder="List employee skills, certifications, and qualifications..."
                  value={employeeData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about the employee..."
                  value={employeeData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setLocation("/employee-management")}
            >
              {t("cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={createEmployeeMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{createEmployeeMutation.isPending ? t("loading") : "Create Employee"}</span>
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}