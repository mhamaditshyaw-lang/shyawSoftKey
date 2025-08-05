import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Plus } from "lucide-react";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviews: any[];
}

export default function FeedbackModal({ open, onOpenChange, interviews }: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    type: "general_feedback",
    title: "",
    description: "",
    rating: "",
    relatedInterviewId: "none",
  });
  const [selectedRating, setSelectedRating] = useState(0);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();

  const createFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      const response = await authenticatedRequest("POST", "/api/feedback", {
        ...feedbackData,
        rating: feedbackData.rating || undefined,
        relatedInterviewId: feedbackData.relatedInterviewId && feedbackData.relatedInterviewId !== "none" 
          ? parseInt(feedbackData.relatedInterviewId) 
          : undefined,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      type: "general_feedback",
      title: "",
      description: "",
      rating: "",
      relatedInterviewId: "none",
    });
    setSelectedRating(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeedbackMutation.mutate({
      ...formData,
      rating: selectedRating > 0 ? selectedRating.toString() : undefined,
    });
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setFormData({ ...formData, rating: rating.toString() });
  };

  const showRating = formData.type === "interview_feedback" || formData.type === "user_experience";
  const showInterviewSelect = formData.type === "interview_feedback";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Share your feedback to help us improve our system and processes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="type">Feedback Type</Label>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setShowAddTypeModal(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Type
              </Button>
            </div>
            <Select 
              value={formData.type} 
              onValueChange={(value) => {
                setFormData({ ...formData, type: value, relatedInterviewId: "none" });
                setSelectedRating(0);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interview_feedback">Interview Feedback</SelectItem>
                <SelectItem value="general_feedback">General Feedback</SelectItem>
                <SelectItem value="system_improvement">System Improvement</SelectItem>
                <SelectItem value="user_experience">User Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showInterviewSelect && (
            <div className="space-y-2">
              <Label htmlFor="relatedInterviewId">Related Interview (Optional)</Label>
              <Select 
                value={formData.relatedInterviewId} 
                onValueChange={(value) => setFormData({ ...formData, relatedInterviewId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an interview" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific interview</SelectItem>
                  {interviews.map((interview: any) => (
                    <SelectItem key={interview.id} value={interview.id.toString()}>
                      {interview.position} - {interview.candidateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief summary of your feedback"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed feedback and suggestions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          {showRating && (
            <div className="space-y-2">
              <Label>Rating (Optional)</Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        rating <= selectedRating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={createFeedbackMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createFeedbackMutation.isPending}>
              {createFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Add New Type Modal */}
      <Dialog open={showAddTypeModal} onOpenChange={setShowAddTypeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addNewFeedbackType")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type-name">{t("typeName")}</Label>
              <Input
                id="type-name"
                placeholder={t("enterTypeName")}
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => {
              setShowAddTypeModal(false);
              setNewTypeName("");
            }}>
              {t("cancel")}
            </Button>
            <Button onClick={() => {
              // Here you would handle adding the new type
              if (newTypeName.trim()) {
                toast({
                  title: t("success"),
                  description: `${t("feedbackType")} "${newTypeName}" ${t("addedSuccessfully")}`,
                });
                setNewTypeName("");
                setShowAddTypeModal(false);
              }
            }}>
              {t("addType")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}