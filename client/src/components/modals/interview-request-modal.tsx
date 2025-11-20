import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        title: t("success"),
        description: t("interviewRequestCreatedSuccessfully"),
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
        title: t("error"),
        description: error.message || t("failed to create request"),
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
          <DialogTitle>{t("scheduleInterview")}</DialogTitle>
          <DialogDescription>
            {t("manageEmployeeEvaluations")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">{t("position")}</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidateName">{t("candidateName")}</Label>
              <Input
                id="candidateName"
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidateEmail">{t("emailAddress")}</Label>
              <Input
                id="candidateEmail"
                type="email"
                value={formData.candidateEmail}
                onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerId">{t("managerAssigned")}</Label>
            <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("noAssignment")}</SelectItem>
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
              <Label htmlFor="proposedDateTime">{t("proposedDateTime")}</Label>
              <Input
                id="proposedDateTime"
                type="datetime-local"
                value={formData.proposedDateTime}
                onChange={(e) => setFormData({ ...formData, proposedDateTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">{t("duration")}</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 {t("duration")}</SelectItem>
                  <SelectItem value="10">10 {t("duration")}</SelectItem>
                  <SelectItem value="15">15 {t("duration")}</SelectItem>
                  <SelectItem value="30">30 {t("duration")}</SelectItem>
                  <SelectItem value="45">45 {t("duration")}</SelectItem>
                  <SelectItem value="60">60 {t("duration")}</SelectItem>
                  <SelectItem value="90">90 {t("duration")}</SelectItem>
                  <SelectItem value="120">120 {t("duration")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
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
              disabled={createRequestMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={createRequestMutation.isPending}>
              {createRequestMutation.isPending ? t("creating") : t("scheduleInterview")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}