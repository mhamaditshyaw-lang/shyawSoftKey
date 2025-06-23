import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  BarChart3, 
  Clock, 
  Truck, 
  TrendingUp,
  RefreshCw,
  Download,
  Database,
  Search
} from "lucide-react";

interface DataEntry {
  id: string;
  timestamp: string;
  type: string;
  data: Record<string, string>;
  stats: {
    total: number;
    average: number;
    max: number;
    min: number;
  };
}

export default function DataViewPage() {
  const [allData, setAllData] = useState<DataEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employee': return <Users className="w-4 h-4 text-blue-600" />;
      case 'operations': return <BarChart3 className="w-4 h-4 text-green-600" />;
      case 'staffCount': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'yesterdayProduction': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'yesterdayLoading': return <Truck className="w-4 h-4 text-teal-600" />;
      default: return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'employee': return 'Employee';
      case 'operations': return 'Operations';
      case 'staffCount': return 'Staff Count';
      case 'yesterdayProduction': return 'Production';
      case 'yesterdayLoading': return 'Loading';
      default: return type;
    }
  };

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const storedData = localStorage.getItem('operationsData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setAllData(parsedData);
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Filter data
  const filteredData = (() => {
    let data = filter === 'all' ? allData : allData.filter(d => d.type === filter);
    
    if (searchTerm) {
      data = data.filter(entry => 
        getTypeName(entry.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(entry.data).some(value => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        new Date(entry.timestamp).toLocaleDateString().includes(searchTerm)
      );
    }
    
    return data;
  })();

  const refreshData = () => {
    const storedData = localStorage.getItem('operationsData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setAllData(parsedData);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `operations-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Data View</h1>
        <p className="text-gray-600">View and search operational data entries</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'employee' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('employee')}
          >
            <Users className="w-4 h-4 mr-1" />
            Employee
          </Button>
          <Button
            variant={filter === 'operations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('operations')}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Operations
          </Button>
          <Button
            variant={filter === 'staffCount' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('staffCount')}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Staff
          </Button>
          <Button
            variant={filter === 'yesterdayProduction' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('yesterdayProduction')}
          >
            <Clock className="w-4 h-4 mr-1" />
            Production
          </Button>
          <Button
            variant={filter === 'yesterdayLoading' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('yesterdayLoading')}
          >
            <Truck className="w-4 h-4 mr-1" />
            Loading
          </Button>
          
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      {filteredData.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {allData.length === 0 ? "No data available" : "No matching data found"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredData.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(entry.type)}
                    <CardTitle className="text-lg">{getTypeName(entry.type)}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(entry.timestamp).toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {Object.entries(entry.data).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">{key}</div>
                      <div className="font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total: </span>
                      <span className="font-semibold text-blue-600">{entry.stats.total.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg: </span>
                      <span className="font-semibold text-green-600">{entry.stats.average.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Max: </span>
                      <span className="font-semibold text-orange-600">{entry.stats.max}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Min: </span>
                      <span className="font-semibold text-red-600">{entry.stats.min}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}