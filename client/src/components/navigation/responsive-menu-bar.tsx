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
  X,
  Bell
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
    { title: "Dashboard", href: "/", icon: Home, roles: ["admin", "manager", "security"], shortTitle: "Home" },
    { title: "Employee Reviews", href: "/interviews", icon: Calendar, roles: ["admin", "manager", "security"], shortTitle: "Reviews" },
    { title: "Daily Tasks", href: "/todos", icon: CheckSquare, roles: ["admin", "manager", "security"], shortTitle: "Tasks" },
    { title: "Reminders", href: "/reminders", icon: Bell, roles: ["admin", "manager", "security"], shortTitle: "Reminders" },
    { title: "Feedback", href: "/feedback", icon: MessageSquare, roles: ["admin", "manager", "security"], shortTitle: "Feedback" },
    { title: "Employee Tracking", href: "/metrics", icon: Users, roles: ["admin", "manager", "security"], shortTitle: "Tracking" },
    { title: "Data View", href: "/data-view", icon: BarChart3, roles: ["admin", "manager", "security"], shortTitle: "Data" },
    { title: "All Data", href: "/all-data", icon: Database, roles: ["admin", "manager"], shortTitle: "All Data" },
    { title: "Archive", href: "/archive", icon: Archive, roles: ["admin", "manager"], shortTitle: "Archive" },
    { title: "Reports", href: "/reports", icon: FileText, roles: ["admin", "manager"], shortTitle: "Reports" },
    { title: "Users", href: "/users", icon: Users, roles: ["admin"], shortTitle: "Users" },
  ];

  const filteredNavItems = allNavItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  // Hide menu on all screen sizes
  return null;
}