import { ReactNode } from "react";
import { HelpCircle, Info, AlertCircle, Lightbulb } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  content: string | ReactNode;
  children?: ReactNode;
  type?: "info" | "help" | "warning" | "tip";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  triggerClassName?: string;
  maxWidth?: string;
  showIcon?: boolean;
}

const iconMap = {
  info: Info,
  help: HelpCircle,
  warning: AlertCircle,
  tip: Lightbulb,
};

const colorMap = {
  info: "text-blue-500 hover:text-blue-600",
  help: "text-gray-500 hover:text-gray-600",
  warning: "text-orange-500 hover:text-orange-600",
  tip: "text-yellow-500 hover:text-yellow-600",
};

export function HelpTooltip({
  content,
  children,
  type = "help",
  side = "top",
  className,
  triggerClassName,
  maxWidth = "280px",
  showIcon = true,
}: HelpTooltipProps) {
  const Icon = iconMap[type];

  const trigger = children || (
    showIcon && (
      <Icon 
        className={cn(
          "h-4 w-4 cursor-help transition-colors",
          colorMap[type],
          triggerClassName
        )}
      />
    )
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center">
            {trigger}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className={cn(
            "text-sm p-3 shadow-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            className
          )}
          style={{ maxWidth }}
        >
          {typeof content === "string" ? (
            <div className="space-y-1">
              {content.split('\n').map((line, index) => (
                <p key={index} className="text-sm">
                  {line}
                </p>
              ))}
            </div>
          ) : (
            content
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Specialized tooltip components for different use cases
export function FeatureTooltip({ feature, description, shortcut, ...props }: {
  feature: string;
  description: string;
  shortcut?: string;
} & Omit<HelpTooltipProps, 'content'>) {
  return (
    <HelpTooltip
      type="info"
      content={
        <div className="space-y-2">
          <div className="font-semibold text-blue-600 dark:text-blue-400">
            {feature}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {description}
          </div>
          {shortcut && (
            <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
              {shortcut}
            </div>
          )}
        </div>
      }
      {...props}
    />
  );
}

export function RoleTooltip({ role, permissions, ...props }: {
  role: string;
  permissions: string[];
} & Omit<HelpTooltipProps, 'content'>) {
  return (
    <HelpTooltip
      type="info"
      content={
        <div className="space-y-2">
          <div className="font-semibold text-indigo-600 dark:text-indigo-400">
            {role} Role
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            This role has access to:
          </div>
          <ul className="text-xs space-y-1">
            {permissions.map((permission, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                {permission}
              </li>
            ))}
          </ul>
        </div>
      }
      {...props}
    />
  );
}

export function StatusTooltip({ status, description, nextAction, ...props }: {
  status: string;
  description: string;
  nextAction?: string;
} & Omit<HelpTooltipProps, 'content'>) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'inactive': return 'text-red-600 dark:text-red-400';
      case 'approved': return 'text-blue-600 dark:text-blue-400';
      case 'rejected': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <HelpTooltip
      type="info"
      content={
        <div className="space-y-2">
          <div className={cn("font-semibold", getStatusColor(status))}>
            {status} Status
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {description}
          </div>
          {nextAction && (
            <div className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
              Next: {nextAction}
            </div>
          )}
        </div>
      }
      {...props}
    />
  );
}

export function ActionTooltip({ action, description, danger, ...props }: {
  action: string;
  description: string;
  danger?: boolean;
} & Omit<HelpTooltipProps, 'content'>) {
  return (
    <HelpTooltip
      type={danger ? "warning" : "tip"}
      content={
        <div className="space-y-2">
          <div className={cn(
            "font-semibold",
            danger ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
          )}>
            {action}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {description}
          </div>
          {danger && (
            <div className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded">
              ⚠️ This action cannot be undone
            </div>
          )}
        </div>
      }
      {...props}
    />
  );
}