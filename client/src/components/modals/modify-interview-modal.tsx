import { useState, useEffect } from "react";
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

interface ModifyInterviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
}

export default function ModifyInterviewModal({ open, onOpenChange, request }: ModifyInterviewModalProps) {
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

  // Initialize form data when request changes
  useEffect(() => {
    if (request) {
      setFormData({
        position: request.position || "",
        candidateName: request.candidateName || "",
        candidateEmail: request.candidateEmail || "",
        managerId: request.managerId ? request.managerId.toString() : "none",
        proposedDateTime: request.proposedDateTime 
          ? new Date(request.proposedDateTime).toISOString().slice(0, 16)
          : "",
        duration: request.duration ? request.duration.toString() : "60",
        description: request.description || "",
      });
    }
  }, [request]);

  const { data: managersData } = useQuery({
    queryKey: ["/api/managers"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/managers");
      return await response.json();
    },
    enabled: open,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await authenticatedRequest("PATCH", `/api/interviews/${request.id}`, {
        ...requestData,
        proposedDateTime: new Date(requestData.proposedDateTime).toISOString(),
        duration: parseInt(requestData.duration),
        managerId: requestData.managerId && requestData.managerId !== "none" ? parseInt(requestData.managerId) : null,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      toast({
        title: "Success",
        description: "Interview request updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRequestMutation.mutate(formData);
  };

  const managers = managersData?.managers || [];

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modify Interview Request</DialogTitle>
          <DialogDescription>
            Update the interview details and scheduling information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidateName">Candidate Name</Label>
              <Input
                id="candidateName"
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidateEmail">Candidate Email (Optional)</Label>
              <Input
                id="candidateEmail"
                type="email"
                value={formData.candidateEmail}
                onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerId">Assign to Manager (Optional)</Label>
            <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
              <SelectTrigger>
                <SelectValue />
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
            <Label htmlFor="description">Interview Details (Optional)</Label>
            <Textarea
              id="description"
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
              disabled={updateRequestMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateRequestMutation.isPending}>
              {updateRequestMutation.isPending ? "Updating..." : "Update Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}