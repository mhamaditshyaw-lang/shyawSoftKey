import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GlassButton({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className, 
  ...props 
}: GlassButtonProps) {
  const baseStyles = "glass-button rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10",
    primary: "bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80",
    secondary: "bg-gray-500 dark:bg-gray-400 text-white dark:text-black hover:bg-gray-600 dark:hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}