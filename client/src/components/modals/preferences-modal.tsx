import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { Settings, Database, Monitor, Palette } from "lucide-react";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const { preferences, updateDataViewPreferences, updateDashboardPreferences, resetPreferences } = useUserPreferences();
  const [tempPreferences, setTempPreferences] = useState(preferences);

  const handleSave = () => {
    updateDataViewPreferences(tempPreferences.dataView);
    updateDashboardPreferences(tempPreferences.dashboard);
    onClose();
  };

  const handleReset = () => {
    resetPreferences();
    setTempPreferences(preferences);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            User Preferences
          </DialogTitle>
          <DialogDescription>
            Customize your experience and save your preferred settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="dataview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dataview" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data View
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dataview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data View Settings</CardTitle>
                <CardDescription>Configure how data is displayed and filtered in the Data View page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultFilter">Default Filter</Label>
                    <Select
                      value={tempPreferences.dataView.defaultFilter}
                      onValueChange={(value) => setTempPreferences(prev => ({
                        ...prev,
                        dataView: { ...prev.dataView, defaultFilter: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemsPerPage">Items Per Page</Label>
                    <Select
                      value={tempPreferences.dataView.itemsPerPage.toString()}
                      onValueChange={(value) => setTempPreferences(prev => ({
                        ...prev,
                        dataView: { ...prev.dataView, itemsPerPage: parseInt(value) }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 items</SelectItem>
                        <SelectItem value="10">10 items</SelectItem>
                        <SelectItem value="20">20 items</SelectItem>
                        <SelectItem value="50">50 items</SelectItem>
                        <SelectItem value="100">100 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortBy">Sort By</Label>
                    <Select
                      value={tempPreferences.dataView.sortBy}
                      onValueChange={(value: 'timestamp' | 'type' | 'total') => setTempPreferences(prev => ({
                        ...prev,
                        dataView: { ...prev.dataView, sortBy: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="timestamp">Timestamp</SelectItem>
                        <SelectItem value="type">Data Type</SelectItem>
                        <SelectItem value="total">Total Value</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Select
                      value={tempPreferences.dataView.sortOrder}
                      onValueChange={(value: 'asc' | 'desc') => setTempPreferences(prev => ({
                        ...prev,
                        dataView: { ...prev.dataView, sortOrder: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Statistics</Label>
                      <div className="text-sm text-gray-500">Display statistics for each data entry</div>
                    </div>
                    <Switch
                      checked={tempPreferences.dataView.showStats}
                      onCheckedChange={(checked) => setTempPreferences(prev => ({
                        ...prev,
                        dataView: { ...prev.dataView, showStats: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact View</Label>
                      <div className="text-sm text-gray-500">Use a more compact layout for data entries</div>
                    </div>
                    <Switch
                      checked={tempPreferences.dataView.compactView}
                      onCheckedChange={(checked) => setTempPreferences(prev => ({
                        ...prev,
                        dataView: { ...prev.dataView, compactView: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Refresh</Label>
                      <div className="text-sm text-gray-500">Automatically refresh data every few seconds</div>
                    </div>
                    <Switch
                      checked={tempPreferences.dataView.autoRefresh}
                      onCheckedChange={(checked) => setTempPreferences(prev => ({
                        ...prev,
                        dataView: { ...prev.dataView, autoRefresh: checked }
                      }))}
                    />
                  </div>

                  {tempPreferences.dataView.autoRefresh && (
                    <div className="space-y-2">
                      <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                      <Input
                        id="refreshInterval"
                        type="number"
                        min="1"
                        max="60"
                        value={tempPreferences.dataView.refreshInterval / 1000}
                        onChange={(e) => setTempPreferences(prev => ({
                          ...prev,
                          dataView: { ...prev.dataView, refreshInterval: parseInt(e.target.value) * 1000 }
                        }))}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
                <CardDescription>Configure dashboard behavior and default views</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultTab">Default Tab</Label>
                  <Select
                    value={tempPreferences.dashboard.defaultTab}
                    onValueChange={(value) => setTempPreferences(prev => ({
                      ...prev,
                      dashboard: { ...prev.dashboard, defaultTab: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee Tracking</SelectItem>
                      <SelectItem value="operations">Operations Data</SelectItem>
                      <SelectItem value="staffCount">Staff Count</SelectItem>
                      <SelectItem value="production">Production Data</SelectItem>
                      <SelectItem value="loading">Loading Vehicles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Animations</Label>
                    <div className="text-sm text-gray-500">Enable loading animations and transitions</div>
                  </div>
                  <Switch
                    checked={tempPreferences.dashboard.showAnimations}
                    onCheckedChange={(checked) => setTempPreferences(prev => ({
                      ...prev,
                      dashboard: { ...prev.dashboard, showAnimations: checked }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the visual appearance of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={tempPreferences.dashboard.theme}
                    onValueChange={(value: 'light' | 'dark' | 'auto') => setTempPreferences(prev => ({
                      ...prev,
                      dashboard: { ...prev.dashboard, theme: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}