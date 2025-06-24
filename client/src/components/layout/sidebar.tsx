import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
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

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="p-6">
        <div className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <button
                key={item.href}
                onClick={() => setLocation(item.href)}
                className={cn(
                  "nav-item w-full flex items-center px-4 py-3 text-left text-gray-700 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors",
                  isActive && "active bg-primary text-primary-foreground"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.title}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
