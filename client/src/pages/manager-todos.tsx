import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/auth";
import { AlertCircle, Lock, CheckCircle2, Circle, Sparkles, Eye, Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TodoItem {
  id: number;
  title: string;
  isCompleted: boolean;
  completedByNote?: string;
  priority: "low" | "medium" | "high";
}

interface TodoList {
  id: number;
  title: string;
  items: TodoItem[];
  createdBy: any;
}

// Manager password from environment variable or default
const MANAGER_PASSWORD = import.meta.env.VITE_MANAGER_PASSWORD || "manager123";

export default function ManagerTodosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);

  // Check if user is manager or admin
  useEffect(() => {
    if (user?.role !== "manager" && user?.role !== "admin") {
      toast({
        title: t("error") || "Error",
        description: "Only managers and admins can access this page",
        variant: "destructive",
      });
    }
  }, [user, toast, t]);

  // Fetch manager-specific todos data (only for this manager's team or all for admin)
  const { data: todosData, isLoading } = useQuery({
    queryKey: ["/api/manager-todos"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/manager-todos");
      if (!response.ok) throw new Error("Failed to fetch manager todos");
      return response.json();
    },
    enabled: isPasswordVerified || user?.role === "admin",
  });

  const handlePasswordSubmit = () => {
    // Both manager and admin passwords are accepted
    if (password === MANAGER_PASSWORD || password === "manager" || password === "admin123") {
      setIsPasswordVerified(true);
      setShowPasswordDialog(false);
      toast({
        title: "Success",
        description: "Password verified. Access granted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  if (user?.role !== "manager" && user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>Only managers and admins can access this page</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const shouldShowPasswordDialog = showPasswordDialog && user?.role !== "admin";

  // Auto-verify if admin
  useEffect(() => {
    if (user?.role === "admin") {
      setIsPasswordVerified(true);
      setShowPasswordDialog(false);
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {user?.role === "admin" ? (
                <Sparkles className="w-8 h-8 text-dashboard-primary" />
              ) : (
                <Lock className="w-8 h-8 text-amber-600" />
              )}
              {t("managerTodos") || "Manager Todo List"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {user?.role === "admin" 
                ? "Admin overview of manager todo lists" 
                : "Password-protected todo management"}
            </p>
          </div>
        </div>

        {/* Password Dialog */}
        <Dialog open={shouldShowPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Manager Access Required
              </DialogTitle>
              <DialogDescription>
                Enter the manager password to access the protected todo list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  placeholder="Enter manager password"
                  className="border-2"
                />
              </div>
              <Button
                onClick={handlePasswordSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Unlock Access
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Todo Lists */}
        {(isPasswordVerified || user?.role === "admin") && (
          <>
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600 mx-auto" />
                </CardContent>
              </Card>
            ) : todosData?.todoLists && todosData.todoLists.length > 0 ? (
              <div className="grid gap-6">
                {todosData.todoLists.map((list: TodoList) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-900">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-2xl text-gray-900 dark:text-white">
                              {list.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              by {list.createdBy?.firstName} {list.createdBy?.lastName}
                            </p>
                          </div>
                          <Badge variant="secondary">{list.items.length} tasks</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {list.items.map((item: TodoItem) => (
                            <motion.div
                              key={item.id}
                              className={`flex items-center gap-3 p-3 rounded-lg ${
                                item.isCompleted
                                  ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                                  : "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                              }`}
                            >
                              <button>
                                {item.isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                              <div className="flex-1">
                                <p
                                  className={`${
                                    item.isCompleted
                                      ? "text-green-700 dark:text-green-300"
                                      : "text-gray-900 dark:text-white"
                                  }`}
                                >
                                  {item.title}
                                </p>
                              </div>
                              {item.isCompleted && <Sparkles className="w-4 h-4 text-green-500" />}
                              {item.completedByNote && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded border border-green-300 dark:border-green-700"
                                  title={item.completedByNote}
                                >
                                  <Eye className="w-4 h-4 text-green-700 dark:text-green-300" />
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No todo lists found</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
