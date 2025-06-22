import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Star, Award, FileText } from "lucide-react";

interface ArchiveDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivedItem: any;
}

export default function ArchiveDetailsModal({ open, onOpenChange, archivedItem }: ArchiveDetailsModalProps) {
  if (!archivedItem) return null;

  const itemData = JSON.parse(archivedItem.itemData);
  const archiveDetails = itemData.archiveDetails;

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "hired":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "second_round":
        return "bg-blue-100 text-blue-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingStars = (rating: string) => {
    if (!rating) return null;
    const stars = [];
    const ratingNum = parseInt(rating);
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= ratingNum ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Archived Interview Details - {itemData.position}</DialogTitle>
          <DialogDescription>
            Complete interview information and evaluation details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Original Interview Info */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Original Interview Request
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Position</p>
                <p className="text-gray-900">{itemData.position}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Candidate</p>
                <p className="text-gray-900">{itemData.candidateName}</p>
                {itemData.candidateEmail && (
                  <p className="text-sm text-gray-600">{itemData.candidateEmail}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Requested By</p>
                <p className="text-gray-900">
                  {itemData.requestedBy?.firstName} {itemData.requestedBy?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Proposed Date/Time</p>
                <p className="text-gray-900">
                  {new Date(itemData.proposedDateTime).toLocaleDateString()} at{" "}
                  {new Date(itemData.proposedDateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {archiveDetails && (
            <>
              {/* Interview Execution Details */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Interview Execution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Actual Date</p>
                    <p className="text-gray-900">
                      {archiveDetails.interviewDate ? new Date(archiveDetails.interviewDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-gray-900">{archiveDetails.actualDuration || 'Not specified'} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interview Type</p>
                    <p className="text-gray-900">
                      {archiveDetails.interviewType?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interviewer</p>
                    <p className="text-gray-900">{archiveDetails.interviewerName || 'Not specified'}</p>
                    {archiveDetails.interviewerRole && (
                      <p className="text-sm text-gray-600">{archiveDetails.interviewerRole}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Candidate Attendance</p>
                    <p className={`text-sm font-medium ${archiveDetails.candidateAttended ? 'text-green-600' : 'text-red-600'}`}>
                      {archiveDetails.candidateAttended ? 'Attended' : 'Did not attend'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Candidate Evaluation */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Candidate Evaluation
                </h3>
                <div className="space-y-4">
                  {archiveDetails.candidateRating && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Overall Rating</p>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-gray-900">{archiveDetails.candidateRating}/10</span>
                        {getRatingStars(archiveDetails.candidateRating)}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archiveDetails.experienceLevel && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Experience Level</p>
                        <p className="text-gray-900 capitalize">{archiveDetails.experienceLevel.replace('_', '-')}</p>
                      </div>
                    )}
                  </div>
                  
                  {archiveDetails.technicalSkills && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Technical Skills Assessment</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{archiveDetails.technicalSkills}</p>
                    </div>
                  )}
                  
                  {archiveDetails.communicationSkills && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Communication & Soft Skills</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{archiveDetails.communicationSkills}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archiveDetails.strengths && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Key Strengths</p>
                        <p className="text-gray-700 bg-green-50 p-3 rounded-md">{archiveDetails.strengths}</p>
                      </div>
                    )}
                    
                    {archiveDetails.weaknesses && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Areas for Improvement</p>
                        <p className="text-gray-700 bg-yellow-50 p-3 rounded-md">{archiveDetails.weaknesses}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Decision & Outcome */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Decision & Outcome
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">Final Decision:</span>
                    <Badge className={getDecisionColor(archiveDetails.decision)}>
                      {archiveDetails.decision?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Not specified'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archiveDetails.salary && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Proposed Salary</p>
                        <p className="text-gray-900">{archiveDetails.salary}</p>
                      </div>
                    )}
                    
                    {archiveDetails.startDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Proposed Start Date</p>
                        <p className="text-gray-900">{new Date(archiveDetails.startDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {archiveDetails.recommendations && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Recommendations & Comments</p>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-md">{archiveDetails.recommendations}</p>
                    </div>
                  )}
                  
                  {archiveDetails.followUpRequired && (
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-2">Follow-up Required</p>
                      {archiveDetails.followUpNotes && (
                        <p className="text-gray-700 bg-red-50 p-3 rounded-md">{archiveDetails.followUpNotes}</p>
                      )}
                    </div>
                  )}
                  
                  {archiveDetails.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Additional Notes</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{archiveDetails.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Archive Information */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Archive Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Archived By</p>
                <p className="text-gray-900">
                  {archivedItem.archivedBy.firstName} {archivedItem.archivedBy.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Archive Date</p>
                <p className="text-gray-900">{new Date(archivedItem.archivedAt).toLocaleString()}</p>
              </div>
              {archivedItem.reason && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Archive Reason</p>
                  <p className="text-gray-900">{archivedItem.reason}</p>
                </div>
              )}
            </div>
          </div>
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