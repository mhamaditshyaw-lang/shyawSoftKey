import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Database, 
  Archive, 
  FileText,
  Menu,
  X
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles: string[];
  shortTitle: string;
}

export default function ResponsiveMenuBar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile/tablet size (hide on desktop)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Changed from 768 to 1024 to include tablets
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const allNavItems: NavItem[] = [
    { title: "Dashboard", href: "/", icon: Home, roles: ["admin", "manager", "secretary"], shortTitle: "Home" },
    { title: "Employee Reviews", href: "/interviews", icon: Calendar, roles: ["admin", "manager", "secretary"], shortTitle: "Reviews" },
    { title: "Daily Tasks", href: "/todos", icon: CheckSquare, roles: ["admin", "manager", "secretary"], shortTitle: "Tasks" },
    { title: "Feedback", href: "/feedback", icon: MessageSquare, roles: ["admin", "manager", "secretary"], shortTitle: "Feedback" },
    { title: "Employee Tracking", href: "/metrics", icon: Users, roles: ["admin", "manager", "secretary"], shortTitle: "Tracking" },
    { title: "Data View", href: "/data-view", icon: BarChart3, roles: ["admin", "manager", "secretary"], shortTitle: "Data" },
    { title: "All Data", href: "/all-data", icon: Database, roles: ["admin", "manager"], shortTitle: "All Data" },
    { title: "Archive", href: "/archive", icon: Archive, roles: ["admin", "manager"], shortTitle: "Archive" },
    { title: "Reports", href: "/reports", icon: FileText, roles: ["admin", "manager"], shortTitle: "Reports" },
    { title: "Users", href: "/users", icon: Users, roles: ["admin"], shortTitle: "Users" },
  ];

  const filteredNavItems = allNavItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  // Desktop - no menu bar (use sidebar only)
  if (!isMobile) {
    return null;
  }

  // Mobile/Tablet navigation
  return (
    <>
      {/* Mobile/Tablet Menu Toggle */}
      <div className="lg:hidden fixed top-20 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-lg border-2 border-primary/20"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Slide-out Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 lg:hidden transform transition-transform duration-300">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <nav className="p-4">
              <div className="space-y-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setLocation(item.href);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex items-center space-x-3 w-full p-3 rounded-lg text-left transition-colors touch-target",
                        isActive 
                          ? "bg-primary text-white shadow-sm" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Mobile/Tablet Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {filteredNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <button
                key={item.href}
                onClick={() => setLocation(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg touch-target transition-colors",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom padding for content when bottom nav is visible */}
      <div className="lg:hidden h-20" />
    </>
  );
}