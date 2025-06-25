import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { NotificationProvider } from "@/hooks/use-notifications";
import { ThemeProvider } from "@/hooks/use-theme";
import { queryClient } from "./lib/queryClient";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import InterviewsPage from "@/pages/interviews";
import TodosPage from "@/pages/todos";
import FeedbackPage from "@/pages/feedback";
import ArchivePage from "@/pages/archive";
import MetricsPage from "@/pages/metrics";
import DataViewPage from "@/pages/data-view";
import AllDataPage from "@/pages/all-data";
import ReportsPage from "@/pages/reports";
import AdminDashboard from "@/pages/admin";
import CustomAdminDashboard from "@/pages/custom-admin";
import AdminUsersPage from "@/pages/admin-users";
import AdminSettingsPage from "@/pages/admin-settings";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import PageMenu from "@/components/navigation/page-menu";
import ResponsiveMenuBar from "@/components/navigation/responsive-menu-bar";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <ResponsiveMenuBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
          <div className="max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
      
      {/* Global Page Menu */}
      <PageMenu />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute>
          <UsersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/interviews">
        <ProtectedRoute>
          <InterviewsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/todos">
        <ProtectedRoute>
          <TodosPage />
        </ProtectedRoute>
      </Route>
      <Route path="/feedback">
        <ProtectedRoute>
          <FeedbackPage />
        </ProtectedRoute>
      </Route>
      <Route path="/archive">
        <ProtectedRoute>
          <ArchivePage />
        </ProtectedRoute>
      </Route>
      <Route path="/metrics">
        <ProtectedRoute>
          <MetricsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/data-view">
        <ProtectedRoute>
          <DataViewPage />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <ReportsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin" component={CustomAdminDashboard} />
      <Route path="/admin/analytics" component={CustomAdminDashboard} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/tasks" component={AdminUsersPage} />
      <Route path="/admin/calendar" component={AdminUsersPage} />
      <Route path="/admin/reports" component={AdminUsersPage} />
      <Route path="/admin/feedback" component={AdminUsersPage} />
      <Route path="/admin/inventory" component={AdminUsersPage} />
      <Route path="/admin/profile" component={AdminSettingsPage} />
      <Route path="/admin/notifications" component={AdminSettingsPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
