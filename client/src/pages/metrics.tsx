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

  const [deviceData, setDeviceData] = useState({
    device1: "",
    device2: "",
    device3: "",
    device4: "",
    device5: "",
    device6: "",
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

  const handleDeviceInputChange = (field: string, value: string) => {
    // Only allow numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDeviceData(prev => ({
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
      title: "Employee Data Saved Successfully",
      description: `Total: ${sum.toFixed(0)} | Average: ${average.toFixed(1)} | Max: ${max} | Min: ${min}`,
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

  const handleDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert strings to numbers for calculation
    const deviceNumbers = Object.values(deviceData).map(val => parseFloat(val) || 0);
    const deviceSum = deviceNumbers.reduce((acc, num) => acc + num, 0);
    const deviceAverage = deviceSum / deviceNumbers.length;
    const deviceMax = Math.max(...deviceNumbers);
    const deviceMin = Math.min(...deviceNumbers);

    toast({
      title: "Operations Data Saved Successfully",
      description: `Total: ${deviceSum.toFixed(0)} | Average: ${deviceAverage.toFixed(1)} | Max: ${deviceMax} | Min: ${deviceMin}`,
    });

    // Reset device form
    setDeviceData({
      device1: "",
      device2: "",
      device3: "",
      device4: "",
      device5: "",
      device6: "",
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

  const clearDeviceForm = () => {
    setDeviceData({
      device1: "",
      device2: "",
      device3: "",
      device4: "",
      device5: "",
      device6: "",
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

  const calculateDeviceStats = () => {
    const numbers = Object.values(deviceData)
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
  const deviceStats = calculateDeviceStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Daily Operations Dashboard</h2>
        <p className="text-gray-600">Track employee attendance and operational activities</p>
      </div>

      {/* Employee Tracking Section */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Employee Tracking</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span>Employee Data Entry</span>
              </CardTitle>
              <CardDescription>
                Enter daily employee attendance and shift information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { field: 'number1', label: 'Total employees today', placeholder: 'Enter total employees today' },
                    { field: 'number2', label: 'Permanent employees', placeholder: 'Enter permanent employees count' },
                    { field: 'number3', label: 'Non-permanent employees', placeholder: 'Enter non-permanent employees count' },
                    { field: 'number4', label: 'Day - Start of work', placeholder: 'Enter day shift start count' },
                    { field: 'number5', label: 'Day - Giving up', placeholder: 'Enter day shift giving up count' },
                    { field: 'number6', label: 'Night - Start of work', placeholder: 'Enter night shift start count' },
                    { field: 'number7', label: 'Night - Giving up', placeholder: 'Enter night shift giving up count' },
                  ].map((item, index) => {
                    const fieldName = item.field as keyof typeof formData;
                    return (
                      <motion.div
                        key={fieldName}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor={fieldName} className="text-sm font-medium">
                          {item.label}
                        </Label>
                        <Input
                          id={fieldName}
                          type="text"
                          placeholder={item.placeholder}
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
                    <span>Save Employee Data</span>
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
                    <div className="text-sm text-gray-600">Fields Completed</div>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Enter employee data to see statistics</p>
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
                  // Fill with sample employee data
                  setFormData({
                    number1: "150", // Total employees today
                    number2: "120", // Permanent employees 
                    number3: "30",  // Non-permanent employees
                    number4: "75",  // Day - Start of work
                    number5: "5",   // Day - Giving up
                    number6: "40",  // Night - Start of work
                    number7: "2",   // Night - Giving up
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
                  // Fill with random employee data
                  const totalEmployees = Math.floor(Math.random() * 200) + 50;
                  const permanentEmployees = Math.floor(totalEmployees * 0.7);
                  const nonPermanentEmployees = totalEmployees - permanentEmployees;
                  const dayStart = Math.floor(totalEmployees * 0.6);
                  const nightStart = totalEmployees - dayStart;
                  
                  setFormData({
                    number1: totalEmployees.toString(),
                    number2: permanentEmployees.toString(),
                    number3: nonPermanentEmployees.toString(),
                    number4: dayStart.toString(),
                    number5: Math.floor(Math.random() * 10).toString(),
                    number6: nightStart.toString(),
                    number7: Math.floor(Math.random() * 5).toString(),
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
      </div>

      {/* Device Operations Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Operations Tracking</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Device Input Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span>Operations Data Entry</span>
                </CardTitle>
                <CardDescription>
                  Enter ice cream production, Albany operations, and Do activities by shift
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDeviceSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { field: 'device1', label: 'Day - Ice cream', placeholder: 'Enter day ice cream production' },
                      { field: 'device2', label: 'Night - Ice cream', placeholder: 'Enter night ice cream production' },
                      { field: 'device3', label: 'Day - Albany', placeholder: 'Enter day Albany operations' },
                      { field: 'device4', label: 'Night - Albany', placeholder: 'Enter night Albany operations' },
                      { field: 'device5', label: 'Day - Do', placeholder: 'Enter day Do activities' },
                      { field: 'device6', label: 'Night - Do', placeholder: 'Enter night Do activities' },
                    ].map((item, index) => {
                      const fieldName = item.field as keyof typeof deviceData;
                      return (
                        <motion.div
                          key={fieldName}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                          className="space-y-2"
                        >
                          <Label htmlFor={fieldName} className="text-sm font-medium">
                            {item.label}
                          </Label>
                          <Input
                            id={fieldName}
                            type="text"
                            placeholder={item.placeholder}
                            value={deviceData[fieldName]}
                            onChange={(e) => handleDeviceInputChange(fieldName, e.target.value)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button 
                      type="submit" 
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                      disabled={Object.values(deviceData).every(val => val === "")}
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Operations Data</span>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={clearDeviceForm}
                      disabled={Object.values(deviceData).every(val => val === "")}
                    >
                      Clear All
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Device Statistics Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Operations Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deviceStats ? (
                  <div className="space-y-4">
                    <motion.div 
                      className="bg-green-50 p-4 rounded-lg"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-2xl font-bold text-green-700">
                        {deviceStats.sum.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600">Total Count</div>
                    </motion.div>

                    <motion.div 
                      className="bg-blue-50 p-4 rounded-lg"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="text-2xl font-bold text-blue-700">
                        {deviceStats.average.toFixed(2)}
                      </div>
                      <div className="text-sm text-blue-600">Average</div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-3">
                      <motion.div 
                        className="bg-indigo-50 p-3 rounded-lg"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <div className="text-lg font-bold text-indigo-700">
                          {deviceStats.max}
                        </div>
                        <div className="text-xs text-indigo-600">Maximum</div>
                      </motion.div>

                      <motion.div 
                        className="bg-red-50 p-3 rounded-lg"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <div className="text-lg font-bold text-red-700">
                          {deviceStats.min}
                        </div>
                        <div className="text-xs text-red-600">Minimum</div>
                      </motion.div>
                    </div>

                    <motion.div 
                      className="bg-gray-50 p-4 rounded-lg"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <div className="text-lg font-bold text-gray-700">
                        {deviceStats.count} / 6
                      </div>
                      <div className="text-sm text-gray-600">Fields Completed</div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Enter operations data to see statistics</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operations Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operations Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    // Fill with sample device data
                    setDeviceData({
                      device1: "250", // Day - Ice cream
                      device2: "180", // Night - Ice cream
                      device3: "45",  // Day - Albany
                      device4: "32",  // Night - Albany
                      device5: "15",  // Day - Do
                      device6: "12",  // Night - Do
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
                    // Fill with random device data
                    setDeviceData({
                      device1: Math.floor(Math.random() * 200 + 150).toString(), // Day - Ice cream
                      device2: Math.floor(Math.random() * 150 + 100).toString(), // Night - Ice cream
                      device3: Math.floor(Math.random() * 40 + 20).toString(),   // Day - Albany
                      device4: Math.floor(Math.random() * 30 + 15).toString(),   // Night - Albany
                      device5: Math.floor(Math.random() * 20 + 5).toString(),    // Day - Do
                      device6: Math.floor(Math.random() * 15 + 5).toString(),    // Night - Do
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
      </div>
    </motion.div>
  );
}