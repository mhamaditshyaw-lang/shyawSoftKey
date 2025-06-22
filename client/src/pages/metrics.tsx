import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Plus, 
  Save,
  Calculator,
  BarChart3,
  TrendingUp
} from "lucide-react";

export default function MetricsPage() {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    number1: "",
    number2: "",
    number3: "",
    number4: "",
    number5: "",
    number6: "",
    number7: "",
  });

  const handleInputChange = (field: string, value: string) => {
    // Only allow numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert strings to numbers for calculation
    const numbers = Object.values(formData).map(val => parseFloat(val) || 0);
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);

    toast({
      title: "Numbers Saved Successfully",
      description: `Sum: ${sum.toFixed(2)} | Average: ${average.toFixed(2)} | Max: ${max} | Min: ${min}`,
    });

    // Reset form
    setFormData({
      number1: "",
      number2: "",
      number3: "",
      number4: "",
      number5: "",
      number6: "",
      number7: "",
    });
  };

  const clearForm = () => {
    setFormData({
      number1: "",
      number2: "",
      number3: "",
      number4: "",
      number5: "",
      number6: "",
      number7: "",
    });
  };

  const calculateStats = () => {
    const numbers = Object.values(formData)
      .filter(val => val !== "")
      .map(val => parseFloat(val));
    
    if (numbers.length === 0) return null;

    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);

    return { sum, average, max, min, count: numbers.length };
  };

  const stats = calculateStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Number Input</h2>
        <p className="text-gray-600">Enter up to 7 numbers for calculation and tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Input Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span>Enter Numbers</span>
              </CardTitle>
              <CardDescription>
                Input numerical values in the fields below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 7 }, (_, index) => {
                    const fieldName = `number${index + 1}` as keyof typeof formData;
                    return (
                      <motion.div
                        key={fieldName}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor={fieldName} className="text-sm font-medium">
                          Number {index + 1}
                        </Label>
                        <Input
                          id={fieldName}
                          type="text"
                          placeholder={`Enter number ${index + 1}`}
                          value={formData[fieldName]}
                          onChange={(e) => handleInputChange(fieldName, e.target.value)}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button 
                    type="submit" 
                    className="flex items-center space-x-2"
                    disabled={Object.values(formData).every(val => val === "")}
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Numbers</span>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={clearForm}
                    disabled={Object.values(formData).every(val => val === "")}
                  >
                    Clear All
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span>Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-4">
                  <motion.div 
                    className="bg-blue-50 p-4 rounded-lg"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-2xl font-bold text-blue-700">
                      {stats.sum.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-600">Total Sum</div>
                  </motion.div>

                  <motion.div 
                    className="bg-green-50 p-4 rounded-lg"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="text-2xl font-bold text-green-700">
                      {stats.average.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600">Average</div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3">
                    <motion.div 
                      className="bg-purple-50 p-3 rounded-lg"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <div className="text-lg font-bold text-purple-700">
                        {stats.max}
                      </div>
                      <div className="text-xs text-purple-600">Maximum</div>
                    </motion.div>

                    <motion.div 
                      className="bg-orange-50 p-3 rounded-lg"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <div className="text-lg font-bold text-orange-700">
                        {stats.min}
                      </div>
                      <div className="text-xs text-orange-600">Minimum</div>
                    </motion.div>
                  </div>

                  <motion.div 
                    className="bg-gray-50 p-4 rounded-lg"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <div className="text-lg font-bold text-gray-700">
                      {stats.count} / 7
                    </div>
                    <div className="text-sm text-gray-600">Numbers Entered</div>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Enter numbers to see statistics</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  // Fill with sample data
                  setFormData({
                    number1: "10",
                    number2: "20",
                    number3: "30",
                    number4: "40",
                    number5: "50",
                    number6: "60",
                    number7: "70",
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Fill Sample Data
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  // Fill with random numbers
                  setFormData({
                    number1: Math.floor(Math.random() * 100).toString(),
                    number2: Math.floor(Math.random() * 100).toString(),
                    number3: Math.floor(Math.random() * 100).toString(),
                    number4: Math.floor(Math.random() * 100).toString(),
                    number5: Math.floor(Math.random() * 100).toString(),
                    number6: Math.floor(Math.random() * 100).toString(),
                    number7: Math.floor(Math.random() * 100).toString(),
                  });
                }}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Generate Random
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}