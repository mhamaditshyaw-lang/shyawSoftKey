import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      users: "Users",
      dailyTasks: "Daily Tasks",
      todos: "Todos",
      interviews: "Employee Reviews",
      reports: "Reports",
      feedback: "Feedback",
      archive: "Archive",
      allData: "All Data",
      
      // Common actions
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      search: "Search",
      filter: "Filter",
      export: "Export",
      refresh: "Refresh",
      
      // User roles
      admin: "Admin",
      manager: "Manager",
      secretary: "Secretary",
      employee: "Employee",
      
      // Status
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      completed: "Completed",
      approved: "Approved",
      rejected: "Rejected",
      
      // Dashboard
      welcomeBack: "Welcome back",
      totalUsers: "Total Users",
      activeTasks: "Active Tasks",
      completedTasks: "Completed Tasks",
      pendingReviews: "Pending Reviews",
      quickActions: "Quick Actions",
      recentActivity: "Recent Activity",
      addTask: "Add Task",
      scheduleReview: "Schedule Review",
      viewReports: "View Reports",
      dataOverview: "Data Overview",
      addNewTask: "Add new task or assignment",
      bookEmployeeEvaluation: "Book employee evaluation",
      analyticsAndInsights: "Analytics and insights",
      operationalDataView: "Operational data view",
      
      // Forms
      username: "Username",
      email: "Email",
      password: "Password",
      role: "Role",
      name: "Name",
      title: "Title",
      description: "Description",
      priority: "Priority",
      dueDate: "Due Date",
      
      // Messages
      success: "Success",
      error: "Error",
      loading: "Loading...",
      noData: "No data available",
      confirmDelete: "Are you sure you want to delete this item?",
      
      // Time
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      thisMonth: "This Month",
      
      // Settings
      language: "Language",
      theme: "Theme",
      darkMode: "Dark Mode",
      lightMode: "Light Mode"
    }
  },
  ku: {
    translation: {
      // Navigation
      dashboard: "داشبۆرد",
      users: "بەکارهێنەران",
      dailyTasks: "ئەرکەکانی ڕۆژانە",
      todos: "کارەکان",
      interviews: "هەڵسەنگاندنی کارمەندان",
      reports: "ڕاپۆرتەکان",
      feedback: "فیدباک",
      archive: "ئەرشیف",
      allData: "هەموو داتاکان",
      
      // Common actions
      add: "زیادکردن",
      edit: "دەستکاریکردن",
      delete: "سڕینەوە",
      save: "پاشەکەوتکردن",
      cancel: "پاشگەزبوونەوە",
      search: "گەڕان",
      filter: "پاڵاوتن",
      export: "هەناردەکردن",
      refresh: "نوێکردنەوە",
      
      // User roles
      admin: "بەڕێوەبەر",
      manager: "مانەجەر",
      secretary: "سکرتێر",
      employee: "کارمەند",
      
      // Status
      active: "چالاک",
      inactive: "ناچالاک",
      pending: "لە چاوەڕێدا",
      completed: "تەواوبوو",
      approved: "پەسەندکراو",
      rejected: "ڕەتکراوەتەوە",
      
      // Dashboard
      welcomeBack: "بەخێربێیتەوە",
      totalUsers: "کۆی بەکارهێنەران",
      activeTasks: "ئەرکە چالاکەکان",
      completedTasks: "ئەرکە تەواوبووەکان",
      pendingReviews: "هەڵسەنگاندنی چاوەڕێ",
      quickActions: "کردارە خێراکان",
      recentActivity: "چالاکی نوێ",
      addTask: "زیادکردنی ئەرک",
      scheduleReview: "دانانی هەڵسەنگاندن",
      viewReports: "بینینی ڕاپۆرتەکان",
      dataOverview: "سەیری داتاکان",
      addNewTask: "زیادکردنی ئەرک یان دەستووری نوێ",
      bookEmployeeEvaluation: "ڕێکخستنی هەڵسەنگاندنی کارمەند",
      analyticsAndInsights: "شیکردنەوە و تێڕوانینەکان",
      operationalDataView: "بینینی داتای کارکردن",
      
      // Forms
      username: "ناوی بەکارهێنەر",
      email: "ئیمەیڵ",
      password: "وشەی تێپەڕ",
      role: "ڕۆڵ",
      name: "ناو",
      title: "سەردێڕ",
      description: "وەسف",
      priority: "گرنگی",
      dueDate: "بەرواری کۆتا",
      
      // Messages
      success: "سەرکەوتوو",
      error: "هەڵە",
      loading: "بارکردن...",
      noData: "هیچ داتایەک بەردەست نییە",
      confirmDelete: "دڵنیایت کە دەتەوێت ئەم بابەتە بسڕیتەوە؟",
      
      // Time
      today: "ئەمڕۆ",
      yesterday: "دوێنێ",
      thisWeek: "ئەم هەفتەیە",
      thisMonth: "ئەم مانگە",
      
      // Settings
      language: "زمان",
      theme: "ڕووکار",
      darkMode: "دۆخی تاریک",
      lightMode: "دۆخی ڕووناک"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;