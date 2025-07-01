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
      dataView: "Data View",
      
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
      create: "Create",
      submit: "Submit",
      update: "Update",
      view: "View",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      
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
      
      // Login & Authentication
      signIn: "Sign In",
      signOut: "Sign Out",
      login: "Login",
      register: "Register",
      welcomeBackTitle: "Welcome Back",
      signInToSystem: "Sign in to Administration Shyaw System",
      createAccount: "Create Account",
      joinSystem: "Join Administration Shyaw System",
      firstName: "First Name",
      lastName: "Last Name",
      emailAddress: "Email Address",
      requestedRole: "Requested Role",
      enterUsername: "Enter your username",
      enterPassword: "Enter your password",
      createStrongPassword: "Create a strong password",
      signingIn: "Signing In...",
      creatingAccount: "Creating Account...",
      dontHaveAccount: "Don't have an account? Register here",
      alreadyHaveAccount: "Already have an account? Sign in",
      systemTitle: "Administration Shyaw System",
      professionalPlatform: "Professional Administration Platform",
      secureManagement: "Secure and efficient administrative management",
      secureRoleAccess: "Secure Role-Based Access",
      taskProjectManagement: "Task & Project Management",
      realtimeNotifications: "Real-time Notifications",
      selectRoleRequest: "Select role to request",
      
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
      startDate: "Start Date",
      endDate: "End Date",
      category: "Category",
      status: "Status",
      assignedTo: "Assigned To",
      createdBy: "Created By",
      
      // Messages
      success: "Success",
      error: "Error",
      loading: "Loading...",
      noData: "No data available",
      confirmDelete: "Are you sure you want to delete this item?",
      loginSuccess: "Logged in successfully",
      loginFailed: "Login failed",
      registrationSuccessful: "Registration Successful",
      accountCreatedPending: "Your account has been created and is pending admin approval.",
      registrationFailed: "Registration failed",
      
      // Time
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      thisMonth: "This Month",
      custom: "Custom",
      dateRange: "Date Range",
      
      // Settings
      language: "Language",
      theme: "Theme",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      
      // Data and Statistics
      totalFeedback: "Total Feedback",
      filtered: "Filtered",
      highRated: "High Rated",
      stars: "Stars",
      averageRating: "Average Rating",
      responseRate: "Response Rate",
      trendAnalysis: "Trend Analysis",
      
      // Page Menu
      noPages: "No pages available for your role",
      noPagesMatch: "No pages match",
      searchPages: "Search pages...",
      
      // General UI
      allPages: "All Pages",
      mainCategory: "Main",
      hrCategory: "HR",
      tasksCategory: "Tasks",
      feedbackCategory: "Feedback",
      analyticsCategory: "Analytics",
      dataCategory: "Data",
      reportsCategory: "Reports",
      
      // Employee Reviews & Evaluations
      employeeReviews: "Employee Reviews & Evaluations",
      manageEmployeeEvaluations: "Manage employee evaluations, performance reviews, and role changes",
      
      // Daily Task Management
      dailyTaskManagement: "Daily Task Management",
      organizeTrackTasks: "Organize and track daily tasks with smart prioritization",
      
      // Feedback & Reviews
      feedbackReviews: "Feedback & Reviews",
      systemFeedbackReviews: "System feedback, reviews, and user suggestions",
      
      // Employee Tracking
      employeeTracking: "Employee Tracking",
      trackEmployeeAttendance: "Track employee attendance, operations, and performance metrics",
      
      // Management Reports
      managementReports: "Management Reports",
      comprehensiveAnalytics: "Comprehensive analytics and performance insights",
      
      // Archive Management
      archiveManagement: "Archive Management",
      manageArchivedItems: "Manage archived items and historical data",
      
      // All Data Dashboard
      allDataDashboard: "All Data Dashboard",
      comprehensiveDataView: "Comprehensive data view and system administration",
      
      // Employee Management
      employeeManagement: "Employee Management",
      addNewEmployee: "Add New Employee",
      employeeDirectory: "Employee Directory",
      personalInformation: "Personal Information",
      accountInformation: "Account Information",
      employmentInformation: "Employment Information",
      emergencyContact: "Emergency Contact",
      additionalInformation: "Additional Information",
      
      // Daily List Management
      newDailyList: "New Daily List",
      dailyListInformation: "Daily List Information",
      taskItems: "Task Items",
      addItem: "Add Item"
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
      dataView: "بینینی داتا",
      
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
      create: "دروستکردن",
      submit: "ناردن",
      update: "نوێکردنەوە",
      view: "بینین",
      close: "داخستن",
      back: "گەڕانەوە",
      next: "دواتر",
      previous: "پێشوو",
      
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
      
      // Login & Authentication
      signIn: "چوونە ژوور",
      signOut: "دەرچوون",
      login: "چوونەژوور",
      register: "تۆمارکردن",
      welcomeBackTitle: "بەخێربێیتەوە",
      signInToSystem: "چوونە ژوورەوە بۆ سیستەمی بەڕێوەبەری شیاو",
      createAccount: "دروستکردنی هەژمار",
      joinSystem: "بەشداری کردن لە سیستەمی بەڕێوەبەری شیاو",
      firstName: "ناوی یەکەم",
      lastName: "ناوی دووەم",
      emailAddress: "ناونیشانی ئیمەیڵ",
      requestedRole: "ڕۆڵی داواکراو",
      enterUsername: "ناوی بەکارهێنەر بنووسە",
      enterPassword: "وشەی نهێنی بنووسە",
      createStrongPassword: "وشەی نهێنی بەهێز دروست بکە",
      signingIn: "چوونە ژووردا...",
      creatingAccount: "دروستکردنی هەژماردا...",
      dontHaveAccount: "هەژمارت نییە؟ لێرە تۆمار بکە",
      alreadyHaveAccount: "پێشتر هەژمارت هەیە؟ بچۆرە ژوور",
      systemTitle: "سیستەمی بەڕێوەبەری شیاو",
      professionalPlatform: "پلاتفۆرمی بەڕێوەبەری پیشەیی",
      secureManagement: "بەڕێوەبەری پارێزراو و کارا",
      secureRoleAccess: "دەستگەیشتنی پارێزراو بە پلە",
      taskProjectManagement: "بەڕێوەبەری ئەرک و پرۆژە",
      realtimeNotifications: "ئاگادارکردنەوەی کاتی ڕاستەقینە",
      selectRoleRequest: "ڕۆڵ هەڵبژێرە بۆ داواکردن",
      
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
      startDate: "بەرواری دەستپێکردن",
      endDate: "بەرواری کۆتایی",
      category: "جۆر",
      status: "دۆخ",
      assignedTo: "دەستنیشانکراو بۆ",
      createdBy: "دروستکراوە لەلایەن",
      
      // Messages
      success: "سەرکەوتوو",
      error: "هەڵە",
      loading: "بارکردن...",
      noData: "هیچ داتایەک بەردەست نییە",
      confirmDelete: "دڵنیایت کە دەتەوێت ئەم بابەتە بسڕیتەوە؟",
      loginSuccess: "بە سەرکەوتوویی چوویتە ژوور",
      loginFailed: "چوونە ژوور شکستی هێنا",
      registrationSuccessful: "تۆمارکردن سەرکەوتوو بوو",
      accountCreatedPending: "هەژمارەکەت دروست کرا و چاوەڕێی پەسەندکردنی بەڕێوەبەرە.",
      registrationFailed: "تۆمارکردن شکستی هێنا",
      
      // Time
      today: "ئەمڕۆ",
      yesterday: "دوێنێ",
      thisWeek: "ئەم هەفتەیە",
      thisMonth: "ئەم مانگە",
      custom: "دیاریکراو",
      dateRange: "مەودای بەروار",
      
      // Settings
      language: "زمان",
      theme: "ڕووکار",
      darkMode: "دۆخی تاریک",
      lightMode: "دۆخی ڕووناک",
      
      // Data and Statistics
      totalFeedback: "کۆی فیدباک",
      filtered: "پاڵاوتراو",
      highRated: "نرخاندنی بەرز",
      stars: "ئەستێرە",
      averageRating: "تێکڕای نرخاندن",
      responseRate: "ڕێژەی وەڵام",
      trendAnalysis: "شیکردنەوەی ڕەوت",
      
      // Page Menu
      noPages: "هیچ پەڕەیەک بۆ ڕۆڵەکەت بەردەست نییە",
      noPagesMatch: "هیچ پەڕەیەک نەگونجا لەگەڵ",
      searchPages: "گەڕان لە پەڕەکان...",
      
      // General UI
      allPages: "هەموو پەڕەکان",
      mainCategory: "سەرەکی",
      hrCategory: "سەرچاوە مرۆییەکان",
      tasksCategory: "ئەرکەکان",
      feedbackCategory: "فیدباک",
      analyticsCategory: "شیکردنەوە",
      dataCategory: "داتا",
      reportsCategory: "ڕاپۆرتەکان",
      
      // Employee Reviews & Evaluations
      employeeReviews: "هەڵسەنگاندن و لێکۆڵینەوەی کارمەندان",
      manageEmployeeEvaluations: "بەڕێوەبردنی هەڵسەنگاندنی کارمەندان، لێکۆڵینەوەی کارایی و گۆڕینی ڕۆڵ",
      
      // Daily Task Management
      dailyTaskManagement: "بەڕێوەبردنی ئەرکەکانی ڕۆژانە",
      organizeTrackTasks: "ڕێکخستن و بەدواداچوونی ئەرکەکانی ڕۆژانە لەگەڵ پێشینەگرتنی زیرەک",
      
      // Feedback & Reviews
      feedbackReviews: "فیدباک و لێکۆڵینەوەکان",
      systemFeedbackReviews: "فیدباکی سیستەم، لێکۆڵینەوەکان و پێشنیارەکانی بەکارهێنەر",
      
      // Employee Tracking
      employeeTracking: "بەدواداچوونی کارمەند",
      trackEmployeeAttendance: "بەدواداچوونی ئامادەبوونی کارمەند، کارەکان و پێوەری کارایی",
      
      // Management Reports
      managementReports: "ڕاپۆرتەکانی بەڕێوەبەری",
      comprehensiveAnalytics: "شیکردنەوەی تەواو و تێڕوانینی کارایی",
      
      // Archive Management
      archiveManagement: "بەڕێوەبردنی ئەرشیف",
      manageArchivedItems: "بەڕێوەبردنی بابەتە ئەرشیفکراوەکان و داتای مێژوویی",
      
      // All Data Dashboard
      allDataDashboard: "داشبۆردی هەموو داتاکان",
      comprehensiveDataView: "بینینی تەواوی داتا و بەڕێوەبەری سیستەم",
      
      // Employee Management
      employeeManagement: "بەڕێوەبردنی کارمەندان",
      addNewEmployee: "زیادکردنی کارمەندی نوێ",
      employeeDirectory: "فۆڵدەری کارمەندان",
      personalInformation: "زانیاری کەسی",
      accountInformation: "زانیاری هەژمار",
      employmentInformation: "زانیاری کارکردن",
      emergencyContact: "پەیوەندی لەناکاو",
      additionalInformation: "زانیاری زیادە",
      
      // Daily List Management
      newDailyList: "لیستی ڕۆژانەی نوێ",
      dailyListInformation: "زانیاری لیستی ڕۆژانە",
      taskItems: "بابەتەکانی ئەرک",
      addItem: "زیادکردنی بابەت"
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