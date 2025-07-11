import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InterviewRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InterviewRequestModal({ open, onOpenChange }: InterviewRequestModalProps) {
  const [formData, setFormData] = useState({
    position: "",
    candidateName: "",
    candidateEmail: "",
    managerId: "none",
    proposedDateTime: "",
    duration: "60",
    description: "",
  });
  const { toast } = useToast();

  const { data: managersData } = useQuery({
    queryKey: ["/api/managers"],
    queryFn: async () => {
      const response = await fetch("/api/managers", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Don't throw error for permission issues, just return empty data
          return { managers: [] };
        }
        throw new Error("Failed to fetch managers");
      }
      return response.json();
    },
    enabled: open,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await authenticatedRequest("POST", "/api/interviews", {
        ...requestData,
        proposedDateTime: new Date(requestData.proposedDateTime).toISOString(),
        duration: parseInt(requestData.duration),
        managerId: requestData.managerId && requestData.managerId !== "" && requestData.managerId !== "none" ? parseInt(requestData.managerId) : null,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      toast({
        title: "Success",
        description: "Interview request created successfully",
      });
      onOpenChange(false);
      setFormData({
        position: "",
        candidateName: "",
        candidateEmail: "",
        managerId: "none",
        proposedDateTime: "",
        duration: "60",
        description: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequestMutation.mutate(formData);
  };

  const managers = managersData?.managers || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Employee Review</DialogTitle>
          <DialogDescription>
            Schedule an employee evaluation, performance review, or internal role change interview.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Review Type / Position</Label>
            <Input
              id="position"
              placeholder="e.g., Performance Review, Role Change to Manager"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidateName">Employee Name</Label>
              <Input
                id="candidateName"
                placeholder="John Doe"
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidateEmail">Employee Email (Optional)</Label>
              <Input
                id="candidateEmail"
                type="email"
                placeholder="john@company.com"
                value={formData.candidateEmail}
                onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerId">Assign to Manager (Optional)</Label>
            <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select manager to assign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific manager</SelectItem>
                {managers.map((manager: any) => (
                  <SelectItem key={manager.id} value={manager.id.toString()}>
                    {manager.firstName} {manager.lastName} ({manager.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposedDateTime">Proposed Date & Time</Label>
              <Input
                id="proposedDateTime"
                type="datetime-local"
                value={formData.proposedDateTime}
                onChange={(e) => setFormData({ ...formData, proposedDateTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Review Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the review purpose, areas to evaluate, performance goals, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createRequestMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRequestMutation.isPending}>
              {createRequestMutation.isPending ? "Scheduling..." : "Schedule Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}