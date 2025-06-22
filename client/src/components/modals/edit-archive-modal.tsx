import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

interface EditArchiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivedItem: any;
}

export default function EditArchiveModal({ open, onOpenChange, archivedItem }: EditArchiveModalProps) {
  const [formData, setFormData] = useState({
    employeeName: "",
    reviewDate: "",
    description: "",
  });
  const { toast } = useToast();

  // Initialize form data when archivedItem changes
  useEffect(() => {
    if (archivedItem) {
      const itemData = JSON.parse(archivedItem.itemData);
      const archiveDetails = itemData.archiveDetails || {};
      
      setFormData({
        employeeName: itemData.candidateName || archiveDetails.employeeName || "",
        reviewDate: archiveDetails.reviewDate || archiveDetails.interviewDate || "",
        description: "", // Always start with empty description for new writing
      });
    }
  }, [archivedItem]);

  const updateArchiveMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const itemData = JSON.parse(archivedItem.itemData);
      const existingDetails = itemData.archiveDetails || {};
      
      // Create new description entry with timestamp
      const newDescriptionEntry = {
        description: updateData.description,
        addedAt: new Date().toISOString(),
        addedBy: updateData.employeeName,
        reviewDate: updateData.reviewDate
      };
      
      // Add to descriptions array (keep existing descriptions)
      const existingDescriptions = existingDetails.descriptions || [];
      const updatedDescriptions = [...existingDescriptions, newDescriptionEntry];
      
      const updatedItemData = {
        ...itemData,
        archiveDetails: {
          ...existingDetails,
          descriptions: updatedDescriptions,
          employeeName: updateData.employeeName,
          reviewDate: updateData.reviewDate,
          description: updateData.description // Keep for backward compatibility
        }
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
        description: "New description entry added successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add description entry",
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
            Add Information - {itemData.position}
          </DialogTitle>
          <DialogDescription>
            Add detailed information about this archived employee review.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Edit className="w-5 h-5 mr-2" />
              Employee Review Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name</Label>
                <Input
                  id="employeeName"
                  placeholder="John Doe"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reviewDate">Review Date</Label>
                <Input
                  id="reviewDate"
                  type="date"
                  value={formData.reviewDate}
                  onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">New Description Entry</Label>
                <Textarea
                  id="description"
                  placeholder="Write a new description for this employee review - include outcomes, feedback, performance notes, recommendations, and any other important information..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
                <p className="text-sm text-gray-500">
                  This will add a new description entry with timestamp. Previous descriptions will be preserved.
                </p>
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
              {updateArchiveMutation.isPending ? "Adding..." : "Add Description Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}