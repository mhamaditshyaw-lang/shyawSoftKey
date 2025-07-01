import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { NotificationProvider } from "@/hooks/use-notifications";
import { ThemeProvider } from "@/hooks/use-theme";
import { queryClient } from "./lib/queryClient";
import LoginPage from "@/pages/login";
import ModernDashboard from "@/pages/modern-dashboard";
import UsersPage from "@/pages/users";
import EmployeeManagementPage from "@/pages/employee-management";
import AddEmployeePage from "@/pages/add-employee";
import InterviewsPage from "@/pages/interviews";
import TodosPage from "@/pages/todos";
import AddDailyListPage from "@/pages/add-daily-list";
import DailyTasksPage from "@/pages/daily-tasks";
import FeedbackPage from "@/pages/feedback";
import ArchivePage from "@/pages/archive";
import MetricsPage from "@/pages/metrics";
import DataViewPage from "@/pages/data-view";
import AllDataPage from "@/pages/all-data";
import ReportsPage from "@/pages/reports";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/header";
import SlidingSidebarMenu from "@/components/navigation/sliding-sidebar-menu";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

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

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        <ProtectedRoute>
          <ModernDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute>
          <UsersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/employee-management">
        <ProtectedRoute>
          <EmployeeManagementPage />
        </ProtectedRoute>
      </Route>
      <Route path="/add-employee">
        <ProtectedRoute>
          <AddEmployeePage />
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
      <Route path="/add-daily-list">
        <ProtectedRoute>
          <AddDailyListPage />
        </ProtectedRoute>
      </Route>
      <Route path="/daily-tasks">
        <ProtectedRoute>
          <DailyTasksPage />
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
      <Route path="/all-data">
        <ProtectedRoute>
          <AllDataPage />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <ReportsPage />
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
