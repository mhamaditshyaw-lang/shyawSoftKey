import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon: React.ElementType;
  description?: string;
  color?: "primary" | "accent" | "secondary" | "error";
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  description,
  color = "primary" 
}: StatsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return {
          iconBg: "bg-dashboard-primary/10",
          iconColor: "text-dashboard-primary",
          gradient: "from-dashboard-primary/5 to-transparent"
        };
      case "accent":
        return {
          iconBg: "bg-dashboard-accent/10",
          iconColor: "text-dashboard-accent",
          gradient: "from-dashboard-accent/5 to-transparent"
        };
      case "secondary":
        return {
          iconBg: "bg-dashboard-secondary/10",
          iconColor: "text-dashboard-secondary",
          gradient: "from-dashboard-secondary/5 to-transparent"
        };
      case "error":
        return {
          iconBg: "bg-dashboard-error/10",
          iconColor: "text-dashboard-error",
          gradient: "from-dashboard-error/5 to-transparent"
        };
      default:
        return {
          iconBg: "bg-dashboard-primary/10",
          iconColor: "text-dashboard-primary",
          gradient: "from-dashboard-primary/5 to-transparent"
        };
    }
  };

  const colorClasses = getColorClasses(color);

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "increase":
        return <ArrowUpRight className="h-3 w-3" />;
      case "decrease":
        return <ArrowDownRight className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case "increase":
        return "text-dashboard-accent bg-dashboard-accent/10";
      case "decrease":
        return "text-dashboard-error bg-dashboard-error/10";
      default:
        return "text-dashboard-secondary bg-dashboard-secondary/10";
    }
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-dashboard-primary/5 border-dashboard-secondary/10">
      <div className={cn("absolute inset-0 bg-gradient-to-br", colorClasses.gradient)} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-medium text-dashboard-secondary dark:text-dashboard-text-dark">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-md", colorClasses.iconBg)}>
          <Icon className={cn("h-4 w-4", colorClasses.iconColor)} />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold text-dashboard-text-light dark:text-dashboard-text-dark">
          {value}
        </div>
        {description && (
          <p className="text-xs text-dashboard-secondary/60 dark:text-dashboard-text-dark/60 mt-1">
            {description}
          </p>
        )}
        {change && (
          <div className="flex items-center mt-2">
            <Badge 
              variant="secondary" 
              className={cn("text-xs px-2 py-1 flex items-center gap-1", getChangeColor(change.type))}
            >
              {getChangeIcon(change.type)}
              {Math.abs(change.value)}%
            </Badge>
            <span className="text-xs text-dashboard-secondary/60 dark:text-dashboard-text-dark/60 ml-2">
              vs last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats?: {
    totalUsers?: number;
    activeUsers?: number;
    totalTodos?: number;
    completedTodos?: number;
    pendingTodos?: number;
    totalRequests?: number;
    pendingRequests?: number;
  };
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-dashboard-secondary/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const completionRate = stats?.totalTodos 
    ? Math.round(((stats.completedTodos || 0) / stats.totalTodos) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={t("totalUsers")}
        value={stats?.totalUsers || 0}
        icon={Users}
        description="Active employees"
        color="primary"
        change={{
          value: 12,
          type: "increase"
        }}
      />
      <StatsCard
        title={t("activeTasks")}
        value={stats?.pendingTodos || 0}
        icon={CheckSquare}
        description="Tasks in progress"
        color="accent"
        change={{
          value: 8,
          type: "increase"
        }}
      />
      <StatsCard
        title={t("completionRate")}
        value={`${completionRate}%`}
        icon={TrendingUp}
        description="Task completion rate"
        color="secondary"
        change={{
          value: 5,
          type: "increase"
        }}
      />
      <StatsCard
        title={t("pendingReviews")}
        value={stats?.pendingRequests || 0}
        icon={Calendar}
        description="Employee evaluations"
        color="error"
        change={{
          value: 3,
          type: "decrease"
        }}
      />
    </div>
  );
}