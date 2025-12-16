import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { DeviceNotificationProvider } from "@/hooks/use-device-notifications";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

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
import EmployeeManagementPage from "@/pages/employee-management";
import DepartmentManagementPage from "@/pages/department-management";
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
import BackupRestorePage from "@/pages/backup-restore";
import PartitionBrowserPage from "@/pages/partition-browser";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/header";
import SlidingSidebarMenu from "@/components/navigation/sliding-sidebar-menu";
import PageAccessManagement from "@/pages/page-access-management";
import BroadcastNotificationPage from "@/pages/broadcast-notification";
import ManagerTodosPage from "@/pages/manager-todos";
import ManagerDashboard from "@/pages/manager-dashboard";
import WeeklyMeetingsPage from "@/pages/weekly-meetings";
import WeeklyMeetingDetailPage from "@/pages/weekly-meeting-detail";
import WeeklyMeetingsDataPage from "@/pages/weekly-meetings-data";
import ItSupportPage from "@/pages/it-support";

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

function RTLHandler() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isRTL = i18n.language === 'ar' || i18n.language === 'ku';
    const htmlElement = document.documentElement;
    
    if (isRTL) {
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.lang = i18n.language;
      document.body.style.direction = 'rtl';
    } else {
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.lang = i18n.language;
      document.body.style.direction = 'ltr';
    }
  }, [i18n.language]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/interviews">
        <ProtectedRoute requiredPermission="manage_interviews">
          <InterviewsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/todos">
        <ProtectedRoute requiredPermission="manage_todos">
          <TodosPage />
        </ProtectedRoute>
      </Route>
      <Route path="/reminders">
        <ProtectedRoute requiredPermission="manage_reminders">
          <RemindersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute requiredPermission="manage_users">
          <UsersPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/employee-management">
        <ProtectedRoute requiredPermission="manage_employees">
          <EmployeeManagementPage />
        </ProtectedRoute>
      </Route>
      <Route path="/department-management">
        <ProtectedRoute requiredPermission="manage_departments">
          <DepartmentManagementPage />
        </ProtectedRoute>
      </Route>
      <Route path="/add-employee">
        <ProtectedRoute requiredPermission="add_employees">
          <AddEmployeePage />
        </ProtectedRoute>
      </Route>

      <Route path="/feedback">
        <ProtectedRoute requiredPermission="manage_feedback">
          <FeedbackPage />
        </ProtectedRoute>
      </Route>
      <Route path="/archive">
        <ProtectedRoute requiredPermission="view_archive">
          <ArchivePage />
        </ProtectedRoute>
      </Route>
      <Route path="/metrics">
        <ProtectedRoute requiredPermission="view_metrics">
          <MetricsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/data-view">
        <ProtectedRoute requiredPermission="view_data">
          <DataViewPage />
        </ProtectedRoute>
      </Route>
      <Route path="/all-data">
        <ProtectedRoute requiredPermission="view_all_data">
          <AllDataPage />
        </ProtectedRoute>
      </Route>
      <Route path="/user-activity">
        <ProtectedRoute requiredPermission="view_user_activity">
          <UserActivityPage />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute requiredPermission="view_reports">
          <ReportsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/weekly-meetings">
        <ProtectedRoute requiredPermission="view_weekly_meetings">
          <WeeklyMeetingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/weekly-meetings/:id">
        <ProtectedRoute requiredPermission="view_weekly_meetings">
          <WeeklyMeetingDetailPage />
        </ProtectedRoute>
      </Route>
      <Route path="/weekly-meetings-data">
        <ProtectedRoute requiredPermission="view_weekly_meetings_data">
          <WeeklyMeetingsDataPage />
        </ProtectedRoute>
      </Route>
      <Route path="/notification-test">
        <ProtectedRoute requiredPermission="view_notification_test">
          <NotificationTestPage />
        </ProtectedRoute>
      </Route>
      <Route path="/broadcast-notification">
        <ProtectedRoute requiredPermission="manage_broadcast">
          <BroadcastNotificationPage />
        </ProtectedRoute>
      </Route>
      <Route path="/notification-management">
        <ProtectedRoute requiredPermission="manage_notifications">
          <NotificationManagementPage />
        </ProtectedRoute>
      </Route>
      <Route path="/multilingual-demo">
        <ProtectedRoute requiredPermission="view_multilingual_demo">
          <MultilingualDemoPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/page-access-management">
        <ProtectedRoute requiredPermission="manage_page_access">
          <PageAccessManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/backup-restore">
        <ProtectedRoute requiredPermission="manage_backup">
          <BackupRestorePage />
        </ProtectedRoute>
      </Route>
      <Route path="/it-support">
        <ProtectedRoute>
          <ItSupportPage />
        </ProtectedRoute>
      </Route>
      <Route path="/partitions">
        <ProtectedRoute requiredPermission="view_partitions">
          <PartitionBrowserPage />
        </ProtectedRoute>
      </Route>
      <Route path="/manager-todos">
        <ProtectedRoute requiredPermission="view_manager_todos">
          <ManagerTodosPage />
        </ProtectedRoute>
      </Route>
      <Route path="/manager-dashboard">
        <ProtectedRoute requiredPermission="view_manager_dashboard">
          <ManagerDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
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
              <RTLHandler />
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