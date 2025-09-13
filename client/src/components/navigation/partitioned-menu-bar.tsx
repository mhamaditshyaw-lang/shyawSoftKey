import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  Users,
  Settings,
  FileText,
  BarChart3,
  MessageSquare,
  Calendar,
  Bell,
  Archive,
  Database,
  CheckSquare,
  Briefcase,
  Building2,
  ChevronRight,
  UserCheck,
  ClipboardList,
  Clock,
} from "lucide-react";

interface SubPage {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

interface MainSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  roles?: string[];
  subPages: SubPage[];
}

const MAIN_SECTIONS: MainSection[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Home,
    color: "from-blue-500 to-blue-600",
    subPages: [
      { id: "overview", title: "Overview", href: "/", icon: BarChart3 },
      { id: "stats", title: "Statistics", href: "/reports", icon: BarChart3 },
    ]
  },
  {
    id: "employee",
    title: "Employee",
    icon: Users,
    color: "from-green-500 to-green-600", 
    subPages: [
      { id: "employees", title: "All Employees", href: "/employees", icon: Users },
      { id: "add-employee", title: "Add Employee", href: "/employees/add", icon: UserCheck },
      { id: "interviews", title: "Interviews", href: "/interviews", icon: MessageSquare },
    ]
  },
  {
    id: "operations",
    title: "Operations",
    icon: Briefcase,
    color: "from-purple-500 to-purple-600",
    subPages: [
      { id: "todos", title: "Daily Tasks", href: "/todos", icon: CheckSquare },
      { id: "feedback", title: "Feedback", href: "/feedback", icon: MessageSquare },
      { id: "reminders", title: "Reminders", href: "/reminders", icon: Bell },
    ]
  },
  {
    id: "reports",
    title: "Reports",
    icon: FileText,
    color: "from-orange-500 to-orange-600",
    roles: ["admin", "manager"],
    subPages: [
      { id: "management", title: "Management Reports", href: "/reports", icon: BarChart3, roles: ["admin", "manager"] },
      { id: "archive", title: "Archive", href: "/archive", icon: Archive },
      { id: "data-view", title: "Data View", href: "/data-view", icon: Database, roles: ["admin"] },
    ]
  },
  {
    id: "system",
    title: "System",
    icon: Settings,
    color: "from-red-500 to-red-600",
    roles: ["admin"],
    subPages: [
      { id: "users", title: "User Management", href: "/users", icon: Users, roles: ["admin"] },
      { id: "notifications", title: "Notifications", href: "/notifications", icon: Bell },
      { id: "settings", title: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
    ]
  }
];

interface PartitionedMenuBarProps {
  className?: string;
}

export function PartitionedMenuBar({ className }: PartitionedMenuBarProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>(() => {
    // Determine active section based on current location
    for (const section of MAIN_SECTIONS) {
      for (const subPage of section.subPages) {
        if (location === subPage.href || location.startsWith(subPage.href + "/")) {
          return section.id;
        }
      }
    }
    return "dashboard";
  });

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true;
    return roles.includes(user?.role || "");
  };

  const filteredSections = MAIN_SECTIONS.filter(section => hasAccess(section.roles));
  const currentSection = filteredSections.find(section => section.id === activeSection);
  const filteredSubPages = currentSection?.subPages.filter(subPage => hasAccess(subPage.roles)) || [];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const section = MAIN_SECTIONS.find(s => s.id === sectionId);
    if (section && section.subPages.length > 0) {
      const firstAccessibleSubPage = section.subPages.find(subPage => hasAccess(subPage.roles));
      if (firstAccessibleSubPage) {
        navigate(firstAccessibleSubPage.href);
      }
    }
  };

  const handleSubPageClick = (href: string) => {
    navigate(href);
  };

  const isSubPageActive = (href: string) => {
    return location === href || location.startsWith(href + "/");
  };

  return (
    <div className={cn("w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm", className)}>
      {/* Main Headers Line */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Main Sections</span>
          </div>
          
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSectionClick(section.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap",
                    isActive
                      ? `bg-gradient-to-r ${section.color} text-white shadow-md hover:shadow-lg`
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.title}</span>
                  {isActive && <ChevronRight className="h-3 w-3 ml-1" />}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub Pages Line */}
      {currentSection && filteredSubPages.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-md",
                `bg-gradient-to-r ${currentSection.color}`
              )}>
                <currentSection.icon className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {currentSection.title} Pages
              </span>
            </div>
            
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              {filteredSubPages.map((subPage) => {
                const Icon = subPage.icon;
                const isActive = isSubPageActive(subPage.href);
                
                return (
                  <Button
                    key={subPage.id}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleSubPageClick(subPage.href)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap",
                      isActive
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600"
                        : "hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{subPage.title}</span>
                    {isActive && (
                      <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}