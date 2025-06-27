import { cn } from "@/lib/utils";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { GlassButton } from "./glass-button";

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function GlassModal({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md', 
  className 
}: GlassModalProps) {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 dark:bg-white/10 backdrop-blur-lg animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative w-full glass-card rounded-2xl shadow-2xl animate-slide-up",
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-black/20 dark:border-white/20">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              {title}
            </h2>
            <GlassButton
              variant="default"
              size="sm"
              onClick={onClose}
              className="hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </GlassButton>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}