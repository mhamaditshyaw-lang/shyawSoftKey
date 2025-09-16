import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, ClockIcon, UserIcon, MessageSquare, Send } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InterviewRequest {
  id: number;
  position: string;
  candidateName: string;
  candidateEmail?: string;
  status: string;
  proposedDateTime: string;
  duration: number;
  requestedBy: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  manager?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  description?: string;
  createdAt: string;
}

interface Comment {
  id: number;
  comment: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}

interface ViewInterviewDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: InterviewRequest;
}

export default function ViewInterviewDetailsModal({
  open,
  onOpenChange,
  interview
}: ViewInterviewDetailsModalProps) {
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();

  // Fetch comments for this interview
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/interviews/${interview.id}/comments`],
    enabled: open,
  });

  const comments = (commentsData as any)?.comments || [];

  // Mutation for adding new comment
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      return await apiRequest('POST', `/api/interviews/${interview.id}/comments`, { comment });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({
        queryKey: [`/api/interviews/${interview.id}/comments`]
      });
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = () => {
    if (commentText.trim()) {
      addCommentMutation.mutate(commentText.trim());
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatUserName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const getInitials = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" data-testid="modal-interview-details">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Interview Details - {interview.position}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[400px] border-2 border-blue-200 rounded-md bg-blue-50/30 p-2" data-testid="scrollable-interview-content">
            <div className="space-y-6 pr-4">
              {/* Interview Information */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold">Interview Information</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Position:</span>
                        <span className="text-sm">{interview.position}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                        <Badge variant={getStatusBadgeVariant(interview.status)} data-testid={`badge-status-${interview.status}`}>
                          {interview.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Request Date:</span>
                        <span className="text-sm">
                          {format(new Date(interview.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Proposed Date/Time:</span>
                        <span className="text-sm">
                          {format(new Date(interview.proposedDateTime), "MMM dd, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Duration:</span>
                        <span className="text-sm">{interview.duration} minutes</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Requested by:</span>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(interview.requestedBy)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{formatUserName(interview.requestedBy)}</span>
                          <Badge variant="outline" className="text-xs">
                            {interview.requestedBy.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                      {interview.manager && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">Manager:</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(interview.manager)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{formatUserName(interview.manager)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Candidate:</span>
                      <span className="text-sm">{interview.candidateName}</span>
                      {interview.candidateEmail && (
                        <span className="text-sm text-muted-foreground">({interview.candidateEmail})</span>
                      )}
                    </div>
                  </div>

                  {interview.description && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Description:</span>
                      <div className="text-sm p-3 bg-muted rounded-md">{interview.description}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Comments Section */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments
                    {comments.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {comments.length}
                      </Badge>
                    )}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {commentsLoading ? (
                        <div className="text-sm text-muted-foreground">Loading comments...</div>
                      ) : comments.length > 0 ? (
                        comments.map((comment: Comment) => (
                          <div key={comment.id} className="border-l-2 border-blue-200 pl-4 py-2 bg-gray-50 rounded-r-md">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {comment.author.firstName?.[0] || comment.author.username[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {comment.author.firstName && comment.author.lastName 
                                  ? `${comment.author.firstName} ${comment.author.lastName}`
                                  : comment.author.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt), "MMM dd, h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No comments yet</p>
                          <p className="text-xs text-muted-foreground">Be the first to add a comment!</p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-20"
                      />
                      <Button 
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || addCommentMutation.isPending}
                        className="w-full"
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}