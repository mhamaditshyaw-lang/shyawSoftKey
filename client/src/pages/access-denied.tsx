import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AccessDenied() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleGoBack = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dashboard-bg-light dark:bg-dashboard-bg-dark p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="w-16 h-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button 
            onClick={() => setLocation("/")}
            className="w-full"
            data-testid="button-go-to-dashboard"
          >
            Go to Dashboard
          </Button>
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="w-full"
            data-testid="button-go-back"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
