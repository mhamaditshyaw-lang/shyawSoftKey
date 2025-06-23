import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { PreferencesModal } from "@/components/modals/preferences-modal";
import { 
  Users, 
  BarChart3, 
  Clock, 
  Truck, 
  TrendingUp,
  RefreshCw,
  Download,
  Database,
  Settings,
  Search,
  SortAsc,
  SortDesc
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const { preferences, updateDataViewPreferences } = useUserPreferences();

  // Helper functions - defined early to avoid hoisting issues
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employee': return <Users className="w-5 h-5 text-blue-600" />;
      case 'operations': return <BarChart3 className="w-5 h-5 text-green-600" />;
      case 'staffCount': return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'yesterdayProduction': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'yesterdayLoading': return <Truck className="w-5 h-5 text-teal-600" />;
      default: return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'employee': return 'Employee Data';
      case 'operations': return 'Operations Data';
      case 'staffCount': return 'Staff Count Data';
      case 'yesterdayProduction': return 'Yesterday\'s Production';
      case 'yesterdayLoading': return 'Yesterday\'s Loading';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'employee': return 'border-blue-200 bg-blue-50';
      case 'operations': return 'border-green-200 bg-green-50';
      case 'staffCount': return 'border-purple-200 bg-purple-50';
      case 'yesterdayProduction': return 'border-orange-200 bg-orange-50';
      case 'yesterdayLoading': return 'border-teal-200 bg-teal-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  // Load user preferences and set initial filter
  useEffect(() => {
    if (preferences.dataView.defaultFilter !== filter) {
      setFilter(preferences.dataView.defaultFilter);
    }
  }, [preferences.dataView.defaultFilter]);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const storedData = localStorage.getItem('operationsData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setAllData(parsedData);
        console.log('Loaded data:', parsedData);
        console.log('Data types:', [...new Set(parsedData.map((d: any) => d.type))]);
      }
    };

    loadData();
    
    // Use user preference for refresh interval
    if (preferences.dataView.autoRefresh) {
      const interval = setInterval(loadData, preferences.dataView.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [preferences.dataView.autoRefresh, preferences.dataView.refreshInterval]);

  // Filter and sort data based on preferences and search
  const filteredAndSortedData = (() => {
    let data = filter === 'all' ? allData : allData.filter(d => d.type === filter);
    
    // Apply search filter
    if (searchTerm) {
      data = data.filter(entry => 
        getTypeName(entry.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(entry.data).some(value => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        new Date(entry.timestamp).toLocaleDateString().includes(searchTerm)
      );
    }
    
    // Apply sorting based on preferences
    data.sort((a, b) => {
      let aValue, bValue;
      
      switch (preferences.dataView.sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'type':
          aValue = getTypeName(a.type);
          bValue = getTypeName(b.type);
          break;
        case 'total':
          aValue = a.stats.total;
          bValue = b.stats.total;
          break;
        default:
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
      }
      
      if (preferences.dataView.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return data;
  })();

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / preferences.dataView.itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * preferences.dataView.itemsPerPage,
    currentPage * preferences.dataView.itemsPerPage
  );

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const refreshData = () => {
    const storedData = localStorage.getItem('operationsData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setAllData(parsedData);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredAndSortedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `operations-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Save filter preference when changed
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    updateDataViewPreferences({ defaultFilter: newFilter });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data View</h1>
        <p className="text-gray-600">View and manage all operational tracking data</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <Card className="text-center p-4 border-blue-200 bg-blue-50">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-700">
            {allData.filter(d => d.type === 'employee').length}
          </div>
          <div className="text-sm text-blue-600">Employee Records</div>
        </Card>

        <Card className="text-center p-4 border-green-200 bg-green-50">
          <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-700">
            {allData.filter(d => d.type === 'operations').length}
          </div>
          <div className="text-sm text-green-600">Operations Records</div>
        </Card>

        <Card className="text-center p-4 border-purple-200 bg-purple-50">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-700">
            {allData.filter(d => d.type === 'staffCount').length}
          </div>
          <div className="text-sm text-purple-600">Staff Count Records</div>
        </Card>

        <Card className="text-center p-4 border-orange-200 bg-orange-50">
          <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-700">
            {allData.filter(d => d.type === 'yesterdayProduction').length}
          </div>
          <div className="text-sm text-orange-600">Production Records</div>
        </Card>

        <Card className="text-center p-4 border-teal-200 bg-teal-50">
          <Truck className="w-8 h-8 text-teal-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-teal-700">
            {allData.filter(d => d.type === 'yesterdayLoading').length}
          </div>
          <div className="text-sm text-teal-600">Loading Records</div>
        </Card>
      </div>

      {/* Search and Controls */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search data entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data</SelectItem>
              <SelectItem value="employee">Employee Data</SelectItem>
              <SelectItem value="operations">Operations Data</SelectItem>
              <SelectItem value="staffCount">Staff Count Data</SelectItem>
              <SelectItem value="yesterdayProduction">Yesterday's Production</SelectItem>
              <SelectItem value="yesterdayLoading">Yesterday's Loading</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreferencesOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </Button>
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

        {/* Sort and View Options */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Sort by:</span>
            <Select 
              value={preferences.dataView.sortBy} 
              onValueChange={(value: 'timestamp' | 'type' | 'total') => 
                updateDataViewPreferences({ sortBy: value })
              }
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Date</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="total">Total</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateDataViewPreferences({ 
                sortOrder: preferences.dataView.sortOrder === 'asc' ? 'desc' : 'asc' 
              })}
            >
              {preferences.dataView.sortOrder === 'desc' ? 
                <SortDesc className="w-4 h-4" /> : 
                <SortAsc className="w-4 h-4" />
              }
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-600">
              Showing {paginatedData.length} of {filteredAndSortedData.length} entries
            </span>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="text-sm">
            <strong>Debug Info:</strong> Total entries: {allData.length} | 
            Types found: {[...new Set(allData.map(d => d.type))].join(', ')} | 
            Filtered: {filteredAndSortedData.length} | 
            Page: {currentPage}/{totalPages} | 
            Auto-refresh: {preferences.dataView.autoRefresh ? 'ON' : 'OFF'}
          </div>
        </CardContent>
      </Card>

      {/* Data Entries */}
      <div className="space-y-6">
        {filteredAndSortedData.length === 0 ? (
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
          paginatedData.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card className={`${getTypeColor(entry.type)} hover:shadow-lg transition-shadow`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(entry.type)}
                      <CardTitle className="text-lg">{getTypeName(entry.type)}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(entry.timestamp).toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {preferences.dataView.compactView ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {Object.entries(entry.data).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                      {preferences.dataView.showStats && (
                        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                          <span>Total: {entry.stats.total.toFixed(1)}</span>
                          <span>Avg: {entry.stats.average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {Object.entries(entry.data).map(([key, value]) => (
                          <div key={key} className="bg-white p-2 rounded border">
                            <div className="text-xs font-medium text-gray-600">{key}</div>
                            <div className="text-sm font-bold">{value}</div>
                          </div>
                        ))}
                      </div>
                      
                      {preferences.dataView.showStats && (
                        <div className="border-t pt-3 mt-3">
                          <div className="grid grid-cols-4 gap-3 text-sm">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{entry.stats.total.toFixed(1)}</div>
                              <div className="text-xs text-gray-500">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600">{entry.stats.average.toFixed(1)}</div>
                              <div className="text-xs text-gray-500">Average</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-orange-600">{entry.stats.max}</div>
                              <div className="text-xs text-gray-500">Max</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-red-600">{entry.stats.min}</div>
                              <div className="text-xs text-gray-500">Min</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      <PreferencesModal 
        isOpen={isPreferencesOpen} 
        onClose={() => setIsPreferencesOpen(false)} 
      />
    </motion.div>
  );
}