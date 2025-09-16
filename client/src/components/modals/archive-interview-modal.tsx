import { useState } from "react";
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
import { Calendar, Clock, User, FileText, Star, Award } from "lucide-react";

interface ArchiveInterviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: any;
}

export default function ArchiveInterviewModal({ open, onOpenChange, interview }: ArchiveInterviewModalProps) {
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

  const archiveInterviewMutation = useMutation({
    mutationFn: async (archiveData: any) => {
      const response = await authenticatedRequest("POST", "/api/archive", {
        itemType: "interview",
        itemId: interview.id,
        itemData: {
          ...interview,
          archiveDetails: archiveData
        },
        reason: `Interview completed - ${archiveData.decision}`
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
      toast({
        title: "Success",
        description: "Interview archived with detailed information",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive interview",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    archiveInterviewMutation.mutate(formData);
  };

  if (!interview) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Archive Interview - {interview.position}</DialogTitle>
          <DialogDescription>
            Complete the interview details before archiving. This information will be stored for future reference.
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualDuration">Actual Duration (minutes)</Label>
                <Input
                  id="actualDuration"
                  type="number"
                  value={formData.actualDuration}
                  onChange={(e) => setFormData({ ...formData, actualDuration: e.target.value })}
                  required
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
                  value={formData.interviewerName}
                  onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewerRole">Interviewer Role</Label>
                <Input
                  id="interviewerRole"
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
                    <SelectValue />
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
                    <SelectValue />
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
                  value={formData.technicalSkills}
                  onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="communicationSkills">Communication & Soft Skills</Label>
                <Textarea
                  id="communicationSkills"
                  value={formData.communicationSkills}
                  onChange={(e) => setFormData({ ...formData, communicationSkills: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strengths">Key Strengths</Label>
                <Textarea
                  id="strengths"
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weaknesses">Areas for Improvement</Label>
                <Textarea
                  id="weaknesses"
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
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={archiveInterviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={archiveInterviewMutation.isPending}>
              {archiveInterviewMutation.isPending ? "Archiving..." : "Archive Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}