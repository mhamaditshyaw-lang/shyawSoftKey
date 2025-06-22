import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Clock, Check, X, Edit, Calendar, Plus, Archive } from "lucide-react";
import InterviewRequestModal from "@/components/modals/interview-request-modal";
import InterviewDetailsModal from "@/components/modals/interview-details-modal";
import ModifyInterviewModal from "@/components/modals/modify-interview-modal";
import ArchiveInterviewModal from "@/components/modals/archive-interview-modal";

export default function InterviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const { data: interviewsData, isLoading } = useQuery({
    queryKey: ["/api/interviews"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/interviews");
      return await response.json();
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await authenticatedRequest("PATCH", `/api/interviews/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      toast({
        title: "Success",
        description: "Interview request updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive",
      });
    },
  });

  const requests = interviewsData?.requests || [];

  const filteredRequests = requests.filter((request: any) => {
    return statusFilter === "all" || request.status === statusFilter;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprove = (id: number) => {
    updateRequestMutation.mutate({
      id,
      updates: { status: "approved" }
    });
  };

  const handleReject = (id: number, reason?: string) => {
    updateRequestMutation.mutate({
      id,
      updates: { 
        status: "rejected",
        rejectionReason: reason || "Request rejected"
      }
    });
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleModify = (request: any) => {
    setSelectedRequest(request);
    setShowModifyModal(true);
  };

  const handleReschedule = (request: any) => {
    setSelectedRequest(request);
    setShowModifyModal(true);
  };

  const archiveRequest = (request: any) => {
    setSelectedRequest(request);
    setShowArchiveModal(true);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Requests</h2>
            <p className="text-gray-600">Manage interview scheduling and approvals</p>
          </div>
          <div className="flex space-x-3">
            {(user?.role === "secretary" || user?.role === "admin") && (
              <Button onClick={() => setShowRequestModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Request Interview
              </Button>
            )}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="space-y-6">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interview requests found</h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === "all" 
                  ? "There are no interview requests yet."
                  : `No ${statusFilter} requests found.`
                }
              </p>
              {(user?.role === "secretary" || user?.role === "admin") && (
                <Button onClick={() => setShowRequestModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Request
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request: any) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{request.position}</h3>
                      <Badge className={getStatusBadgeColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Candidate</p>
                        <p className="text-sm text-gray-900 mt-1">{request.candidateName}</p>
                        {request.candidateEmail && (
                          <p className="text-xs text-gray-600">{request.candidateEmail}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Requested by</p>
                        <p className="text-sm text-gray-900 mt-1">
                          {request.requestedBy.firstName} {request.requestedBy.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Proposed Date</p>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(request.proposedDateTime).toLocaleDateString()} at{" "}
                          {new Date(request.proposedDateTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Duration</p>
                        <p className="text-sm text-gray-900 mt-1">{request.duration} minutes</p>
                      </div>
                    </div>

                    {request.description && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Interview Details</p>
                        <p className="text-sm text-gray-700">{request.description}</p>
                      </div>
                    )}

                    {request.rejectionReason && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-red-600 mb-2">Rejection Reason</p>
                        <p className="text-sm text-red-700">{request.rejectionReason}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        Submitted {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons for managers and admins */}
                  {(user?.role === "manager" || user?.role === "admin") && request.status === "pending" && (
                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(request.id)}
                        disabled={updateRequestMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                        disabled={updateRequestMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleModify(request)}
                        disabled={updateRequestMutation.isPending}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modify
                      </Button>
                    </div>
                  )}

                  {/* View details button for approved requests */}
                  {request.status === "approved" && (
                    <div className="flex flex-col space-y-2 ml-6">
                      <Button 
                        variant="outline"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {(user?.role === "manager" || user?.role === "admin") && (
                        <>
                          <Button 
                            variant="outline"
                            onClick={() => handleReschedule(request)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Reschedule
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => archiveRequest(request)}
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <InterviewRequestModal 
        open={showRequestModal} 
        onOpenChange={setShowRequestModal} 
      />
      
      <InterviewDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        request={selectedRequest}
      />
      
      <ModifyInterviewModal
        open={showModifyModal}
        onOpenChange={setShowModifyModal}
        request={selectedRequest}
      />
      
      <ArchiveInterviewModal
        open={showArchiveModal}
        onOpenChange={setShowArchiveModal}
        interview={selectedRequest}
      />
    </div>
  );
}
