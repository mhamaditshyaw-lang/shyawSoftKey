import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Loader2,
  Monitor,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Filter,
  Trash2,
  Edit,
  PlayCircle,
} from "lucide-react";
import { format } from "date-fns";

interface ItSupportTicket {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  requestedById: number;
  assignedToId: number | null;
  completedById: number | null;
  completedAt: string | null;
  notes: string | null;
  plannedDate: string | null;
  createdAt: string;
  updatedAt: string;
  requestedBy: { id: number; firstName: string; lastName: string } | null;
  assignedTo: { id: number; firstName: string; lastName: string } | null;
  completedBy: { id: number; firstName: string; lastName: string } | null;
}

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
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
];

const statuses = [
  { value: "pending", label: "Pending", icon: Clock, color: "bg-gray-100 text-gray-800" },
  { value: "in_progress", label: "In Progress", icon: PlayCircle, color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Completed", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-800" },
];

export default function ItSupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [editingTicket, setEditingTicket] = useState<ItSupportTicket | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "general",
  });

  const isManager = user?.role === "admin" || user?.role === "manager" || user?.role === "office";

  const { data: tickets = [], isLoading } = useQuery<ItSupportTicket[]>({
    queryKey: ["/api/it-support"],
  });
  const { refetch: refetchTickets } = useQuery({ queryKey: ["/api/it-support"], queryFn: async () => apiRequest('GET', '/api/it-support').then(r => r.json()).then(j => j) , enabled: false });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
    enabled: isManager,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof newTicket) => {
      return apiRequest("POST", "/api/it-support", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/it-support"] });
      toast({ title: "Success", description: "Support request created successfully" });
      setIsCreateOpen(false);
      setNewTicket({ title: "", description: "", priority: "medium", category: "general" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest("PATCH", `/api/it-support/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/it-support"] });
      toast({ title: "Success", description: "Ticket updated successfully" });
      setEditingTicket(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/it-support/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/it-support"] });
      toast({ title: "Success", description: "Ticket deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
    if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
    if (categoryFilter !== "all" && ticket.category !== categoryFilter) return false;
    if (dateFrom) {
      const ticketDate = new Date(ticket.createdAt).getTime();
      const fromDate = new Date(dateFrom).getTime();
      if (ticketDate < fromDate) return false;
    }
    if (dateTo) {
      const ticketDate = new Date(ticket.createdAt).getTime();
      const toDate = new Date(dateTo).setHours(23, 59, 59, 999);
      if (ticketDate > toDate) return false;
    }
    return true;
  });

  const getStatusInfo = (status: string) => {
    return statuses.find((s) => s.value === status) || statuses[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find((p) => p.value === priority) || priorities[1];
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "pending").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    completed: tickets.filter((t) => t.status === "completed").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Monitor className="h-8 w-8 text-blue-600" />
            IT Helpdesk
          </h1>
          <p className="text-muted-foreground mt-1">
            {isManager ? "Manage IT helpdesk requests and tasks" : "Submit and track your IT helpdesk requests"}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-ticket">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create IT Support Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Brief description of the issue"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  data-testid="input-ticket-title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Detailed description of your IT support request..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={4}
                  data-testid="input-ticket-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger data-testid="select-ticket-category">
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
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                  >
                    <SelectTrigger data-testid="select-ticket-priority">
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
                className="w-full"
                onClick={() => createTicketMutation.mutate(newTicket)}
                disabled={!newTicket.title || !newTicket.description || createTicketMutation.isPending}
                data-testid="button-submit-ticket"
              >
                {createTicketMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Monitor className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <PlayCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36" data-testid="filter-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-36" data-testid="filter-priority">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-36" data-testid="filter-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="From Date"
                    data-testid="filter-date-from"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="To Date"
                    data-testid="filter-date-to"
                  />
                  <Button size="sm" variant="ghost" onClick={async () => {
                    // Quick set today
                    const d = new Date();
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const today = `${y}-${m}-${day}`;
                    setDateFrom(today);
                    setDateTo(today);
                    await queryClient.invalidateQueries({ queryKey: ['/api/it-support'] });
                  }} title="Set to today">Today</Button>
                  <Button size="sm" variant="outline" onClick={async () => { await queryClient.invalidateQueries({ queryKey: ['/api/it-support'] }); toast({ title: 'Refreshed', description: 'Tickets refreshed' }); }}>Refresh</Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No support requests found</p>
              <p className="text-muted-foreground">Create a new request to get IT support</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const statusInfo = getStatusInfo(ticket.status);
            const priorityInfo = getPriorityInfo(ticket.priority);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow" data-testid={`ticket-${ticket.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{ticket.title}</h3>
                        <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {ticket.requestedBy
                            ? `${ticket.requestedBy.firstName} ${ticket.requestedBy.lastName}`
                            : "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                        </span>
                        {ticket.assignedTo && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Assigned to: {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                          </span>
                        )}
                        {ticket.plannedDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Planned: {format(new Date(ticket.plannedDate), "MMM dd, yyyy")}
                          </span>
                        )}
                      </div>
                      {ticket.notes && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <strong>Notes:</strong> {ticket.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isManager && (
                        <>
                          {ticket.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateTicketMutation.mutate({
                                  id: ticket.id,
                                  updates: { status: "in_progress" },
                                })
                              }
                              data-testid={`button-start-${ticket.id}`}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {ticket.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() =>
                                updateTicketMutation.mutate({
                                  id: ticket.id,
                                  updates: { status: "completed" },
                                })
                              }
                              data-testid={`button-complete-${ticket.id}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTicket(ticket)}
                            data-testid={`button-edit-${ticket.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this ticket?")) {
                                deleteTicketMutation.mutate(ticket.id);
                              }
                            }}
                            data-testid={`button-delete-${ticket.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {!isManager && ticket.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() =>
                            updateTicketMutation.mutate({
                              id: ticket.id,
                              updates: { status: "cancelled" },
                            })
                          }
                          data-testid={`button-cancel-${ticket.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        </div>
      </div>

      <Dialog open={!!editingTicket} onOpenChange={() => setEditingTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
          </DialogHeader>
          {editingTicket && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editingTicket.status}
                  onValueChange={(value) =>
                    setEditingTicket({ ...editingTicket, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={editingTicket.priority}
                  onValueChange={(value) =>
                    setEditingTicket({ ...editingTicket, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Planned Date</label>
                <Input
                  type="date"
                  value={
                    editingTicket.plannedDate
                      ? new Date(editingTicket.plannedDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditingTicket({
                      ...editingTicket,
                      plannedDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Add notes about the ticket..."
                  value={editingTicket.notes || ""}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Button
                className="w-full"
                onClick={() =>
                  updateTicketMutation.mutate({
                    id: editingTicket.id,
                    updates: {
                      status: editingTicket.status,
                      priority: editingTicket.priority,
                      plannedDate: editingTicket.plannedDate,
                      notes: editingTicket.notes,
                    },
                  })
                }
                disabled={updateTicketMutation.isPending}
              >
                {updateTicketMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
