export interface MenuPartition {
  title: string;
  icon: string;
  items: MenuItem[];
}

export interface MenuItem {
  label: string;
  path: string;
}

export const MENU_PARTITIONS: MenuPartition[] = [
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
