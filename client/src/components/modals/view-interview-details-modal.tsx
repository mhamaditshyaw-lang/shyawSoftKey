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
  status: string;
  requestDate: string;
  interviewDate?: string;
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
  notes?: string;
  createdAt: string;
}

interface Comment {
  id: number;
  content: string;
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
    queryKey: ['/api/interviews', interview.id, 'comments'],
    enabled: open,
  });

  const comments = (commentsData as any)?.comments || [];

  // Mutation for adding new comment
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('POST', `/api/interviews/${interview.id}/comments`, { content });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({
        queryKey: ['/api/interviews', interview.id, 'comments']
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
          <ScrollArea className="h-full">
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
                          {format(new Date(interview.requestDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {interview.interviewDate && (
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Interview Date:</span>
                          <span className="text-sm">
                            {format(new Date(interview.interviewDate), "MMM dd, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                      )}
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
                  </div>
                  
                  {interview.notes && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                      <div className="text-sm p-3 bg-muted rounded-md">{interview.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Comments Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Comments</h3>
                    <Badge variant="secondary">{comments.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Comment */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[80px]"
                      data-testid="textarea-comment"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || addCommentMutation.isPending}
                        size="sm"
                        className="gap-2"
                        data-testid="button-add-comment"
                      >
                        <Send className="h-4 w-4" />
                        {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Comments List */}
                  <div className="space-y-4">
                    {commentsLoading ? (
                      <div className="text-center text-muted-foreground py-4">
                        Loading comments...
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No comments yet</p>
                        <p className="text-sm">Be the first to add a comment!</p>
                      </div>
                    ) : (
                      comments.map((comment: Comment) => (
                        <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(comment.author)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatUserName(comment.author)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {comment.author.role}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            <div className="text-sm bg-muted p-3 rounded-md">
                              {comment.content}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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