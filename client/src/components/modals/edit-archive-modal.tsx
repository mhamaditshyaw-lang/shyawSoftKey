import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, FileText, Star, Award, Edit } from "lucide-react";

interface EditArchiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivedItem: any;
}

export default function EditArchiveModal({ open, onOpenChange, archivedItem }: EditArchiveModalProps) {
  const [formData, setFormData] = useState({
    interviewDate: "",
    actualDuration: "",
    interviewType: "in_person",
    interviewerName: "",
    interviewerRole: "",
    candidateAttended: true,
    candidateRating: "",
    technicalSkills: "",
    communicationSkills: "",
    experienceLevel: "",
    strengths: "",
    weaknesses: "",
    recommendations: "",
    decision: "pending",
    salary: "",
    startDate: "",
    notes: "",
    followUpRequired: false,
    followUpNotes: "",
  });
  const { toast } = useToast();

  // Initialize form data when archivedItem changes
  useEffect(() => {
    if (archivedItem) {
      const itemData = JSON.parse(archivedItem.itemData);
      const archiveDetails = itemData.archiveDetails || {};
      
      setFormData({
        interviewDate: archiveDetails.interviewDate || "",
        actualDuration: archiveDetails.actualDuration || "",
        interviewType: archiveDetails.interviewType || "in_person",
        interviewerName: archiveDetails.interviewerName || "",
        interviewerRole: archiveDetails.interviewerRole || "",
        candidateAttended: archiveDetails.candidateAttended !== false,
        candidateRating: archiveDetails.candidateRating || "",
        technicalSkills: archiveDetails.technicalSkills || "",
        communicationSkills: archiveDetails.communicationSkills || "",
        experienceLevel: archiveDetails.experienceLevel || "",
        strengths: archiveDetails.strengths || "",
        weaknesses: archiveDetails.weaknesses || "",
        recommendations: archiveDetails.recommendations || "",
        decision: archiveDetails.decision || "pending",
        salary: archiveDetails.salary || "",
        startDate: archiveDetails.startDate || "",
        notes: archiveDetails.notes || "",
        followUpRequired: archiveDetails.followUpRequired || false,
        followUpNotes: archiveDetails.followUpNotes || "",
      });
    }
  }, [archivedItem]);

  const updateArchiveMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const itemData = JSON.parse(archivedItem.itemData);
      const updatedItemData = {
        ...itemData,
        archiveDetails: updateData
      };
      
      const response = await authenticatedRequest("PATCH", `/api/archive/${archivedItem.id}`, {
        itemData: JSON.stringify(updatedItemData)
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
      toast({
        title: "Success",
        description: "Archive information updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update archive information",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateArchiveMutation.mutate(formData);
  };

  if (!archivedItem) return null;

  const itemData = JSON.parse(archivedItem.itemData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            Edit Archive Information - {itemData.position}
          </DialogTitle>
          <DialogDescription>
            Update or add detailed information about this archived interview.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interview Basic Info */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Interview Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interviewDate">Actual Interview Date</Label>
                <Input
                  id="interviewDate"
                  type="date"
                  value={formData.interviewDate}
                  onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualDuration">Actual Duration (minutes)</Label>
                <Input
                  id="actualDuration"
                  type="number"
                  placeholder="60"
                  value={formData.actualDuration}
                  onChange={(e) => setFormData({ ...formData, actualDuration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewType">Interview Type</Label>
                <Select value={formData.interviewType} onValueChange={(value) => setFormData({ ...formData, interviewType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="video_call">Video Call</SelectItem>
                    <SelectItem value="phone_call">Phone Call</SelectItem>
                    <SelectItem value="panel">Panel Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewerName">Primary Interviewer Name</Label>
                <Input
                  id="interviewerName"
                  placeholder="John Smith"
                  value={formData.interviewerName}
                  onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewerRole">Interviewer Role</Label>
                <Input
                  id="interviewerRole"
                  placeholder="Technical Lead"
                  value={formData.interviewerRole}
                  onChange={(e) => setFormData({ ...formData, interviewerRole: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="candidateAttended"
                  checked={formData.candidateAttended}
                  onCheckedChange={(checked) => setFormData({ ...formData, candidateAttended: !!checked })}
                />
                <Label htmlFor="candidateAttended">Candidate attended the interview</Label>
              </div>
            </div>
          </div>

          {/* Candidate Evaluation */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Candidate Evaluation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="candidateRating">Overall Rating (1-10)</Label>
                <Select value={formData.candidateRating} onValueChange={(value) => setFormData({ ...formData, candidateRating: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                      <SelectItem key={rating} value={rating.toString()}>{rating} - {rating >= 8 ? 'Excellent' : rating >= 6 ? 'Good' : rating >= 4 ? 'Average' : 'Poor'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid-level (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                    <SelectItem value="lead">Lead (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicalSkills">Technical Skills Assessment</Label>
                <Textarea
                  id="technicalSkills"
                  placeholder="Assess technical competencies, knowledge of tools, problem-solving ability..."
                  value={formData.technicalSkills}
                  onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="communicationSkills">Communication & Soft Skills</Label>
                <Textarea
                  id="communicationSkills"
                  placeholder="Evaluate communication style, teamwork, leadership potential..."
                  value={formData.communicationSkills}
                  onChange={(e) => setFormData({ ...formData, communicationSkills: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strengths">Key Strengths</Label>
                <Textarea
                  id="strengths"
                  placeholder="List candidate's main strengths and positive points..."
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weaknesses">Areas for Improvement</Label>
                <Textarea
                  id="weaknesses"
                  placeholder="Note areas where candidate could improve..."
                  value={formData.weaknesses}
                  onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Decision & Next Steps */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Decision & Next Steps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="decision">Interview Decision</Label>
                <Select value={formData.decision} onValueChange={(value) => setFormData({ ...formData, decision: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="second_round">Proceed to Second Round</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="pending">Pending Decision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Proposed Salary (if hired)</Label>
                <Input
                  id="salary"
                  placeholder="$50,000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Proposed Start Date (if hired)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followUpRequired"
                  checked={formData.followUpRequired}
                  onCheckedChange={(checked) => setFormData({ ...formData, followUpRequired: !!checked })}
                />
                <Label htmlFor="followUpRequired">Follow-up required</Label>
              </div>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations & Comments</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Overall recommendations, hiring decision rationale, additional comments..."
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  rows={3}
                />
              </div>
              
              {formData.followUpRequired && (
                <div className="space-y-2">
                  <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                  <Textarea
                    id="followUpNotes"
                    placeholder="Describe what follow-up actions are needed..."
                    value={formData.followUpNotes}
                    onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                    rows={2}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other important information about the interview..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateArchiveMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateArchiveMutation.isPending}>
              {updateArchiveMutation.isPending ? "Updating..." : "Update Information"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}