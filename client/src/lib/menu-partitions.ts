export interface MenuItem {
  labelKey: string;
  label: string;
  path: string;
  iconName?: string;
  description?: string;
}

export interface MenuPartition {
  titleKey: string;
  title: string;
  iconName: string;
  description: string;
  items: MenuItem[];
}

export const MENU_PARTITIONS: MenuPartition[] = [
  {
    titleKey: "menu_taskManagement",
    title: "Task Management",
    iconName: "ListTodo",
    description: "Daily tasks, reminders, and activity tracking",
    items: [
      { labelKey: "menu_dailyTasks", label: "Daily Tasks", path: "/todos", iconName: "CheckCircle2", description: "Manage and complete daily tasks" },
      { labelKey: "menu_weeklyMeetingTasks", label: "Weekly Meeting Tasks", path: "/weekly-meetings", iconName: "CheckSquare", description: "Manage weekly meeting department tasks" },
      { labelKey: "menu_reminders", label: "Reminders", path: "/reminders", iconName: "Clock", description: "Set and manage task reminders" },
      { labelKey: "menu_userActivity", label: "User Activity", path: "/user-activity", iconName: "Activity", description: "Track user activity logs" },
      { labelKey: "menu_itSupport", label: "IT Helpdesk", path: "/it-support", iconName: "Monitor", description: "IT helpdesk requests and tasks" },
      { labelKey: "menu_itSupportRequest", label: "Request Helpdesk", path: "/it-support-request", iconName: "HelpCircle", description: "Submit an IT helpdesk request" },
    ],
  },
  {
    titleKey: "menu_employeeManagement",
    title: "Employee Management",
    iconName: "Users",
    description: "Manage employees, departments, and teams",
    items: [
      { labelKey: "menu_users", label: "Users", path: "/users", iconName: "Users2", description: "View and manage all users" },
      { labelKey: "menu_departments", label: "Departments", path: "/department-management", iconName: "Building2", description: "Organize departments and teams" },
    ],
  },
  {
    titleKey: "menu_operations",
    title: "Operations",
    iconName: "Briefcase",
    description: "Operations, interviews, and performance management",
    items: [
      { labelKey: "menu_interviews", label: "Interviews", path: "/interviews", iconName: "MessageCircle", description: "Schedule and manage interviews" },
      { labelKey: "menu_feedback", label: "Feedback", path: "/feedback", iconName: "MessageSquare", description: "Collect and review feedback" },
      { labelKey: "menu_weeklyMeetings", label: "Weekly Meetings", path: "/weekly-meetings", iconName: "Calendar", description: "Manage department weekly meetings and tasks" },
      { labelKey: "menu_performanceArchive", label: "Performance Archive", path: "/archive", iconName: "Archive", description: "Archive performance reviews" },
      { labelKey: "menu_pageAccess", label: "Page Access", path: "/page-access-management", iconName: "Lock", description: "Manage page permissions" },
    ],
  },
  {
    titleKey: "menu_analyticsReports",
    title: "Analytics & Reports",
    iconName: "TrendingUp",
    description: "Business intelligence and reporting",
    items: [
      { labelKey: "menu_reports", label: "Reports", path: "/reports", iconName: "FileText", description: "Generate business reports" },
      { labelKey: "menu_operationData", label: "Operation Data", path: "/metrics", iconName: "Database", description: "View system operation data" },
      { labelKey: "menu_dataView", label: "Data View", path: "/data-view", iconName: "Eye", description: "View raw data with filters" },
      { labelKey: "menu_allData", label: "All Data", path: "/all-data", iconName: "Layers", description: "Browse all system data" },
    ],
  },
  {
    titleKey: "menu_systemManagement",
    title: "System Management",
    iconName: "Cog",
    description: "System administration and maintenance",
    items: [
      { labelKey: "menu_broadcastNotification", label: "Broadcast Notification", path: "/broadcast-notification", iconName: "Radio", description: "Send messages to all users" },
      { labelKey: "menu_notifications", label: "Notifications", path: "/notification-management", iconName: "Bell", description: "Manage notifications" },
      { labelKey: "menu_backupRestore", label: "Backup & Restore", path: "/backup-restore", iconName: "HardDrive", description: "Backup and restore data" },
      { labelKey: "menu_demo", label: "Demo", path: "/multilingual-demo", iconName: "Play", description: "Multilingual demo" },
      { labelKey: "menu_notificationTest", label: "Notification Test", path: "/notification-test", iconName: "TestTube", description: "Test notifications" },
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
