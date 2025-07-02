import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Grid3X3, Search, ChevronRight, Home, Users, Calendar, CheckSquare, MessageSquare, BarChart3, Archive, FileText, Database, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  description: string;
  roles: string[];
  category: string;
}

export default function PageMenu() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const allPages: NavItem[] = [
    { 
      title: t("dashboard"), 
      href: "/", 
      icon: Home, 
      description: t("addNewTask"), 
      roles: ["admin", "manager", "security"],
      category: t("mainCategory")
    },
    { 
      title: t("employeeReviews"), 
      href: "/interviews", 
      icon: Calendar, 
      description: t("manageEmployeeEvaluations"), 
      roles: ["admin", "manager", "security"],
      category: t("hrCategory")
    },
    { 
      title: t("dailyTaskManagement"), 
      href: "/todos", 
      icon: CheckSquare, 
      description: t("organizeTrackTasks"), 
      roles: ["admin", "manager", "security"],
      category: t("tasksCategory")
    },
    { 
      title: t("feedbackReviews"), 
      href: "/feedback", 
      icon: MessageSquare, 
      description: t("systemFeedbackReviews"), 
      roles: ["admin", "manager", "security"],
      category: t("feedbackCategory")
    },
    { 
      title: t("employeeTracking"), 
      href: "/metrics", 
      icon: Users, 
      description: t("trackEmployeeAttendance"), 
      roles: ["admin", "manager", "security"],
      category: t("analyticsCategory")
    },
    { 
      title: t("dataView"), 
      href: "/data-view", 
      icon: BarChart3, 
      description: t("operationalDataView"), 
      roles: ["admin", "manager", "security"],
      category: t("dataCategory")
    },
    { 
      title: t("allDataDashboard"), 
      href: "/all-data", 
      icon: Database, 
      description: t("comprehensiveDataView"), 
      roles: ["admin", "manager"],
      category: t("dataCategory")
    },
    { 
      title: t("archive"), 
      href: "/archive", 
      icon: Archive, 
      description: t("manageArchivedItems"), 
      roles: ["admin", "manager"],
      category: t("reportsCategory")
    },
    { 
      title: t("managementReports"), 
      href: "/reports", 
      icon: FileText, 
      description: t("comprehensiveAnalytics"), 
      roles: ["admin", "manager"],
      category: t("analyticsCategory")
    },
    { 
      title: t("users"), 
      href: "/users", 
      icon: Users, 
      description: t("comprehensiveDataView"), 
      roles: ["admin"],
      category: t("reportsCategory")
    },
    { 
      title: t("employeeManagement"), 
      href: "/employee-management", 
      icon: Users, 
      description: "Comprehensive employee management with detailed profiles", 
      roles: ["admin", "manager"],
      category: t("hrCategory")
    },
    { 
      title: t("addNewEmployee"), 
      href: "/add-employee", 
      icon: Users, 
      description: "Create new employee accounts with complete information", 
      roles: ["admin", "manager"],
      category: t("hrCategory")
    },
    { 
      title: t("newDailyList"), 
      href: "/add-daily-list", 
      icon: CheckSquare, 
      description: "Create new daily task lists with multiple items", 
      roles: ["admin", "manager", "security"],
      category: t("tasksCategory")
    },
    { 
      title: "Multilingual Demo", 
      href: "/multilingual-demo", 
      icon: Database, 
      description: "Demo of multilingual support and role-based access control", 
      roles: ["admin", "manager", "security"],
      category: "Demo"
    },
  ];

  const filteredPages = allPages.filter(page => {
    const hasRole = user?.role && page.roles.includes(user.role);
    const matchesSearch = !searchTerm || 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return hasRole && matchesSearch;
  });

  const groupedPages = filteredPages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const categories = Object.keys(groupedPages).sort();

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 shadow-lg bg-white hover:bg-gray-50 border-2 border-primary/20 hover:border-primary"
      >
        <Grid3X3 className="w-4 h-4 mr-2" />
        All Pages
      </Button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Page Menu Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-lg shadow-2xl z-50 overflow-hidden">
        <Card className="h-full">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl">
                <Grid3X3 className="w-6 h-6 mr-2 text-primary" />
                {t("allPages")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t("searchPages")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                    <Badge variant="outline" className="text-xs">
                      {groupedPages[category].length} pages
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedPages[category].map((page) => {
                      const Icon = page.icon;
                      const isActive = location === page.href;
                      
                      return (
                        <button
                          key={page.href}
                          onClick={() => {
                            setLocation(page.href);
                            setIsOpen(false);
                          }}
                          className={`flex items-start space-x-3 p-4 rounded-lg border text-left hover:shadow-md transition-all duration-200 ${
                            isActive 
                              ? "bg-primary/10 border-primary shadow-md" 
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${
                              isActive ? "text-primary" : "text-gray-900"
                            }`}>
                              {page.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {page.description}
                            </div>
                            {isActive && (
                              <Badge variant="default" className="mt-2 text-xs">
                                Current Page
                              </Badge>
                            )}
                          </div>
                          
                          <ChevronRight className={`w-4 h-4 ${
                            isActive ? "text-primary" : "text-gray-400"
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {filteredPages.length === 0 && (
                <div className="text-center py-12">
                  <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t("noData")}</h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? `${t("noPagesMatch")} "${searchTerm}"`
                      : t("noPages")
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}