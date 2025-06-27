import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button';
  lines?: number;
}

export function LoadingSkeleton({ className, variant = 'text', lines = 1 }: LoadingSkeletonProps) {
  const baseStyles = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]";
  
  const variants = {
    text: "h-4 rounded",
    card: "h-32 rounded-2xl",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 rounded-xl"
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseStyles,
              variants.text,
              index === lines - 1 && "w-3/4",
              className
            )}
            style={{
              animation: `pulse 2s ease-in-out ${index * 0.2}s infinite`
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        className
      )}
      style={{
        animation: "shimmer 2s ease-in-out infinite",
        backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
      }}
    />
  );
}

// Specialized loading components
export function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <LoadingSkeleton variant="avatar" />
        <div className="space-y-2 flex-1">
          <LoadingSkeleton className="h-4 w-1/4" />
          <LoadingSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      <LoadingSkeleton lines={3} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {/* Header */}
        {Array.from({ length: columns }).map((_, index) => (
          <LoadingSkeleton key={`header-${index}`} className="h-4" />
        ))}
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) =>
          Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton 
              key={`row-${rowIndex}-col-${colIndex}`} 
              className="h-3" 
            />
          ))
        )}
      </div>
    </div>
  );
}