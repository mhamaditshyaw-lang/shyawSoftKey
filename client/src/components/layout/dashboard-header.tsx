import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Search, Settings, User, LogOut, Lock, Shield, Activity } from "lucide-react";
import { HelpTooltip, FeatureTooltip, RoleTooltip } from "@/components/ui/help-tooltip";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import NotificationCenter from "@/components/device-notifications/notification-center";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Logo and Dashboard Title */}
            {/* Logo removed */}
          </div>
          <HelpTooltip
            content="Welcome to your dashboard! Here you can view system statistics, manage employees, and access all major features."
            type="info"
          />
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          <FeatureTooltip
            feature="Quick Search"
            description="Search through employees, tasks, interviews, and other data across the system"
            shortcut="Ctrl + K"
          >
            <Button variant="outline" size="sm" className="shadow-sm">
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
            <Badge variant="secondary" className="shadow-sm">
              <Shield className="w-3 h-3 mr-1" />
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </RoleTooltip>

          <NotificationCenter />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="shadow-sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm font-medium">
                {user.username}
              </div>
              <div className="px-2 py-1 text-xs text-muted-foreground">
                {user.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium text-sm shadow-lg">
            {user.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        userId={user.id}
        username={user.username}
      />
    </>
  );
}