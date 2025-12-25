import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModernButtonProps extends ButtonProps {
  gradient?: boolean;
  shadow?: boolean;
}

const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant = "default" as const, gradient = false, shadow = true, ...props }, ref) => {
    const getVariantClasses = () => {
      const v = variant as string;
      switch (v) {
        case "default":
          return gradient
            ? "bg-gradient-to-r from-dashboard-primary to-dashboard-primary/80 hover:from-dashboard-primary/90 hover:to-dashboard-primary/70 text-white"
            : "bg-dashboard-primary hover:bg-dashboard-primary/90 text-white";
        case "secondary":
          return "bg-dashboard-secondary hover:bg-dashboard-secondary/90 text-white";
        case "accent":
          return gradient
            ? "bg-gradient-to-r from-dashboard-accent to-dashboard-accent/80 hover:from-dashboard-accent/90 hover:to-dashboard-accent/70 text-white"
            : "bg-dashboard-accent hover:bg-dashboard-accent/90 text-white";
        case "destructive":
          return "bg-dashboard-error hover:bg-dashboard-error/90 text-white";
        case "outline":
          return "border-2 border-dashboard-primary/20 hover:border-dashboard-primary/50 hover:bg-dashboard-primary/5 text-dashboard-text-light dark:text-dashboard-text-dark";
        case "ghost":
          return "hover:bg-dashboard-primary/10 text-dashboard-text-light dark:text-dashboard-text-dark hover:text-dashboard-primary";
        default:
          return "";
      }
    };

    const shadowClasses = shadow ? "shadow-lg hover:shadow-xl transition-shadow duration-200" : "";

    return (
      <Button
        className={cn(
          "font-medium py-2 px-4 rounded-xl transition-all duration-200",
          getVariantClasses(),
          shadowClasses,
          className
        )}
        variant="ghost" // Reset base variant to avoid conflicts
        ref={ref}
        {...props}
      />
    );
  }
);

ModernButton.displayName = "ModernButton";

export { ModernButton };