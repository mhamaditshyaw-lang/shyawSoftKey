import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, UserPlus } from "lucide-react";
import { HelpTooltip, FeatureTooltip } from "@/components/ui/help-tooltip";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";

const addEmployeeSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  role: z.enum(["admin", "manager", "security"]),
  status: z.enum(["active", "inactive", "pending"]),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

type AddEmployeeFormData = z.infer<typeof addEmployeeSchema>;

export default function AddEmployeePage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<AddEmployeeFormData>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      role: "security",
      status: "pending",
    },
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: Omit<AddEmployeeFormData, "confirmPassword">) => {
      const response = await authenticatedRequest("POST", "/api/users", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add employee");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: t("success"),
        description: t("employeeAddedSuccessfully"),
      });
      setLocation("/employee-management");
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || t("failedToAddEmployee"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddEmployeeFormData) => {
    const { confirmPassword, ...employeeData } = data;
    addEmployeeMutation.mutate(employeeData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/employee-management">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("back")}
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <UserPlus className="h-6 w-6 text-dashboard-primary" />
            <h1 className="text-2xl font-bold text-dashboard-text-dark dark:text-dashboard-text-light">
              {t("addNewEmployee")}
            </h1>
            <HelpTooltip content={t("addEmployeeHelpText")} />
          </div>
        </div>

        <Card className="bg-white dark:bg-dashboard-card-dark border-dashboard-border-light dark:border-dashboard-border-dark max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{t("employeeInformation")}</span>
              <FeatureTooltip feature={t("employeeInformation")} description={t("employeeFormHelpText")} />
            </CardTitle>
            <CardDescription>
              {t("fillEmployeeDetails")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("firstName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("enterFirstName")}
                            {...field}
                            className="bg-white dark:bg-dashboard-card-dark"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("lastName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("enterLastName")}
                            {...field}
                            className="bg-white dark:bg-dashboard-card-dark"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("username")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("enterUsername")}
                          {...field}
                          className="bg-white dark:bg-dashboard-card-dark"
                        />
                      </FormControl>
                      <FormDescription>
                        {t("usernameDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("enterEmail")}
                          {...field}
                          className="bg-white dark:bg-dashboard-card-dark"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("password")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t("enterPassword")}
                            {...field}
                            className="bg-white dark:bg-dashboard-card-dark"
                          />
                        </FormControl>
                        <FormDescription>
                          {t("passwordDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("confirmPassword")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t("confirmPassword")}
                            {...field}
                            className="bg-white dark:bg-dashboard-card-dark"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("role")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-dashboard-card-dark">
                              <SelectValue placeholder={t("selectRole")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">{t("admin")}</SelectItem>
                            <SelectItem value="manager">{t("manager")}</SelectItem>
                            <SelectItem value="security">{t("security")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("roleDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("status")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-dashboard-card-dark">
                              <SelectValue placeholder={t("selectStatus")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">{t("active")}</SelectItem>
                            <SelectItem value="inactive">{t("inactive")}</SelectItem>
                            <SelectItem value="pending">{t("pending")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("statusDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Link href="/employee-management">
                    <Button type="button" variant="outline">
                      {t("cancel")}
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={addEmployeeMutation.isPending}
                    className="bg-dashboard-primary hover:bg-dashboard-primary/90"
                  >
                    {addEmployeeMutation.isPending ? t("adding") : t("addEmployee")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}