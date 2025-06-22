import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3, 
  Target, 
  Award,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

interface Metric {
  id: number;
  title: string;
  value: number;
  unit: string;
  category: string;
  description?: string;
  target?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export default function MetricsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    value: "",
    unit: "",
    category: "performance",
    description: "",
    target: "",
  });

  const { data: metricsData, isLoading } = useQuery({
    queryKey: ["/api/metrics"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/metrics");
      return await response.json();
    },
  });

  const createMetricMutation = useMutation({
    mutationFn: async (metricData: any) => {
      const response = await authenticatedRequest("POST", "/api/metrics", metricData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Success",
        description: "Metric added successfully",
      });
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add metric",
        variant: "destructive",
      });
    },
  });

  const updateMetricMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await authenticatedRequest("PATCH", `/api/metrics/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Success",
        description: "Metric updated successfully",
      });
      setEditingMetric(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update metric",
        variant: "destructive",
      });
    },
  });

  const deleteMetricMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedRequest("DELETE", `/api/metrics/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Success",
        description: "Metric deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete metric",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      value: "",
      unit: "",
      category: "performance",
      description: "",
      target: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const metricData = {
      ...formData,
      value: parseFloat(formData.value),
      target: formData.target ? parseFloat(formData.target) : undefined,
    };

    if (editingMetric) {
      updateMetricMutation.mutate({ id: editingMetric.id, data: metricData });
    } else {
      createMetricMutation.mutate(metricData);
    }
  };

  const handleEdit = (metric: Metric) => {
    setEditingMetric(metric);
    setFormData({
      title: metric.title,
      value: metric.value.toString(),
      unit: metric.unit,
      category: metric.category,
      description: metric.description || "",
      target: metric.target?.toString() || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this metric?")) {
      deleteMetricMutation.mutate(id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "performance":
        return "bg-blue-100 text-blue-800";
      case "productivity":
        return "bg-green-100 text-green-800";
      case "quality":
        return "bg-purple-100 text-purple-800";
      case "finance":
        return "bg-yellow-100 text-yellow-800";
      case "goals":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = (value: number, target?: number) => {
    if (!target) return null;
    return Math.min((value / target) * 100, 100);
  };

  const metrics = metricsData?.metrics || [];
  const filteredMetrics = categoryFilter === "all" 
    ? metrics 
    : metrics.filter((metric: Metric) => metric.category === categoryFilter);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Metrics</h2>
            <p className="text-gray-600">Track your important numbers and KPIs</p>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingMetric(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Metric
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingMetric ? "Edit Metric" : "Add New Metric"}
                </DialogTitle>
                <DialogDescription>
                  {editingMetric ? "Update your metric information" : "Add a new metric to track"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Tasks Completed"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      placeholder="100"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="tasks, %, hours"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="goals">Goals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Target (Optional)</Label>
                  <Input
                    id="target"
                    type="number"
                    step="0.01"
                    placeholder="150"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional notes about this metric..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMetric(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMetricMutation.isPending || updateMetricMutation.isPending}
                  >
                    {editingMetric 
                      ? (updateMetricMutation.isPending ? "Updating..." : "Update")
                      : (createMetricMutation.isPending ? "Adding..." : "Add Metric")
                    }
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">Filter by category:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="goals">Goals</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">
              Showing {filteredMetrics.length} of {metrics.length} metrics
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      {filteredMetrics.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics found</h3>
            <p className="text-gray-600 mb-4">
              {categoryFilter === "all" 
                ? "Start tracking your important numbers by adding your first metric."
                : `No metrics found in the ${categoryFilter} category.`
              }
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Metric
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMetrics.map((metric: Metric, index: number) => {
            const progress = getProgressPercentage(metric.value, metric.target);
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{metric.title}</CardTitle>
                          <Badge className={getCategoryColor(metric.category)}>
                            {metric.category}
                          </Badge>
                        </div>
                        {metric.description && (
                          <CardDescription className="text-sm">
                            {metric.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(metric)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(metric.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {metric.value.toLocaleString()}
                          <span className="text-lg font-normal text-gray-600 ml-1">
                            {metric.unit}
                          </span>
                        </div>
                        {metric.target && (
                          <div className="text-sm text-gray-500">
                            Target: {metric.target.toLocaleString()} {metric.unit}
                          </div>
                        )}
                      </div>

                      {progress !== null && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                progress >= 100 
                                  ? "bg-green-500" 
                                  : progress >= 75 
                                  ? "bg-blue-500" 
                                  : progress >= 50 
                                  ? "bg-yellow-500" 
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Updated {new Date(metric.updatedAt).toLocaleDateString()}</span>
                          <span>by {metric.createdBy.firstName}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}