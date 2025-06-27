import { Building, User, LogOut, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import NotificationBell from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) return null;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "danger";
      case "manager":
        return "info";
      case "secretary":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <header className="glass-card border-b border-black/20 dark:border-white/20 sticky top-0 z-40 backdrop-blur-lg">
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 lg:ml-0 ml-12">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Building className="w-6 h-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black dark:text-white">Office Management</h1>
              <GlassBadge 
                variant={getRoleBadgeVariant(user.role) as any}
                size="sm"
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </GlassBadge>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <GlassInput
              placeholder="Search across system..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <NotificationBell />

            <div className="flex items-center space-x-3 glass-card px-3 py-2 rounded-xl">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-black dark:bg-white">
                  <User className="w-4 h-4 text-white dark:text-black" />
                </AvatarFallback>
              </Avatar>
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-black dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-black/70 dark:text-white/70">{user.email}</p>
              </div>
              <GlassButton
                variant="default"
                size="sm"
                onClick={logout}
                className="hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
