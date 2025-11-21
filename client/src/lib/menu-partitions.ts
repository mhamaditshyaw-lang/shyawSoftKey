export interface MenuItem {
  label: string;
  path: string;
  description?: string;
}

export interface MenuPartition {
  title: string;
  icon: string;
  description: string;
  items: MenuItem[];
}

export const MENU_PARTITIONS: MenuPartition[] = [
  {
    title: "Task Management",
    icon: "📋",
    description: "Daily tasks, reminders, and activity tracking",
    items: [
      { label: "Daily Tasks", path: "/todos", description: "Manage and complete daily tasks" },
      { label: "Reminders", path: "/reminders", description: "Set and manage task reminders" },
      { label: "User Activity", path: "/user-activity", description: "Track user activity logs" },
    ],
  },
  {
    title: "Employee Management",
    icon: "👥",
    description: "Manage employees, departments, and teams",
    items: [
      { label: "Users", path: "/users", description: "View and manage all users" },
      { label: "Add Employee", path: "/add-employee", description: "Create new employee records" },
      { label: "Departments", path: "/department-management", description: "Organize departments and teams" },
    ],
  },
  {
    title: "HR & Operations",
    icon: "🏢",
    description: "HR operations, interviews, and performance management",
    items: [
      { label: "Interviews", path: "/interviews", description: "Schedule and manage interviews" },
      { label: "Feedback", path: "/feedback", description: "Collect and review feedback" },
      { label: "Performance Archive", path: "/archive", description: "Archive performance reviews" },
      { label: "Page Access", path: "/page-access-management", description: "Manage page permissions" },
    ],
  },
  {
    title: "Analytics & Reports",
    icon: "📊",
    description: "Business intelligence and reporting",
    items: [
      { label: "Reports", path: "/reports", description: "Generate business reports" },
      { label: "Operation Data", path: "/metrics", description: "View system operation data" },
      { label: "Data View", path: "/data-view", description: "View raw data with filters" },
      { label: "All Data", path: "/all-data", description: "Browse all system data" },
    ],
  },
  {
    title: "System Management",
    icon: "⚙️",
    description: "System administration and maintenance",
    items: [
      { label: "Broadcast Notification", path: "/broadcast-notification", description: "Send messages to all users" },
      { label: "Notifications", path: "/notification-management", description: "Manage notifications" },
      { label: "Backup & Restore", path: "/backup-restore", description: "Backup and restore data" },
      { label: "Demo", path: "/multilingual-demo", description: "Multilingual demo" },
      { label: "Notification Test", path: "/notification-test", description: "Test notifications" },
    ],
  },
];

// Helper functions
export function getPartitionByPage(path: string): MenuPartition | undefined {
  return MENU_PARTITIONS.find((partition) =>
    partition.items.some((item) => item.path === path)
  );
}

export function getPageTitle(path: string): string {
  for (const partition of MENU_PARTITIONS) {
    const item = partition.items.find((i) => i.path === path);
    if (item) return item.label;
  }
  return "Dashboard";
}

export function getPartitionPages(partitionTitle: string): MenuItem[] {
  const partition = MENU_PARTITIONS.find((p) => p.title === partitionTitle);
  return partition?.items || [];
}
