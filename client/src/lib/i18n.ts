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
      security: "Security",
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
      addNewType: "Add New Type",
      addNewFeedbackType: "Add New Feedback Type",
      typeName: "Type Name",
      enterTypeName: "Enter type name",
      feedbackType: "Feedback type",
      addedSuccessfully: "added successfully",
      addType: "Add Type",
      
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
      addItem: "Add Item",
      
      // Additional UI components
      actions: "Actions",
      settings: "Settings",
      profile: "Profile",
      notifications: "Notifications",
      logout: "Logout",
      home: "Home",
      menu: "Menu",
      toggle: "Toggle",
      options: "Options",
      preferences: "Preferences",
      account: "Account",
      system: "System",
      help: "Help",
      about: "About",
      version: "Version",
      contact: "Contact",
      support: "Support",
      documentation: "Documentation",
      tutorial: "Tutorial",
      guide: "Guide",
      features: "Features",
      tools: "Tools",
      utilities: "Utilities",
      advanced: "Advanced",
      basic: "Basic",
      simple: "Simple",
      complex: "Complex",
      overview: "Overview",
      summary: "Summary",
      details: "Details",
      information: "Information",
      data: "Data",
      files: "Files",
      folders: "Folders",
      documents: "Documents",
      images: "Images",
      videos: "Videos",
      audio: "Audio",
      downloads: "Downloads",
      uploads: "Uploads",
      
      // Page titles and navigation
      userManagementPage: "User Management",
      todoManagementPage: "Task Management",
      interviewsPage: "Meetings",
      reportsPage: "Reports",
      feedbackPage: "Feedback",
      archivePage: "Archive",
      dataViewPage: "Data View",
      allDataPage: "All Data",
      
      // Form labels and placeholders
      enterFirstName: "Enter first name",
      enterLastName: "Enter last name",
      enterEmail: "Enter email address",
      selectRole: "Select role",
      phoneNumber: "Phone Number",
      address: "Address",
      department: "Department",
      position: "Position",
      hireDate: "Hire Date",
      salary: "Salary",
      
      // Table headers
      fullName: "Full Name",
      createdAt: "Created At",
      lastLogin: "Last Login",
      
      // Status and actions
      enabled: "Enabled",
      disabled: "Disabled",
      verify: "Verify",
      suspend: "Suspend",
      
      // Messages and notifications
      userAddedSuccessfully: "User added successfully",
      userUpdatedSuccessfully: "User updated successfully",
      userDeletedSuccessfully: "User deleted successfully",
      confirmDeleteUser: "Are you sure you want to delete this user?",
      
      // Dashboard stats
      totalEmployees: "Total Employees",
      totalProjects: "Total Projects",
      totalDepartments: "Total Departments",
      
      // Interview/Meeting management
      scheduleInterview: "Schedule Meeting",
      interviewDate: "Meeting Date",
      interviewTime: "Meeting Time",
      interviewer: "Interviewer",
      interviewee: "Interviewee",
      interviewNotes: "Meeting Notes",
      
      // Daily tasks
      taskName: "Task Name",
      taskDescription: "Task Description",
      taskPriority: "Task Priority",
      taskAssignee: "Assignee",
      taskDeadline: "Deadline",
      high: "High",
      medium: "Medium",
      low: "Low",
      
      // Common UI elements
      searchPlaceholder: "Search...",
      noResultsFound: "No results found",
      loadingData: "Loading data...",
      selectAll: "Select All",
      clearSelection: "Clear Selection",
      
      // Time and dates
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      night: "Night",
      
      // File operations
      uploadFile: "Upload File",
      downloadFile: "Download File",
      deleteFile: "Delete File",
      
      // Permissions
      viewPermission: "View Permission",
      editPermission: "Edit Permission",
      deletePermission: "Delete Permission",
      createPermission: "Create Permission",
      
      // Change Password Modal
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      enterCurrentPassword: "Enter your current password",
      enterNewPassword: "Enter your new password",
      confirmPassword: "Confirm your new password",
      passwordsDoNotMatch: "Passwords do not match",
      passwordChangedSuccessfully: "Password changed successfully",
      passwordChangeError: "Error changing password",
      
      // Form Guidance
      workEmailGuidance: "Use a valid work email address for the user",
      passwordMinLengthGuidance: "Password should be at least 6 characters long",
      usernameGuidance: "Username must be at least 3 characters and unique",
      emailFormatGuidance: "Enter a valid email address format"
      

    }
  },
  ku: {
    translation: {
      // Navigation
      dashboard: "داشبۆرد",
      users: "بەکارهێنەران",
      dailyTasks: "ئەرکەکانی ڕۆژانە",
      todos: "کارەکان",
      interviews: "کۆبوونەوە",
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
      security: "ئاسایش",

      
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

      custom: "دیاریکراو",
      dateRange: "مەودای بەروار",
      
      // Settings
      language: "زمان",
      theme: "ڕووکار",
      darkMode: "دۆخی تاریک",
      lightMode: "دۆخی ڕووناک",
      
      // Todos Page
      todoLists: "لیستی کارەکان",
      todoItems: "بابەتەکانی کار",
      createNewList: "دروستکردنی لیستی نوێ",
      createNewTask: "دروستکردنی ئەرکی نوێ",
      addToList: "زیادکردن بۆ لیست",
      listTitle: "سەردێڕی لیست",
      listDescription: "وەسفی لیست",
      taskTitle: "سەردێڕی ئەرک",
      taskDescription: "وەسفی ئەرک",
      markComplete: "نیشانکردن وەک تەواو",
      markIncomplete: "نیشانکردن وەک ناتەواو",
      editList: "دەستکاری لیست",
      editTask: "دەستکاری ئەرک",
      deleteList: "سڕینەوەی لیست",
      deleteTask: "سڕینەوەی ئەرک",
      archiveList: "ئەرشیفکردنی لیست",
      archiveTask: "ئەرشیفکردنی ئەرک",
      restoreList: "گەڕاندنەوەی لیست",
      restoreTask: "گەڕاندنەوەی ئەرک",
      undoArchive: "پووچەڵکردنەوەی ئەرشیف",
      selectAllTasks: "هەموو ئەرکەکان هەڵبژێرە",
      selectNone: "هیچ هەڵنەبژێرە",
      bulkArchive: "ئەرشیفکردنی کۆمەڵە",
      completedTasksList: "ئەرکە تەواوبووەکان",
      incompleteTasks: "ئەرکە تەواونەبووەکان",
      allTasks: "هەموو ئەرکەکان",
      dueTasks: "ئەرکە کۆتاهاتووەکان",
      highPriority: "گرنگی بەرز",
      mediumPriority: "گرنگی مامناوەند",
      lowPriority: "گرنگی نزم",
      urgentPriority: "زۆر گرنگ",
      noDueDate: "هیچ بەرواری کۆتایی نییە",
      overdue: "کۆتاهاتوو",
      dueSoon: "بەم زووانە کۆتادێت",
      
      // Smart Recommendations
      smartRecommendations: "پێشنیارە زیربەکان",
      recommendedTasks: "ئەرکە پێشنیارکراوەکان",
      priorityScore: "خاڵی گرنگی",
      workloadBalance: "هاوسەنگی کار",
      completionRate: "ڕێژەی تەواوکردن",
      ageOfTask: "تەمەنی ئەرک",
      userPatterns: "نەخشەی بەکارهێنەر",
      intelligentPrioritization: "پێشینەگرتنی زیرەک",
      
      // Time Management
      timeRemaining: "کاتی ماوە",
      timeSpent: "کاتی تێپەڕاندوو",
      estimatedTime: "کاتی پێشبینیکراو",
      actualTime: "کاتی ڕاستەقینە",
      deadline: "کۆتا",
      startTime: "کاتی دەستپێکردن",
      endTime: "کاتی کۆتایی",
      
      // Statistics
      totalLists: "کۆی لیستەکان",
      totalTasks: "کۆی ئەرکەکان",
      completionPercentage: "ڕێژەی تەواوکردن",
      averageTasksPerList: "تێکڕای ئەرک بۆ هەر لیست",
      tasksCompletedToday: "ئەرکی تەواوکراو ئەمڕۆ",
      tasksCreatedToday: "ئەرکی دروستکراو ئەمڕۆ",
      
      // Employee Reviews & Evaluations
      employeeReviewsEvaluations: "کۆبوونەوە و هەڵسەنگاندنی کارمەندان",
      manageEmployeeEvaluationsDesc: "بەڕێوەبردنی کۆبوونەوەی کارمەندان، لێکۆڵینەوەی کارایی و گۆڕینی ڕۆڵ",
      position: "پێگە",
      candidateName: "ناوی بەربژێر",
      proposedDateTime: "کات و بەرواری پێشنیارکراو",
      duration: "ماوە",
      requestedBy: "داواکراوە لەلایەن",
      managerAssigned: "مانەجەری دیاریکراو",
      scheduleInterview: "دانانی کۆبوونەوە",
      interviewRequests: "داواکاری کۆبوونەوەکان",
      noInterviewRequests: "هیچ داواکاری کۆبوونەوەیەک نییە",
      
      // Reports Page
      managementReports: "ڕاپۆرتەکانی بەڕێوەبەری",
      systemAnalytics: "شیکردنەوەی سیستەم",
      userStatistics: "ئامارەکانی بەکارهێنەر",
      taskOverview: "سەیری گشتی ئەرکەکان",
      performanceMetrics: "پێوەرەکانی کارایی",
      dataExports: "هەناردەکردنی داتا",
      chartAnalysis: "شیکردنەوەی چارت",
      trends: "ڕووداوەکان",
      insights: "تێگەیشتنەکان",
      
      // Feedback & Reviews Page  
      feedbackAndReviews: "فیدباک و لێکۆڵینەوەکان",
      systemFeedback: "فیدباکی سیستەم",
      userReviews: "پێداچوونەوەی بەکارهێنەر",
      rating: "نرخاندن",
      comment: "تێبینی",
      submitFeedback: "ناردنی فیدباک",
      feedbackType: "جۆری فیدباک",
      generalFeedback: "فیدباکی گشتی",
      bugReport: "ڕاپۆرتی هەڵە",
      featureRequest: "داواکردنی تایبەتمەندی",
      
      // Archive Page
      archivePage: "پەڕەی ئەرشیف",
      archivedItems: "بابەتە ئەرشیفکراوەکان",
      archiveManagement: "بەڕێوەبردنی ئەرشیف",
      archiveDate: "بەرواری ئەرشیفکردن",
      archivedBy: "ئەرشیفکراوە لەلایەن",
      archiveReason: "هۆکاری ئەرشیفکردن",
      restoreItem: "گەڕاندنەوەی بابەت",
      permanentDelete: "سڕینەوەی هەمیشەیی",
      
      // Data Operations & Data View
      dataOperations: "کارەکانی داتا",
      dataViewSection: "بینینی داتا",
      dataManagement: "بەڕێوەبردنی داتا",
      operationalData: "داتای کارکردن",
      dataAnalysis: "شیکردنەوەی داتا",
      dataFiltering: "پاڵاوتنی داتا",
      dataExport: "هەناردەکردنی داتا",
      dataImport: "هێنانی داتا",
      allDataDashboard: "داشبۆردی هەموو داتاکان",
      dataEntries: "تۆمارەکانی داتا",
      dataRecords: "ڕیکۆردەکانی داتا",
      entryType: "جۆری تۆمار",
      entryDate: "بەرواری تۆمار",
      
      // Common Data Terms
      createdDate: "بەرواری دروستکردن",
      lastModified: "دواین گۆڕانکاری",
      dataSource: "سەرچاوەی داتا",
      recordCount: "ژمارەی ڕیکۆرد",
      totalRecords: "کۆی ڕیکۆردەکان",
      
      // Additional page translations needed
      employeeManagement: "بەڕێوەبردنی کارمەندان",
      manageEmployeeAccountsDesc: "بەڕێوەبردنی کارمەندانی ناوخۆیی و ڕۆڵەکانیان لە کۆمپانیا",
      addEmployee: "زیادکردنی کارمەندی نوێ",
      items: "بابەت",
      total: "کۆ",
      filtered: "پاڵاوتنکراو",
      todayOnly: "تەنها ئەمڕۆ",
      
      // Daily Operations page translations
      backToDashboard: "گەڕانەوە بۆ داشبۆرد",
      dailyOperationsDashboard: "داشبۆردی چالاکیەکانی ڕۆژانە",
      trackEmployeeAttendance: "بەدواداچوونی ئامادەبوونی کارمەندان، چالاکیەکانی کارکردن، ئاستی کارمەندان بەشیفت، و داتای بەرهەمهێنان",
      operationsTracking: "بەدواداچوونی چالاکیەکان",
      employeeAttendance: "ئامادەبوونی کارمەندان",
      enterEmployeeAttendance: "تۆماری ئامادەبوونی کارمەندان",
      enterDailyAttendanceData: "داتای ئامادەبوونی ڕۆژانە داخڵ بکە",
      operationsDataEntry: "تۆماری داتای چالاکیەکان",  
      enterIceCreamProduction: "بەرهەمهێنانی بەستەڵەک، چالاکیەکانی ئالبانی، و چالاکیەکانی دۆ بە شیفت داخڵ بکە",
      staffCountTracking: "بەدواداچوونی ژمارەی کارمەندان",
      enterStaffCountData: "داتای ژمارەی کارمەندانی شیفت داخڵ بکە",
      yesterdayProduction: "بەرهەمهێنانی دوێنێ",
      enterYesterdayProduction: "داتای بەرهەمهێنانی دوێنێ بە کارتۆن و تۆن داخڵ بکە",
      yesterdayLoadingVehicles: "ئۆتۆمبێلەکانی بارکردنی دوێنێ",
      enterVehicleLoadingData: "داتای بارکردنی ئۆتۆمبێل داخڵ بکە",
      saveData: "داتا پاشەکەوت بکە",
      clearForm: "فۆرم پاک بکەرەوە",
      dayShift: "شیفتی ڕۆژ",
      nightShift: "شیفتی شەو",
      iceCream: "بەستەڵەک",
      albany: "ئالبانی",
      doActivities: "چالاکیەکانی دۆ",
      cartons: "کارتۆن",
      tons: "تۆن",
      vehicle1: "ئۆتۆمبێل ١",
      vehicle2: "ئۆتۆمبێل ٢", 
      vehicle3: "ئۆتۆمبێل ٣",
      totalSum: "کۆی گشتی",
      average: "تێکڕا",
      maximum: "زۆرترین",
      minimum: "کەمترین",
      fieldsCompleted: "خانە تەواوکراوەکان",
      statistics: "ئاماری",
      enterDataToSeeStats: "داتا داخڵ بکە بۆ بینینی ئامار",
      processing: "پێداویستی...",
      
      // Data View & Analytics page translations
      dataViewAnalytics: "بینینی داتا و شیکاری",
      viewFilterAnalyzeData: "بینین، پاڵاوتن، و شیکردنەوەی داتای چالاکیەکانت",
      filterByCategory: "پاڵاوتن بەپێی پۆل",
      filterByDate: "پاڵاوتن بەپێی بەروار",
      currentWeek: "ئەم هەفتەیە",
      currentMonth: "ئەم مانگە",
      customDate: "بەرواری تایبەت",
      allDates: "هەموو بەروارەکان",
      autoRefresh: "نوێکردنەوەی خۆکار",
      refreshEvery30Seconds: "نوێکردنەوە هەر ٣٠ چرکە",
      allCategories: "هەموو پۆلەکان",
      employeeCategory: "کارمەند",
      operations: "چالاکیەکان",
      staffCount: "ژمارەی کارمەندان",
      production: "بەرهەمهێنان",
      loadingVehicles: "بارکردن",
      searchData: "گەڕانی داتا",
      searchPlaceholderData: "گەڕان بەناو، پۆل، یان ناوەڕۆکدا...",
      showingEntries: "{count} تۆمار دەنیشاندرێت",
      noDataFound: "هیچ داتایەک نەدۆزرایەوە",
      tryAdjustingFilters: "هەوڵ بدە پاڵاوتنەکان بگۆڕیت",
      clearAllData: "پاککردنەوەی هەموو داتاکان",
      deleteEntry: "سڕینەوەی تۆمار",
      deleteEntryConfirm: "دڵنیایت لەوەی دەتەوێت ئەم تۆمارە بسڕیتەوە؟",
      deleteAllDataConfirm: "دڵنیایت لەوەی دەتەوێت هەموو داتاکان بسڕیتەوە؟",
      typeDelete: "DELETE تایپ بکە بۆ دڵنیایی",
      entryDetails: "وردەکاریەکانی تۆمار",
      dataType: "جۆری داتا",
      totalValue: "نرخی گشتی",
      averageValue: "نرخی ناوەند",
      maximumValue: "زۆرترین نرخ",
      minimumValue: "کەمترین نرخ",
      exportData: "هەناردەکردنی داتا",
      disabled: "ناچالاک",
      activeFilters: "پاڵاوتنە چالاکەکان",
      allDataFilter: "هەموو داتاکان",
      refreshData: "نوێکردنەوەی داتا",
      adminClearAllData: "بەڕێوەبەر: پاککردنەوەی هەموو داتاکان",
      
      // Data and Statistics
      totalFeedback: "کۆی فیدباک",
      filteredData: "پاڵاوتراو",
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
      employeeReviews: "کۆبوونەوەی کارمەندان",
      manageEmployeeEvaluations: "بەڕێوەبردنی کۆبوونەوەی کارمەندان، لێکۆڵینەوەی کارایی و گۆڕینی ڕۆڵ",
      
      // Daily Task Management
      dailyTaskManagement: "بەڕێوەبردنی ئەرکەکانی ڕۆژانە",
      organizeTrackTasks: "ڕێکخستن و بەدواداچوونی ئەرکەکانی ڕۆژانە لەگەڵ پێشینەگرتنی زیرەک",
      
      // Feedback & Reviews
      feedbackReviews: "فیدباک و لێکۆڵینەوەکان",
      systemFeedbackReviews: "فیدباکی سیستەم، لێکۆڵینەوەکان و پێشنیارەکانی بەکارهێنەر",
      
      // Employee Tracking
      employeeTracking: "بەدواداچوونی کارمەند",
      trackEmployeePerformance: "بەدواداچوونی ئامادەبوونی کارمەند، کارەکان و پێوەری کارایی",
      
      // Management Reports
      managementReportsSection: "ڕاپۆرتەکانی بەڕێوەبەری",
      comprehensiveAnalytics: "شیکردنەوەی تەواو و تێڕوانینی کارایی",
      
      // Archive Management
      archiveManagementSection: "بەڕێوەبردنی ئەرشیف",
      manageArchivedItems: "بەڕێوەبردنی بابەتە ئەرشیفکراوەکان و داتای مێژوویی",
      
      // All Data Dashboard
      allDataDashboardSection: "داشبۆردی هەموو داتاکان",
      comprehensiveDataView: "بینینی تەواوی داتا و بەڕێوەبەری سیستەم",
      

      
      // Daily List Management
      newDailyList: "لیستی ڕۆژانەی نوێ",
      dailyListInformation: "زانیاری لیستی ڕۆژانە",
      taskItems: "بابەتەکانی ئەرک",
      addItem: "زیادکردنی بابەت",
      
      // Additional UI components
      actions: "کردارەکان",
      settings: "ڕێکخستنەکان",
      profile: "پڕۆفایل",
      notifications: "ئاگادارکردنەوەکان",
      logout: "دەرچوون",
      home: "ماڵەوە",
      menu: "مێنوو",
      toggle: "گۆڕین",
      options: "هەڵبژاردەکان",
      preferences: "پەسەندەکان",
      account: "هەژمار",
      system: "سیستەم",
      help: "یارمەتی",
      about: "دەربارە",
      version: "وەشان",
      contact: "پەیوەندی",
      support: "پشتگیری",
      documentation: "بەڵگەنامە",
      tutorial: "ڕاهێنان",
      guide: "ڕێنمایی",
      features: "تایبەتمەندییەکان",
      tools: "ئامرازەکان",
      utilities: "بەکارهێنراوەکان",
      advanced: "پێشکەوتوو",
      basic: "بنەڕەتی",
      simple: "سادە",
      complex: "ئاڵۆز",
      overview: "گشتی",
      summary: "پوختە",
      details: "وردەکارییەکان",
      information: "زانیاری",
      data: "داتا",
      files: "فایلەکان",
      folders: "بوخچەکان",
      documents: "بەڵگەنامەکان",
      images: "وێنەکان",
      videos: "ڤیدیۆکان",
      audio: "دەنگ",
      downloads: "داگرتنەکان",
      uploads: "بارکردنەکان",
      
      // Page titles and navigation
      employeeManagementTitle: "بەڕێوەبردنی کارمەندان",
      addEmployeePage: "زیادکردنی کارمەندی نوێ",
      userManagementPage: "بەڕێوەبردنی بەکارهێنەران",
      todoManagementPage: "بەڕێوەبردنی کارەکان",
      interviewsPage: "کۆبوونەوەکان",
      reportsPage: "ڕاپۆرتەکان",
      feedbackPage: "فیدباک",
      archivePageTitle: "ئەرشیف",
      dataViewPage: "بینینی داتا",
      allDataPage: "هەموو داتاکان",
      
      // Form labels and placeholders
      enterFirstName: "ناوی یەکەم بنووسە",
      enterLastName: "ناوی دووەم بنووسە",
      enterEmail: "ئیمەیڵ بنووسە",
      selectRole: "ڕۆڵ هەڵبژێرە",
      phoneNumber: "ژمارەی تەلەفۆن",
      address: "ناونیشان",
      department: "بەش",
      jobPosition: "پۆست",
      hireDate: "بەرواری دامەزراندن",
      salary: "مووچە",
      
      // Table headers
      fullName: "ناوی تەواو",
      createdAt: "دروستکراوە لە",
      lastLogin: "کۆتا چوونەژوور",
      
      // Status and actions
      enabled: "چالاککراو",
      accountDisabled: "ناچالاککراو",
      verify: "دڵنیاکردنەوە",
      suspend: "ڕاگرتن",
      
      // Messages and notifications
      userAddedSuccessfully: "بەکارهێنەر بە سەرکەوتوویی زیادکرا",
      userUpdatedSuccessfully: "بەکارهێنەر بە سەرکەوتوویی نوێکرایەوە",
      userDeletedSuccessfully: "بەکارهێنەر بە سەرکەوتوویی سڕایەوە",
      confirmDeleteUser: "دڵنیایت کە دەتەوێت ئەم بەکارهێنەرە بسڕیتەوە؟",
      
      // Dashboard stats
      totalEmployees: "کۆی کارمەندان",
      totalProjects: "کۆی پرۆژەکان",
      totalDepartments: "کۆی بەشەکان",
      
      // Interview/Meeting management
      scheduleInterviewMeeting: "دانانی کۆبوونەوە",
      interviewDate: "بەرواری کۆبوونەوە",
      interviewTime: "کاتی کۆبوونەوە",
      interviewer: "کۆبوونەوەکار",
      interviewee: "کۆبوونەوەلێکراو",
      interviewNotes: "تێبینییەکانی کۆبوونەوە",
      
      // Daily tasks
      dailyTaskName: "ناوی ئەرکی ڕۆژانە",
      dailyTaskDescription: "وەسفی ئەرکی ڕۆژانە",
      taskPriority: "گرنگی ئەرک",
      taskAssignee: "ئەرکدار",
      taskDeadline: "کۆتای ئەرک",
      high: "بەرز",
      medium: "ناوەند",
      low: "نزم",
      
      // Common UI elements
      searchPlaceholder: "گەڕان...",
      noResultsFound: "هیچ ئەنجامێک نەدۆزرایەوە",
      loadingData: "بارکردنی داتا...",
      selectAllItems: "هەموو بابەتەکان هەڵبژێرە",
      clearSelection: "پاکردنەوەی هەڵبژاردە",
      
      // Time and dates
      morning: "بەیانی",
      afternoon: "دوای نیوەڕۆ",
      evening: "ئێوارە",
      night: "شەو",
      
      // File operations
      uploadFile: "بارکردنی فایل",
      downloadFile: "داگرتنی فایل",
      deleteFile: "سڕینەوەی فایل",
      
      // Permissions
      viewPermission: "مۆڵەتی بینین",
      editPermission: "مۆڵەتی دەستکاری",
      deletePermission: "مۆڵەتی سڕینەوە",
      createPermission: "مۆڵەتی دروستکردن",
      
      // Change Password Modal
      changePassword: "گۆڕینی وشەی تێپەڕ",
      currentPassword: "وشەی تێپەڕی ئێستا",
      newPassword: "وشەی تێپەڕی نوێ",
      confirmNewPassword: "دووپاتکردنەوەی وشەی تێپەڕی نوێ",
      enterCurrentPassword: "وشەی تێپەڕی ئێستات بنووسە",
      enterNewPassword: "وشەی تێپەڕی نوێت بنووسە",
      confirmPassword: "وشەی تێپەڕی نوێت دووپات بکەرەوە",
      passwordsDoNotMatch: "وشەی تێپەڕەکان یەکناگرنەوە",
      passwordChangedSuccessfully: "وشەی تێپەڕ بە سەرکەوتوویی گۆڕدرا",
      passwordChangeError: "هەڵە لە گۆڕینی وشەی تێپەڕ",
      
      // Form Guidance 
      workEmailGuidance: "ناونیشانی ئیمەیڵی کاری دروست بەکاربهێنە بۆ بەکارهێنەر",
      passwordMinLengthGuidance: "وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت",
      usernameGuidance: "ناوی بەکارهێنەر دەبێت لانیکەم ٣ پیت بێت و جیاواز بێت",
      emailFormatGuidance: "فۆرماتی دروستی ناونیشانی ئیمەیڵ بنووسە"
      

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