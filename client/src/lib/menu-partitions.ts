export interface MenuItem {
  labelKey: string;
  label: string;
  path: string;
  description?: string;
}

export interface MenuPartition {
  titleKey: string;
  title: string;
  icon: string;
  description: string;
  items: MenuItem[];
}

export const MENU_PARTITIONS: MenuPartition[] = [
  {
    titleKey: "menu_taskManagement",
    title: "Task Management",
    icon: "📋",
    description: "Daily tasks, reminders, and activity tracking",
    items: [
      { labelKey: "menu_dailyTasks", label: "Daily Tasks", path: "/todos", description: "Manage and complete daily tasks" },
      { labelKey: "menu_reminders", label: "Reminders", path: "/reminders", description: "Set and manage task reminders" },
      { labelKey: "menu_userActivity", label: "User Activity", path: "/user-activity", description: "Track user activity logs" },
    ],
  },
  {
    titleKey: "menu_employeeManagement",
    title: "Employee Management",
    icon: "👥",
    description: "Manage employees, departments, and teams",
    items: [
      { labelKey: "menu_users", label: "Users", path: "/users", description: "View and manage all users" },
      { labelKey: "menu_addEmployee", label: "Add Employee", path: "/add-employee", description: "Create new employee records" },
      { labelKey: "menu_departments", label: "Departments", path: "/department-management", description: "Organize departments and teams" },
    ],
  },
  {
    titleKey: "menu_hrOperations",
    title: "HR & Operations",
    icon: "🏢",
    description: "HR operations, interviews, and performance management",
    items: [
      { labelKey: "menu_interviews", label: "Interviews", path: "/interviews", description: "Schedule and manage interviews" },
      { labelKey: "menu_feedback", label: "Feedback", path: "/feedback", description: "Collect and review feedback" },
      { labelKey: "menu_performanceArchive", label: "Performance Archive", path: "/archive", description: "Archive performance reviews" },
      { labelKey: "menu_pageAccess", label: "Page Access", path: "/page-access-management", description: "Manage page permissions" },
    ],
  },
  {
    titleKey: "menu_analyticsReports",
    title: "Analytics & Reports",
    icon: "📊",
    description: "Business intelligence and reporting",
    items: [
      { labelKey: "menu_reports", label: "Reports", path: "/reports", description: "Generate business reports" },
      { labelKey: "menu_operationData", label: "Operation Data", path: "/metrics", description: "View system operation data" },
      { labelKey: "menu_dataView", label: "Data View", path: "/data-view", description: "View raw data with filters" },
      { labelKey: "menu_allData", label: "All Data", path: "/all-data", description: "Browse all system data" },
    ],
  },
  {
    titleKey: "menu_systemManagement",
    title: "System Management",
    icon: "⚙️",
    description: "System administration and maintenance",
    items: [
      { labelKey: "menu_broadcastNotification", label: "Broadcast Notification", path: "/broadcast-notification", description: "Send messages to all users" },
      { labelKey: "menu_notifications", label: "Notifications", path: "/notification-management", description: "Manage notifications" },
      { labelKey: "menu_backupRestore", label: "Backup & Restore", path: "/backup-restore", description: "Backup and restore data" },
      { labelKey: "menu_demo", label: "Demo", path: "/multilingual-demo", description: "Multilingual demo" },
      { labelKey: "menu_notificationTest", label: "Notification Test", path: "/notification-test", description: "Test notifications" },
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
