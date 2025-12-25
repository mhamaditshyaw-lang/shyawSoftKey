import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, Save, Users, Lock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { User } from "@shared/schema";

interface Page {
  path: string;
  permission: string;
  label: string;
}

interface PageAccessResponse {
  pageAccess: Record<string, boolean>;
}

export default function PageAccessManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [pagePermissions, setPagePermissions] = useState<Record<string, boolean>>({});

  // Fetch all users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery<{ users: User[] }>({
    queryKey: ["/api/users"],
    enabled: currentUser?.role === "admin",
  });

  // Fetch available pages
  const { data: pagesData, isLoading: isLoadingPages } = useQuery<{ pages: Page[] }>({
    queryKey: ["/api/pages/available"],
    enabled: currentUser?.role === "admin",
  });

  // Fetch page access for selected user
  const { data: pageAccessData, isLoading: isLoadingPageAccess } = useQuery<PageAccessResponse>({
    queryKey: ["/api/users", selectedUserId, "page-access"],
    enabled: !!selectedUserId && currentUser?.role === "admin",
  });

  const selectedUser = users.find(u => u.id.toString() === selectedUserId);
  const isSelectedUserAdmin = selectedUser?.role === 'admin';

  // Update page permissions state when data is fetched
  useEffect(() => {
    if (pageAccessData?.pageAccess) {
      setPagePermissions(pageAccessData.pageAccess);
    } else {
      setPagePermissions({});
    }
  }, [pageAccessData]);

  // Update page access mutation
  const updatePageAccessMutation = useMutation({
    mutationFn: (data: { userId: string; pagePermissions: Record<string, boolean> }) =>
      apiRequest("PUT", `/api/users/${data.userId}/page-access`, {
        pagePermissions: data.pagePermissions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", selectedUserId, "page-access"] });
      toast({
        title: "Success",
        description: "Page access updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update page access",
        variant: "destructive",
      });
    },
  });

  // Check if user is admin
  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access page access management. Only administrators can manage user page access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const users = usersData?.users || [];
  const pages = pagesData?.pages || [];
  const isLoading = isLoadingUsers || isLoadingPages;

  const handleTogglePageAccess = (permission: string, checked: boolean) => {
    setPagePermissions((prev) => ({
      ...prev,
      [permission]: checked,
    }));
  };

  const handleSave = () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive",
      });
      return;
    }

    updatePageAccessMutation.mutate({
      userId: selectedUserId,
      pagePermissions,
    });
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="space-y-8 p-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative p-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Manage Page Access
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Control which pages users can access in the application
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Selection Section */}
        <Card className="border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Select User</span>
            </CardTitle>
            <CardDescription>Choose a user to manage their page access permissions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="user-select" className="text-sm font-medium">
                User
              </Label>
              <Select value={selectedUserId} onValueChange={handleUserChange} disabled={isLoadingUsers}>
                <SelectTrigger 
                  id="user-select" 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600"
                  data-testid="select-user"
                >
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem 
                      key={user.id} 
                      value={user.id.toString()}
                      data-testid={`select-user-option-${user.id}`}
                    >
                      {user.firstName} {user.lastName} (@{user.username}) - {user.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Page Access Section */}
        {selectedUserId && (
          <Card className="border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Page Permissions</span>
                </div>
                {isSelectedUserAdmin && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    Admin: All Access Granted
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isSelectedUserAdmin 
                  ? "Administrators have full access to all pages by default. Permissions below are for reference." 
                  : "Enable or disable access to specific pages for this user"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingPageAccess ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse" />
                    <span className="text-lg text-gray-600 dark:text-gray-300">
                      Loading page access...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pages.map((page) => (
                    <div
                      key={page.permission}
                      className={`flex items-center space-x-3 p-4 rounded-xl border transition-colors duration-200 ${
                        isSelectedUserAdmin 
                          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-80" 
                          : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      data-testid={`page-permission-${page.permission}`}
                    >
                      <Checkbox
                        id={page.permission}
                        checked={isSelectedUserAdmin || pagePermissions[page.permission] || false}
                        disabled={isSelectedUserAdmin}
                        onCheckedChange={(checked) =>
                          handleTogglePageAccess(page.permission, checked as boolean)
                        }
                        data-testid={`checkbox-${page.permission}`}
                      />
                      <Label
                        htmlFor={page.permission}
                        className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {page.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {page.path}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        {selectedUserId && !isSelectedUserAdmin && (
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!selectedUserId || updatePageAccessMutation.isPending}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-8"
              data-testid="button-save"
            >
              <Save className="h-5 w-5 mr-2" />
              {updatePageAccessMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !selectedUserId && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse" />
              <span className="text-lg text-gray-600 dark:text-gray-300">
                Loading...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
