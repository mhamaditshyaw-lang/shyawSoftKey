import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Archive, Search, Calendar, User, FileText, RotateCcw, Eye } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import ArchiveDetailsModal from "@/components/modals/archive-details-modal";

export default function ArchivePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: archiveData, isLoading } = useQuery({
    queryKey: ["/api/archive"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/archive");
      return await response.json();
    },
    enabled: user?.role === "admin" || user?.role === "manager",
  });

  const restoreItemMutation = useMutation({
    mutationFn: async ({ id, itemType }: { id: number; itemType: string }) => {
      const response = await authenticatedRequest("POST", `/api/archive/${id}/restore`, { itemType });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
      toast({
        title: "Success",
        description: "Item restored successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore item",
        variant: "destructive",
      });
    },
  });

  const archivedItems = archiveData?.archivedItems || [];

  const filteredItems = archivedItems.filter((item: any) => {
    const matchesType = typeFilter === "all" || item.itemType === typeFilter;
    const itemData = JSON.parse(item.itemData);
    const searchableText = `${itemData.title || itemData.position || itemData.firstName || ''} ${itemData.description || itemData.candidateName || itemData.email || ''}`.toLowerCase();
    const matchesSearch = searchTerm === "" || searchableText.includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "interview":
        return "bg-blue-100 text-blue-800";
      case "todo":
        return "bg-green-100 text-green-800";
      case "user":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "interview":
        return <Calendar className="w-4 h-4" />;
      case "todo":
        return <FileText className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      default:
        return <Archive className="w-4 h-4" />;
    }
  };

  const renderItemPreview = (item: any) => {
    const itemData = JSON.parse(item.itemData);
    
    switch (item.itemType) {
      case "interview":
        const archiveDetails = itemData.archiveDetails;
        return (
          <div>
            <h4 className="font-medium text-gray-900">{itemData.position}</h4>
            <p className="text-sm text-gray-600">Candidate: {itemData.candidateName}</p>
            {archiveDetails && (
              <div className="mt-2 space-y-1">
                {archiveDetails.decision && (
                  <p className="text-sm text-gray-600">
                    Decision: <span className={`font-medium ${
                      archiveDetails.decision === 'hired' ? 'text-green-600' : 
                      archiveDetails.decision === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {archiveDetails.decision.charAt(0).toUpperCase() + archiveDetails.decision.slice(1).replace('_', ' ')}
                    </span>
                  </p>
                )}
                {archiveDetails.candidateRating && (
                  <p className="text-sm text-gray-600">Rating: {archiveDetails.candidateRating}/10</p>
                )}
                {archiveDetails.interviewDate && (
                  <p className="text-sm text-gray-600">
                    Interview Date: {new Date(archiveDetails.interviewDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      case "todo":
        return (
          <div>
            <h4 className="font-medium text-gray-900">{itemData.title}</h4>
            <p className="text-sm text-gray-600">{itemData.description}</p>
            <p className="text-sm text-gray-600">Priority: {itemData.priority}</p>
          </div>
        );
      case "user":
        return (
          <div>
            <h4 className="font-medium text-gray-900">
              {itemData.firstName} {itemData.lastName}
            </h4>
            <p className="text-sm text-gray-600">{itemData.email}</p>
            <p className="text-sm text-gray-600">Role: {itemData.role}</p>
          </div>
        );
      default:
        return (
          <div>
            <h4 className="font-medium text-gray-900">Archived Item</h4>
            <p className="text-sm text-gray-600">Type: {item.itemType}</p>
          </div>
        );
    }
  };

  const handleRestore = (item: any) => {
    restoreItemMutation.mutate({
      id: item.id,
      itemType: item.itemType
    });
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  if (user?.role !== "admin" && user?.role !== "manager") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              Only administrators and managers can access the archive.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Archive</h2>
            <p className="text-gray-600">Manage archived interviews, todos, and users</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search archived items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="interview">Interviews</SelectItem>
                <SelectItem value="todo">Todo Lists</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Archive Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Archive className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{archivedItems.length}</p>
                <p className="text-gray-600">Total Archived</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {archivedItems.filter((item: any) => item.itemType === "interview").length}
                </p>
                <p className="text-gray-600">Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {archivedItems.filter((item: any) => item.itemType === "todo").length}
                </p>
                <p className="text-gray-600">Todo Lists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {archivedItems.filter((item: any) => item.itemType === "user").length}
                </p>
                <p className="text-gray-600">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Archived Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No archived items found</h3>
              <p className="text-gray-600">
                {typeFilter === "all" 
                  ? "No items have been archived yet."
                  : `No archived ${typeFilter} items found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                      {getTypeIcon(item.itemType)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getTypeColor(item.itemType)}>
                          {item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)}
                        </Badge>
                      </div>
                      
                      {renderItemPreview(item)}
                      
                      {item.reason && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-500">Archive Reason:</p>
                          <p className="text-sm text-gray-700">{item.reason}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                        <span>
                          Archived by {item.archivedBy.firstName} {item.archivedBy.lastName}
                        </span>
                        <span>•</span>
                        <span>{getRelativeTime(item.archivedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(item)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(item)}
                      disabled={restoreItemMutation.isPending}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ArchiveDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        archivedItem={selectedItem}
      />
    </div>
  );
}