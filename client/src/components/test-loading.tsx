import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingVisualization, useLoadingVisualization } from "@/components/ui/loading-visualization";
import { Save, Calculator, Users, Database, CheckCircle } from "lucide-react";

export function TestLoading() {
  const { isLoading, startLoading, stopLoading } = useLoadingVisualization();

  const handleTest = async () => {
    startLoading();
    await new Promise(resolve => setTimeout(resolve, 4000));
    stopLoading();
  };

  return (
    <div className="p-4">
      <Button onClick={handleTest} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Test Loading'}
      </Button>
      
      <LoadingVisualization 
        isLoading={isLoading} 
        title="Test Loading Process"
        steps={[
          { id: "validate", label: "Validating data", icon: CheckCircle, duration: 800, color: "text-blue-500" },
          { id: "calculate", label: "Calculating", icon: Calculator, duration: 1000, color: "text-green-500" },
          { id: "process", label: "Processing", icon: Users, duration: 700, color: "text-purple-500" },
          { id: "save", label: "Saving", icon: Database, duration: 900, color: "text-orange-500" },
          { id: "complete", label: "Completing", icon: Save, duration: 500, color: "text-teal-500" },
        ]}
      />
    </div>
  );
}