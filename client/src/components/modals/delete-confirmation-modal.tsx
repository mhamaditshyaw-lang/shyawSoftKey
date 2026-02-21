import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  Trash2, 
  Users, 
  BarChart3, 
  Clock, 
  Truck, 
  Database,
  X
} from "lucide-react";

interface DataEntry {
  id: string | number;
  timestamp?: string;
  type: string;
  data: Record<string, string>;
  stats?: {
    total: number;
    average: number;
    max: number;
    min: number;
  };
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entry?: DataEntry;
  isClearing?: boolean;
  totalEntries?: number;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  entry,
  isClearing = false,
  totalEntries = 0
}: DeleteConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getTypeName = (type: string): string => {
    switch (type) {
      case 'employee': return 'Employee Attendance';
      case 'operations': return 'Operations Data';
      case 'staff-count': return 'Staff Count';
      case 'production': return 'Yesterday\'s Production';
      case 'loading': return 'Loading Vehicles';
      default: return 'Data Entry';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employee': return <Users className="w-5 h-5 text-blue-600" />;
      case 'operations': return <BarChart3 className="w-5 h-5 text-green-600" />;
      case 'staff-count': return <Users className="w-5 h-5 text-purple-600" />;
      case 'production': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'loading': return <Truck className="w-5 h-5 text-teal-600" />;
      default: return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing
      onConfirm();
      setConfirmText("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const requiresConfirmation = isClearing;
  const canConfirm = requiresConfirmation ? confirmText.toLowerCase() === 'delete' : true;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-0 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {isClearing ? 'Clear All Data?' : 'Delete Data Entry?'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base mt-2">
            {isClearing 
              ? `This will permanently remove all ${totalEntries} operational data entries from your system.`
              : 'This action will permanently remove this data entry and cannot be undone.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Entry Details (for single deletion) */}
        {!isClearing && entry && (
          <div className="bg-gray-50 rounded-lg p-4 my-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                {getTypeIcon(entry.type)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{getTypeName(entry.type)}</h4>
                <p className="text-sm text-gray-600">
                  {Object.keys(entry.data).length} data fields {entry.timestamp && `• ${new Date(entry.timestamp).toLocaleString()}`}
                </p>
              </div>
            </div>
            
            {entry.stats && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-2 rounded border">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-medium ml-1">{entry.stats.total.toFixed(2)}</span>
                </div>
                <div className="bg-white p-2 rounded border">
                  <span className="text-gray-500">Average:</span>
                  <span className="font-medium ml-1">{entry.stats.average.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bulk deletion summary */}
        {isClearing && (
          <div className="bg-red-50 rounded-lg p-4 my-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-900">Data to be removed:</h4>
            </div>
            <div className="text-sm text-red-800 space-y-1">
              <p>• All employee attendance records</p>
              <p>• All operations and production data</p>
              <p>• All staff count tracking</p>
              <p>• All loading vehicle records</p>
              <p className="font-medium mt-2">Total: {totalEntries} entries</p>
            </div>
          </div>
        )}

        {/* Confirmation input for bulk deletion */}
        {requiresConfirmation && (
          <div className="space-y-3">
            <Label htmlFor="confirm-text" className="text-sm font-medium text-gray-700">
              Type <Badge variant="destructive" className="mx-1 px-2">DELETE</Badge> to confirm this action:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="border-red-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        )}

        <DialogFooter className="gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {isClearing ? 'Clear All Data' : 'Delete Entry'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}