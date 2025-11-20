import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  label: string;
  path: string;
}

interface MenuSection {
  title: string;
  icon: string;
  items: MenuItem[];
}

export default function PartitionMenuBar() {
  const { t } = useTranslation();

  const menuSections: MenuSection[] = [
    {
      title: "Task Management",
      icon: "📋",
      items: [
        { label: "Daily Tasks", path: "/todos" },
        { label: "Reminders", path: "/reminders" },
        { label: "User Activity", path: "/user-activity" },
      ],
    },
    {
      title: "Employee Management",
      icon: "👥",
      items: [
        { label: "Users", path: "/users" },
        { label: "Employee List", path: "/employee-management" },
        { label: "Add Employee", path: "/add-employee" },
        { label: "Departments", path: "/department-management" },
      ],
    },
    {
      title: "HR & Operations",
      icon: "🏢",
      items: [
        { label: "Interviews", path: "/interviews" },
        { label: "Feedback", path: "/feedback" },
        { label: "Performance Archive", path: "/archive" },
        { label: "Page Access", path: "/page-access-management" },
      ],
    },
    {
      title: "Analytics & Reports",
      icon: "📊",
      items: [
        { label: "Dashboard", path: "/" },
        { label: "Metrics", path: "/metrics" },
        { label: "Reports", path: "/reports" },
        { label: "Data View", path: "/data-view" },
        { label: "All Data", path: "/all-data" },
      ],
    },
    {
      title: "System Management",
      icon: "⚙️",
      items: [
        { label: "Notifications", path: "/notification-management" },
        { label: "Backup & Restore", path: "/backup-restore" },
        { label: "Demo", path: "/multilingual-demo" },
        { label: "Notification Test", path: "/notification-test" },
      ],
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white py-3 px-4">
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-75">Quick Access:</span>
        {menuSections.map((section) => (
          <DropdownMenu key={section.title}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all cursor-pointer font-medium text-sm"
                data-testid={`button-partition-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="text-base">{section.icon}</span>
                {section.title}
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="font-bold text-blue-600 text-base">
                {section.icon} {section.title}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {section.items.map((item, index) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link
                    href={item.path}
                    className="w-full cursor-pointer text-sm py-2 px-3"
                    data-testid={`partition-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="block">{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  );
}
