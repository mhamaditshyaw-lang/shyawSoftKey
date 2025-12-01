import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
  steps: TourStep[];
  currentStep: number;
  isActive: boolean;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setSteps: (steps: TourStep[]) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startTour = () => setIsActive(true);
  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
  };
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <TourContext.Provider
      value={{ steps, currentStep, isActive, startTour, endTour, nextStep, prevStep, setSteps }}
    >
      {children}
      <TourOverlay />
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};

const TourOverlay: React.FC = () => {
  const { steps, currentStep, isActive, endTour, nextStep, prevStep } = useTour();

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  const targetElement = document.querySelector(`[data-tour-id="${step.target}"]`);

  if (!targetElement) return null;

  const rect = targetElement.getBoundingClientRect();
  const padding = 8;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={endTour}
      />

      {/* Highlight Box */}
      <motion.div
        className="fixed border-2 border-blue-500 rounded-lg shadow-lg pointer-events-auto"
        style={{
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      />

      {/* Tooltip */}
      <motion.div
        className="fixed bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 max-w-xs z-50 pointer-events-auto"
        style={{
          top:
            step.position === 'top'
              ? rect.top - 150
              : step.position === 'bottom'
                ? rect.bottom + 20
                : rect.top + rect.height / 2 - 50,
          left:
            step.position === 'left'
              ? rect.left - 350
              : step.position === 'right'
                ? rect.right + 20
                : rect.left + rect.width / 2 - 160,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-blue-600 dark:text-blue-400">{step.title}</h3>
          <button
            onClick={endTour}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-lg leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{step.description}</p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {currentStep + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
