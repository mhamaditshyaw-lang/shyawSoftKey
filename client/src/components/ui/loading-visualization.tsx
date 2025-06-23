import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Truck, Factory, Users, Zap, CheckCircle } from "lucide-react";

interface LoadingStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
  color: string;
}

interface LoadingVisualizationProps {
  isLoading: boolean;
  steps?: LoadingStep[];
  onComplete?: () => void;
  title?: string;
}

const defaultSteps: LoadingStep[] = [
  { id: "initializing", label: "Initializing systems", icon: Zap, duration: 800, color: "text-blue-500" },
  { id: "processing", label: "Processing data", icon: Factory, duration: 1200, color: "text-green-500" },
  { id: "validating", label: "Validating inputs", icon: CheckCircle, duration: 600, color: "text-purple-500" },
  { id: "saving", label: "Saving to database", icon: Users, duration: 900, color: "text-orange-500" },
  { id: "finalizing", label: "Finalizing operations", icon: Truck, duration: 500, color: "text-teal-500" },
];

export function LoadingVisualization({ 
  isLoading, 
  steps = defaultSteps, 
  onComplete,
  title = "Processing Your Request"
}: LoadingVisualizationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 100);

    return () => clearInterval(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading || currentStep >= steps.length) {
      if (currentStep >= steps.length && onComplete) {
        onComplete();
      }
      return;
    }

    const step = steps[currentStep];
    const timeout = setTimeout(() => {
      setCompletedSteps(prev => [...prev, step.id]);
      setCurrentStep(prev => prev + 1);
    }, step.duration);

    return () => clearTimeout(timeout);
  }, [isLoading, currentStep, steps, onComplete]);

  if (!isLoading) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 1
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Clock className="w-8 h-8 text-blue-500" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full inline-block">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: isCurrent ? 1.02 : 1
                  }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : isCurrent 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="relative">
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Icon 
                        className={`w-5 h-5 ${
                          isCompleted 
                            ? 'text-green-600' 
                            : isCurrent 
                              ? step.color 
                              : 'text-gray-400'
                        }`} 
                      />
                    </motion.div>
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1"
                      >
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      isCompleted 
                        ? 'text-green-800 dark:text-green-300' 
                        : isCurrent 
                          ? 'text-blue-800 dark:text-blue-300' 
                          : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </div>
                    {isCurrent && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: step.duration / 1000 }}
                        className="h-1 bg-blue-500 rounded-full mt-1"
                      />
                    )}
                  </div>

                  <div className="text-xs text-gray-400 font-mono">
                    {isCompleted ? '✓' : isPending ? '...' : formatTime(currentTime).slice(-6)}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Fun Animation Elements */}
          <div className="mt-6 flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-5, 5, -5],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for easy usage
export function useLoadingVisualization() {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return {
    isLoading,
    startLoading,
    stopLoading,
    LoadingComponent: (props: Omit<LoadingVisualizationProps, 'isLoading'>) => (
      <LoadingVisualization {...props} isLoading={isLoading} />
    )
  };
}