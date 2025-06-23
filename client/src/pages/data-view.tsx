import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { 
  Database, 
  Calendar,
  Users,
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  Clock
} from "lucide-react";

interface DataEntry {
  id: string;
  timestamp: string;
  type: 'employee' | 'operations' | 'staffCount';
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
  const [filter, setFilter] = useState<'all' | 'employee' | 'operations' | 'staffCount'>('all');

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadStoredData = () => {
      const storedData = localStorage.getItem('operationsData');
      if (storedData) {
        setAllData(JSON.parse(storedData));
      }
    };
    loadStoredData();
  }, []);

  // Sample data for demonstration (in real app, this would come from backend)
  useEffect(() => {
    if (allData.length === 0) {
      const sampleData: DataEntry[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          type: 'employee',
          data: {
            'Total employees today': '85',
            'Permanent employees': '65',
            'Non-permanent employees': '20',
            'Day - Start of work': '42',
            'Day - Giving up': '8',
            'Night - Start of work': '35',
            'Night - Giving up': '5'
          },
          stats: { total: 260, average: 37.1, max: 85, min: 5 }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'operations',
          data: {
            'Day - Ice cream': '250',
            'Night - Ice cream': '180',
            'Day - Albany': '45',
            'Night - Albany': '32',
            'Day - Do': '15',
            'Night - Do': '12'
          },
          stats: { total: 534, average: 89.0, max: 250, min: 12 }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          type: 'staffCount',
          data: {
            'Day - Ice cream': '25',
            'Night - Ice cream': '18',
            'Day - Albany': '12',
            'Night - Albany': '8',
            'Day - Do': '6',
            'Night - Do': '4'
          },
          stats: { total: 73, average: 12.2, max: 25, min: 4 }
        }
      ];
      setAllData(sampleData);
      localStorage.setItem('operationsData', JSON.stringify(sampleData));
    }
  }, [allData.length]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employee': return <Users className="w-4 h-4" />;
      case 'operations': return <BarChart3 className="w-4 h-4" />;
      case 'staffCount': return <TrendingUp className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'employee': return 'bg-blue-100 text-blue-800';
      case 'operations': return 'bg-green-100 text-green-800';
      case 'staffCount': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'employee': return 'Employee Tracking';
      case 'operations': return 'Operations Tracking';
      case 'staffCount': return 'Staff Count Tracking';
      default: return 'Unknown';
    }
  };

  const filteredData = filter === 'all' ? allData : allData.filter(entry => entry.type === filter);

  const exportData = () => {
    const dataStr = JSON.stringify(filteredData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `operations-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const refreshData = () => {
    const storedData = localStorage.getItem('operationsData');
    if (storedData) {
      setAllData(JSON.parse(storedData));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Operations Data View</h2>
        <p className="text-gray-600">View and analyze all saved operational data entries</p>
      </div>

      {/* Filter and Actions Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Data
          </Button>
          <Button
            variant={filter === 'employee' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('employee')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Employee
          </Button>
          <Button
            variant={filter === 'operations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('operations')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Operations
          </Button>
          <Button
            variant={filter === 'staffCount' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('staffCount')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Staff Count
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employee Entries</p>
                <p className="text-2xl font-bold">{allData.filter(d => d.type === 'employee').length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Operations Entries</p>
                <p className="text-2xl font-bold">{allData.filter(d => d.type === 'operations').length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff Count Entries</p>
                <p className="text-2xl font-bold">{allData.filter(d => d.type === 'staffCount').length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Entries */}
      <div className="space-y-6">
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'No operational data entries have been saved yet.'
                  : `No ${getTypeName(filter)} entries found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getTypeColor(entry.type)}>
                        {getTypeIcon(entry.type)}
                        <span className="ml-1">{getTypeName(entry.type)}</span>
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Data Fields */}
                    <div className="lg:col-span-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Fields</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(entry.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">{key}</span>
                            <span className="text-sm font-bold">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Statistics */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Statistics</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-700">{entry.stats.total}</div>
                          <div className="text-xs text-blue-600">Total</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-700">{entry.stats.average.toFixed(1)}</div>
                          <div className="text-xs text-green-600">Average</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <div className="text-sm font-bold text-indigo-700">{entry.stats.max}</div>
                            <div className="text-xs text-indigo-600">Max</div>
                          </div>
                          <div className="p-2 bg-red-50 rounded-lg">
                            <div className="text-sm font-bold text-red-700">{entry.stats.min}</div>
                            <div className="text-xs text-red-600">Min</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}