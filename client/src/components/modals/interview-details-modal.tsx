import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, FileText, Mail } from "lucide-react";

interface InterviewDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
}

export default function InterviewDetailsModal({ open, onOpenChange, request }: InterviewDetailsModalProps) {
  if (!request) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="dialog-interview-details">
        <DialogHeader>
          <DialogTitle>Interview Details</DialogTitle>
          <DialogDescription>
            Complete information about this interview request.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Header with position and status */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{request.position}</h3>
            <Badge className={getStatusBadgeColor(request.status)}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>

          {/* Candidate Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Candidate Information
            </h4>
            <div className="pl-6 space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <span className="text-sm text-gray-900 ml-2">{request.candidateName}</span>
              </div>
              {request.candidateEmail && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Email:</span>
                  <span className="text-sm text-gray-900 ml-2">{request.candidateEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Interview Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Interview Schedule
            </h4>
            <div className="pl-6 space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Date & Time:</span>
                <span className="text-sm text-gray-900 ml-2">
                  {new Date(request.proposedDateTime).toLocaleDateString()} at{" "}
                  {new Date(request.proposedDateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Duration:</span>
                <span className="text-sm text-gray-900 ml-2">{request.duration} minutes</span>
              </div>
            </div>
          </div>

          {/* Request Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Request Details
            </h4>
            <div className="pl-6 space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Requested by:</span>
                <span className="text-sm text-gray-900 ml-2">
                  {request.requestedBy.firstName} {request.requestedBy.lastName}
                </span>
              </div>
              {request.manager && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Assigned Manager:</span>
                  <span className="text-sm text-gray-900 ml-2">
                    {request.manager.firstName} {request.manager.lastName}
                  </span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Submitted:</span>
                <span className="text-sm text-gray-900 ml-2">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {request.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Interview Notes</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                {request.description}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {request.status === "rejected" && request.rejectionReason && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600">Rejection Reason</h4>
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded-md">
                {request.rejectionReason}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}