import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Search, Settings, User } from "lucide-react";
import { HelpTooltip, FeatureTooltip, RoleTooltip } from "@/components/ui/help-tooltip";

export function DashboardHeader() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <HelpTooltip
          content="Welcome to your dashboard! Here you can view system statistics, manage employees, and access all major features."
          type="info"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <FeatureTooltip
          feature="Quick Search"
          description="Search through employees, tasks, interviews, and other data across the system"
          shortcut="Ctrl + K"
        >
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </FeatureTooltip>

        <RoleTooltip
          role={user.role}
          permissions={
            user.role === "admin" 
              ? ["Manage all users", "Access all data", "System settings", "Reports"] 
              : user.role === "manager"
              ? ["Manage employees", "View reports", "Approve interviews", "Data access"]
              : ["View assigned tasks", "Submit interviews", "Basic operations"]
          }
        >
          <Badge variant="secondary">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </RoleTooltip>

        <HelpTooltip
          content="Access user settings, preferences, and account management options"
          type="tip"
        >
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </HelpTooltip>
      </div>
    </div>
  );
}