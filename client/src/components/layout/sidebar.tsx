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
          className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg border border-red-200 hover:bg-red-50 animate-pulse-hover"
        >
          {isOpen ? <X className="h-5 w-5 text-red-600 menu-icon" /> : <Menu className="h-5 w-5 text-red-600 menu-icon" />}
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
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-red-200 shadow-2xl
          transform transition-all duration-300 ease-in-out lg:hidden animate-slide-in
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex h-full flex-col overflow-y-auto px-6 pb-4 pt-16">
            <div className="animate-fade-in">
              <StructuredNavigation />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className={`
      hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 animate-slide-in
      ${isCollapsed ? 'lg:w-16' : 'lg:w-72'}
    `}>
      <div className="flex grow flex-col overflow-hidden bg-white border-r border-red-200 shadow-lg">
        {/* Sidebar header with toggle */}
        <div className="flex items-center justify-between p-4 pt-20 border-b border-red-200 bg-gradient-to-r from-red-50 to-white">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-red-800 animate-fade-in">Navigation</h2>
          )}
          <div className="flex items-center space-x-2">
            {/* Animated Menu Handle */}
            <div className="menu-handle p-2 rounded-lg bg-red-100 hover:bg-red-200 cursor-pointer">
              <div className="menu-handle-grip">
                <div className="grip-line"></div>
                <div className="grip-line"></div>
                <div className="grip-line"></div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-red-100 animate-bounce-hover menu-handle"
            >
              <Menu className="h-4 w-4 text-red-600 menu-icon" />
            </Button>
          </div>
        </div>

        {/* Navigation content */}
        <div className="flex-1 overflow-hidden px-3 pb-4 bg-white slide-menu-container">
          <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-show">
            <div className="animate-fade-in">
              <StructuredNavigation className={isCollapsed ? "space-y-1" : ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
