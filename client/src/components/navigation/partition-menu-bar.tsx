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
  permission?: string;
}

interface MenuSection {
  title: string;
  icon: string;
  items: MenuItem[];
}

export default function PartitionMenuBar() {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const menuSections: MenuSection[] = [
    {
      title: "Tasks",
      icon: "📋",
      items: [
        { label: "Daily Tasks", path: "/todos", permission: "manage_todos" },
        { label: "Reminders", path: "/reminders", permission: "manage_reminders" },
      ],
    },
    {
      title: "HR",
      icon: "👥",
      items: [
        { label: "Employees", path: "/users" },
        { label: "Employee Management", path: "/employee-management" },
        { label: "Department Management", path: "/department-management" },
        { label: "Add Employee", path: "/add-employee" },
      ],
    },
    {
      title: "Management",
      icon: "📊",
      items: [
        { label: "Interviews", path: "/interviews", permission: "manage_interviews" },
        { label: "Feedback", path: "/feedback", permission: "manage_feedback" },
        { label: "Archive", path: "/archive", permission: "view_archive" },
      ],
    },
    {
      title: "Reports",
      icon: "📈",
      items: [
        { label: "Analytics", path: "/metrics" },
        { label: "Reports", path: "/reports" },
        { label: "Data View", path: "/data-view" },
        { label: "All Data", path: "/all-data" },
      ],
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white py-3 px-4">
      <div className="flex gap-2 flex-wrap">
        {menuSections.map((section) => (
          <DropdownMenu key={section.title}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all cursor-pointer font-medium text-sm"
                data-testid={`button-menu-${section.title.toLowerCase()}`}
              >
                <span>{section.icon}</span>
                {section.title}
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="font-semibold text-blue-600">
                {section.title}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {section.items.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link
                    href={item.path}
                    className="w-full cursor-pointer text-sm"
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.label}
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
