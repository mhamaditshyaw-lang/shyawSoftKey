import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/20",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-sm shadow-secondary/20",
        destructive:
          "border-transparent bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground shadow-sm shadow-destructive/20",
        success:
          "border-transparent bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-sm shadow-accent/20",
        warning:
          "border-transparent bg-gradient-to-r from-warning to-warning/80 text-warning-foreground shadow-sm shadow-warning/20",
        outline: "border-border/50 text-foreground bg-muted/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
