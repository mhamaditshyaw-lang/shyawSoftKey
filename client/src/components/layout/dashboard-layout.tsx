import { useState, useEffect } from "react";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { PartitionedMenuBar } from "@/components/navigation/partitioned-menu-bar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  notificationCount?: number;
}

export function DashboardLayout({ children, notificationCount = 0 }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-dashboard-bg-light dark:bg-dashboard-bg-dark">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <DashboardSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 animate-slide-in">
            <DashboardSidebar
              isCollapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setMobileMenuOpen(true)}
          notificationCount={notificationCount}
        />
        
        {/* Partitioned Menu Bar */}
        <PartitionedMenuBar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}