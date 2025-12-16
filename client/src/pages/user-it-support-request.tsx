import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Monitor, CheckCircle } from "lucide-react";

const categories = [
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
  { value: "network", label: "Network" },
  { value: "email", label: "Email" },
  { value: "printer", label: "Printer" },
  { value: "security", label: "Security" },
  { value: "general", label: "General" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function UserItSupportRequestPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "general",
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/it-support", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/it-support"] });
      toast({ title: "Success", description: "Your support request has been submitted successfully!" });
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ title: "", description: "", priority: "medium", category: "general" });
        setSubmitted(false);
      }, 3000);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createTicketMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Monitor className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">IT Helpdesk Request</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Submit a helpdesk request and our IT team will help you shortly
          </p>
        </div>

        {submitted ? (
          <Card className="border-2 border-green-500 shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">Request Submitted!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Your IT support request has been submitted successfully.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Our IT team will review your request and contact you shortly.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Describe Your Issue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Laptop won't connect to WiFi"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-support-title"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Please describe your issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  data-testid="input-support-description"
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="select-support-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger data-testid="select-support-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((pri) => (
                        <SelectItem key={pri.value} value={pri.value}>
                          {pri.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={createTicketMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                data-testid="button-submit-support-request"
              >
                {createTicketMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
