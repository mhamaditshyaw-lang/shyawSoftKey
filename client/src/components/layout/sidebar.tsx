import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Calendar,
  CheckSquare,
  MessageSquare,
  Calculator,
  Archive,
  TrendingUp,
  Database,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard Overview",
    href: "/",
    icon: BarChart3,
    roles: ["admin", "manager", "secretary"],
  },
  {
    title: "Employee Management",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Employee Reviews & Evaluations",
    href: "/interviews",
    icon: Calendar,
    roles: ["admin", "manager", "secretary"],
  },
  {
    title: "Employee Affairs Tasks",
    href: "/todos",
    icon: CheckSquare,
    roles: ["admin", "manager", "secretary"],
  },
  {
    title: "Feedback & Reviews",
    href: "/feedback",
    icon: MessageSquare,
    roles: ["admin", "manager", "secretary"],
  },
  {
    title: "Employee Tracking",
    href: "/metrics",
    icon: Calculator,
    roles: ["admin", "manager", "secretary"],
  },
  {
    title: "Data View",
    href: "/data-view",
    icon: Database,
    roles: ["admin", "manager", "secretary"],
  },
  {
    title: "Archive",
    href: "/archive",
    icon: Archive,
    roles: ["admin", "manager"],
  },
  {
    title: "Reports & Analytics",
    href: "/reports",
    icon: TrendingUp,
    roles: ["admin", "manager"],
  },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  // Animation variants for menu items
  const menuVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.02,
      x: 8,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 300
      }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const iconVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 300
      }
    }
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 shadow-lg border-r border-green-200 dark:border-gray-700 md:block hidden">
      <motion.nav 
        className="p-6"
        variants={menuVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="space-y-2">
          {filteredNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <motion.button
                key={item.href}
                onClick={() => setLocation(item.href)}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                className={cn(
                  "nav-item w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25" 
                    : "text-green-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-gray-700 hover:text-green-800 dark:hover:text-white"
                )}
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                {/* Background animation for active state */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-20"
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                )}
                
                <div className="flex items-center relative z-10">
                  <motion.div
                    variants={iconVariants}
                    initial="rest"
                    whileHover="hover"
                  >
                    <Icon className={cn(
                      "w-5 h-5 mr-3 transition-colors duration-300",
                      isActive ? "text-white" : "text-green-600 dark:text-gray-400"
                    )} />
                  </motion.div>
                  <span className="font-medium">{item.title}</span>
                </div>
                
                {/* Animated chevron for active state */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0, 
                    x: isActive ? 0 : -10 
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </motion.div>
                
                {/* Hover ripple effect */}
                <motion.div
                  className="absolute inset-0 bg-green-200 dark:bg-gray-600 rounded-xl opacity-0 group-hover:opacity-10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            );
          })}
        </motion.div>
      </motion.nav>
    </aside>
  );
}
