import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Database, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function OperationsMenuBar() {
  const [location] = useLocation();

  const menuItems = [
    {
      title: "Data Entry",
      href: "/metrics",
      icon: Plus,
      description: "Enter daily operations data",
      badge: "Forms",
      color: "blue"
    },
    {
      title: "Data View",
      href: "/data-view",
      icon: Database,
      description: "View and analyze entered data",
      badge: "Analysis",
      color: "green"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Title Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Daily Operations
              </h2>
            </div>
            <Badge variant="outline" className="text-xs">
              Management System
            </Badge>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-2">
            {menuItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center space-x-2 h-10 px-4 transition-all duration-200",
                      isActive && item.color === "blue" && "bg-blue-600 hover:bg-blue-700 text-white",
                      isActive && item.color === "green" && "bg-green-600 hover:bg-green-700 text-white",
                      !isActive && "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.title}</span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs ml-1",
                        isActive && "bg-white/20 text-white",
                        !isActive && "bg-gray-100 text-gray-600"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}