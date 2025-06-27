import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GlassBadge({ children, variant = 'default', size = 'md', className }: GlassBadgeProps) {
  const baseStyles = "glass-button inline-flex items-center font-medium rounded-full transition-all duration-300";
  
  const variants = {
    default: "bg-gray-100/50 dark:bg-gray-800/50 text-black dark:text-white border-gray-300/50 dark:border-gray-600/50",
    success: "bg-green-100/50 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-300/50 dark:border-green-600/50",
    warning: "bg-yellow-100/50 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-300/50 dark:border-yellow-600/50",
    danger: "bg-red-100/50 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-300/50 dark:border-red-600/50",
    info: "bg-blue-100/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-300/50 dark:border-blue-600/50"
  };
  
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}