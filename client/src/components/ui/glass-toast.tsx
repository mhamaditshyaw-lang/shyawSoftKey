import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface GlassToastProps extends Toast {
  onRemove: (id: string) => void;
}

export function GlassToast({ 
  id, 
  title, 
  description, 
  type = 'info', 
  duration = 5000, 
  onRemove 
}: GlassToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />
  };

  const variants = {
    success: "border-green-500/50",
    error: "border-red-500/50", 
    warning: "border-yellow-500/50",
    info: "border-blue-500/50"
  };

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 shadow-xl border-l-4 transition-all duration-300 transform",
        variants[type],
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="flex items-start space-x-3">
        {icons[type]}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-black dark:text-white">
            {title}
          </p>
          {description && (
            <p className="text-sm text-black/70 dark:text-white/70 mt-1">
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(id), 300);
          }}
          className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast Container Component
interface GlassToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function GlassToastContainer({ toasts, onRemove }: GlassToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <GlassToast key={toast.id} {...toast} onRemove={onRemove} />
      ))}
    </div>
  );
}