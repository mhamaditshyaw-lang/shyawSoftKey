import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Menu, Settings, LogOut, Lock, Search, ChevronDown } from "lucide-react";
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

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  notificationCount?: number;
}

export function DashboardHeader({ onMenuClick, notificationCount = 0 }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="flex items-center justify-between h-14 px-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9"
            data-testid="btn-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md w-64">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")}
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          
          <NotificationCenter />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-9" data-testid="btn-user-menu">
                <div className="trello-avatar trello-avatar-sm">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-sm font-medium">{user.username}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="mt-2 text-xs capitalize">
                  {user.role}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setChangePasswordOpen(true)} data-testid="btn-change-password">
                <Lock className="w-4 h-4 mr-2" />
                {t("changePassword")}
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="btn-settings">
                <Settings className="w-4 h-4 mr-2" />
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
                data-testid="btn-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        userId={user.id}
        username={user.username}
      />
    </>
  );
}
