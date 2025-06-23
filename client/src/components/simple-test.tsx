import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SimpleTest() {
  const [count, setCount] = useState(0);

  const testSaveToLocalStorage = () => {
    const testData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'yesterdayProduction',
      data: { 'Test Field': '123' },
      stats: { total: 123, average: 123, max: 123, min: 123 }
    };
    
    const existing = JSON.parse(localStorage.getItem('operationsData') || '[]');
    existing.push(testData);
    localStorage.setItem('operationsData', JSON.stringify(existing));
    
    console.log('Saved test data:', testData);
    console.log('All data now:', existing);
    setCount(count + 1);
  };

  const testSaveLoadingData = () => {
    const testData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'yesterdayLoading',
      data: { 'Test Loading': '456' },
      stats: { total: 456, average: 456, max: 456, min: 456 }
    };
    
    const existing = JSON.parse(localStorage.getItem('operationsData') || '[]');
    existing.push(testData);
    localStorage.setItem('operationsData', JSON.stringify(existing));
    
    console.log('Saved loading test data:', testData);
    console.log('All data now:', existing);
    setCount(count + 1);
  };

  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle>Direct localStorage Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Test saving data directly to localStorage - Count: {count}</p>
        <div className="flex gap-2">
          <Button onClick={testSaveToLocalStorage} variant="outline">
            Save Test Production Data
          </Button>
          <Button onClick={testSaveLoadingData} variant="outline">
            Save Test Loading Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}