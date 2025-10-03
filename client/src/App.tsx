import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { DeviceNotificationProvider } from "@/hooks/use-device-notifications";

import { ThemeProvider } from "@/hooks/use-theme";
import { queryClient } from "./lib/queryClient";
import { PAGE_PERMISSIONS, type PermissionKey } from "@shared/schema";
import LoginPage from "@/pages/login";
import ModernDashboard from "@/pages/modern-dashboard";
import AccessDenied from "@/pages/access-denied";

import InterviewsPage from "@/pages/interviews";
import TodosPage from "@/pages/todos";
import RemindersPage from "@/pages/reminders";
import UsersPage from "@/pages/users";
import UserManagementPage from "@/pages/user-management";
import EmployeeManagementPage from "@/pages/employee-management";
import AddEmployeePage from "@/pages/add-employee";

import FeedbackPage from "@/pages/feedback";
import ArchivePage from "@/pages/archive";
import MetricsPage from "@/pages/metrics";
import MultilingualDemoPage from "@/pages/multilingual-demo";
import DataViewPage from "@/pages/data-view";
import AllDataPage from "@/pages/all-data";
import UserActivityPage from "@/pages/user-activity";
import ReportsPage from "@/pages/reports";
import NotificationTestPage from "@/pages/notification-test";
import NotificationManagementPage from "@/pages/notification-management";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/header";
import SlidingSidebarMenu from "@/components/navigation/sliding-sidebar-menu";
import UserSettingsPage from "@/pages/user-settings";
import InternalUserManagementPage from "@/pages/internal-user-management";
import PageAccessManagement from "@/pages/page-access-management";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: PermissionKey;
}

function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg-light dark:bg-dashboard-bg-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-dashboard-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (requiredPermission) {
    const isAdmin = user.role === 'admin';
    const userPermissions = user.permissions as Record<string, boolean> || {};
    const hasPermission = userPermissions[requiredPermission] === true;

    if (!isAdmin && !hasPermission) {
      return <AccessDenied />;
    }
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/interviews">
        <ProtectedRoute requiredPermission="canViewInterviews">
          <InterviewsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/todos">
        <ProtectedRoute requiredPermission="canViewTodos">
          <TodosPage />
        </ProtectedRoute>
      </Route>
      <Route path="/reminders">
        <ProtectedRoute requiredPermission="canViewReminders">
          <RemindersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute>
          <UsersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/user-management">
        <ProtectedRoute requiredPermission="canViewUserManagement">
          <UserManagementPage />
        </ProtectedRoute>
      </Route>
      <Route path="/employee-management">
        <ProtectedRoute requiredPermission="canViewEmployeeManagement">
          <EmployeeManagementPage />
        </ProtectedRoute>
      </Route>
      <Route path="/add-employee">
        <ProtectedRoute requiredPermission="canViewAddEmployee">
          <AddEmployeePage />
        </ProtectedRoute>
      </Route>

      <Route path="/feedback">
        <ProtectedRoute requiredPermission="canViewFeedback">
          <FeedbackPage />
        </ProtectedRoute>
      </Route>
      <Route path="/archive">
        <ProtectedRoute requiredPermission="canViewArchive">
          <ArchivePage />
        </ProtectedRoute>
      </Route>
      <Route path="/metrics">
        <ProtectedRoute requiredPermission="canViewMetrics">
          <MetricsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/data-view">
        <ProtectedRoute requiredPermission="canViewDataView">
          <DataViewPage />
        </ProtectedRoute>
      </Route>
      <Route path="/all-data">
        <ProtectedRoute requiredPermission="canViewAllData">
          <AllDataPage />
        </ProtectedRoute>
      </Route>
      <Route path="/user-activity">
        <ProtectedRoute requiredPermission="canViewUserActivity">
          <UserActivityPage />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute requiredPermission="canViewReports">
          <ReportsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/notification-test">
        <ProtectedRoute>
          <NotificationTestPage />
        </ProtectedRoute>
      </Route>
      <Route path="/notification-management">
        <ProtectedRoute requiredPermission="canViewNotificationManagement">
          <NotificationManagementPage />
        </ProtectedRoute>
      </Route>
      <Route path="/multilingual-demo">
        <ProtectedRoute>
          <MultilingualDemoPage />
        </ProtectedRoute>
      </Route>
      <Route path="/user-settings">
        <ProtectedRoute requiredPermission="canViewSettings">
          <UserSettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/internal-user-management">
        <ProtectedRoute>
          <InternalUserManagementPage />
        </ProtectedRoute>
      </Route>
      <Route path="/page-access-management">
        <ProtectedRoute>
          <PageAccessManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute requiredPermission="canViewDashboard">
          <ModernDashboard />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DeviceNotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </DeviceNotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;