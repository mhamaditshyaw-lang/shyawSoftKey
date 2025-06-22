import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";

interface ArchiveDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivedItem: any;
}

export default function ArchiveDetailsModal({ open, onOpenChange, archivedItem }: ArchiveDetailsModalProps) {
  if (!archivedItem) return null;

  const itemData = JSON.parse(archivedItem.itemData);
  const archiveDetails = itemData.archiveDetails;



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Review Details - {itemData.position}</DialogTitle>
          <DialogDescription>
            Original request information and review description.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Original Interview Request */}
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
                <p className="text-sm font-medium text-gray-500">Employee</p>
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

          {/* New Description */}
          {archiveDetails && archiveDetails.description && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Review Description
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 whitespace-pre-wrap">{archiveDetails.description}</p>
              </div>
              {archiveDetails.reviewDate && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">
                    Review Date: {new Date(archiveDetails.reviewDate).toLocaleDateString()}
                  </p>
                </div>
              )}
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