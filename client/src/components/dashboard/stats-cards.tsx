import { 
  Users, 
  CheckSquare, 
  Calendar, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon
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
  icon: LucideIcon;
  description?: string;
  color?: "blue" | "green" | "purple" | "orange";
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  description,
  color = "blue" 
}: StatsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          iconBg: "bg-[#e4f0f6] dark:bg-[#1d3557]",
          iconColor: "text-[#0079bf]",
        };
      case "green":
        return {
          iconBg: "bg-[#e4f7e4] dark:bg-[#1a4025]",
          iconColor: "text-[#61bd4f]",
        };
      case "purple":
        return {
          iconBg: "bg-[#f4e8fc] dark:bg-[#3d2952]",
          iconColor: "text-[#9c5bb5]",
        };
      case "orange":
        return {
          iconBg: "bg-[#fff4e5] dark:bg-[#3d2d1a]",
          iconColor: "text-[#ff9f1a]",
        };
      default:
        return {
          iconBg: "bg-[#e4f0f6] dark:bg-[#1d3557]",
          iconColor: "text-[#0079bf]",
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="trello-card p-5" data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("trello-stat-icon", colorClasses.iconBg)}>
          <Icon className={cn("w-5 h-5", colorClasses.iconColor)} />
        </div>
        {change && change.value !== 0 && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            change.type === "increase" 
              ? "text-[#61bd4f] bg-[#e4f7e4] dark:bg-[#1a4025]" 
              : change.type === "decrease"
              ? "text-[#eb5a46] bg-[#fce4e4] dark:bg-[#4a1f1f]"
              : "text-muted-foreground bg-muted"
          )}>
            {change.type === "increase" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : change.type === "decrease" ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : null}
            {Math.abs(change.value)}%
          </div>
        )}
      </div>
      
      <div className="trello-stat-value">{value}</div>
      <div className="trello-stat-label">{title}</div>
      
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </div>
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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const completionRate = stats?.totalTodos 
    ? Math.round(((stats.completedTodos || 0) / stats.totalTodos) * 100)
    : 0;

  const taskRate = stats?.totalTodos 
    ? Math.round(((stats.pendingTodos || 0) / stats.totalTodos) * 100) 
    : 0;
  
  const reviewRate = stats?.totalRequests 
    ? Math.round(((stats.pendingRequests || 0) / stats.totalRequests) * 100) 
    : 0;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={t("totalUsers")}
        value={stats?.totalUsers || 0}
        icon={Users}
        description="Active employees"
        color="blue"
        change={stats?.activeUsers ? {
          value: Math.round((stats.activeUsers / Math.max(stats.totalUsers || 1, 1)) * 100),
          type: stats.activeUsers >= (stats.totalUsers || 0) ? "increase" : "neutral"
        } : undefined}
      />
      <StatsCard
        title={t("activeTasks")}
        value={stats?.pendingTodos || 0}
        icon={CheckSquare}
        description="Tasks in progress"
        color="green"
        change={taskRate > 0 ? {
          value: taskRate,
          type: taskRate > 50 ? "increase" : "neutral"
        } : undefined}
      />
      <StatsCard
        title={t("completionRate")}
        value={`${completionRate}%`}
        icon={TrendingUp}
        description="Task completion rate"
        color="purple"
        change={completionRate > 0 ? {
          value: completionRate,
          type: completionRate >= 50 ? "increase" : completionRate > 0 ? "neutral" : "decrease"
        } : undefined}
      />
      <StatsCard
        title={t("pendingReviews")}
        value={stats?.pendingRequests || 0}
        icon={Calendar}
        description="Employee evaluations"
        color="orange"
        change={reviewRate > 0 ? {
          value: reviewRate,
          type: reviewRate > 50 ? "increase" : "decrease"
        } : undefined}
      />
    </div>
  );
}
