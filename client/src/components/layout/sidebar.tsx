import { useState, useEffect } from "react";
import StructuredNavigation from "@/components/navigation/structured-navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Mobile sidebar overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-gray-900 shadow-md"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex h-full flex-col overflow-y-auto px-6 pb-4 pt-16">
            <StructuredNavigation />
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className={`
      hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300
      ${isCollapsed ? 'lg:w-16' : 'lg:w-72'}
    `}>
      <div className="flex grow flex-col overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        {/* Sidebar header with toggle */}
        <div className="flex items-center justify-between p-4 pt-20 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation content */}
        <div className="flex-1 overflow-hidden px-3 pb-4">
          <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-show">
            <StructuredNavigation className={isCollapsed ? "space-y-1" : ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
