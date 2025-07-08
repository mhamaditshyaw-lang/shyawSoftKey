import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

interface DeleteEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  username: string;
}

export function DeleteEmployeeModal({ open, onOpenChange, userId, username }: DeleteEmployeeModalProps) {
  const { toast } = useToast();

  const deleteEmployeeMutation = useMutation({
    mutationFn: async () => {
      const response = await authenticatedRequest("DELETE", `/api/users/${userId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete employee");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Employee Deleted",
        description: `${username} has been successfully removed from the system`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteEmployeeMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Employee
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            This action cannot be undone. This will permanently delete the employee account and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Are you sure you want to delete "{username}"?
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                This will permanently remove their access and all associated data.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteEmployeeMutation.isPending}
          >
            {deleteEmployeeMutation.isPending ? "Deleting..." : "Delete Employee"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}