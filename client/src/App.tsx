import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { NotificationProvider } from "@/hooks/use-notifications";
import { queryClient } from "./lib/queryClient";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import InterviewsPage from "@/pages/interviews";
import TodosPage from "@/pages/todos";
import FeedbackPage from "@/pages/feedback";
import ArchivePage from "@/pages/archive";
import ReportsPage from "@/pages/reports";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
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
  );
}

export default App;
