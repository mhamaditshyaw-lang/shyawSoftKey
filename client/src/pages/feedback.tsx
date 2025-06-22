import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Plus, Star, Calendar, User } from "lucide-react";
import FeedbackModal from "@/components/modals/feedback-modal";
import { getRelativeTime } from "@/lib/utils";

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ["/api/feedback"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/feedback");
      return await response.json();
    },
  });

  const { data: interviewsData } = useQuery({
    queryKey: ["/api/interviews"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/interviews");
      return await response.json();
    },
  });

  const feedbackList = feedbackData?.feedback || [];
  const interviews = interviewsData?.requests || [];

  const filteredFeedback = feedbackList.filter((item: any) => {
    return typeFilter === "all" || item.type === typeFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "interview_feedback":
        return "bg-blue-100 text-blue-800";
      case "general_feedback":
        return "bg-green-100 text-green-800";
      case "system_improvement":
        return "bg-purple-100 text-purple-800";
      case "user_experience":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingStars = (rating: string) => {
    const stars = [];
    const ratingNum = parseInt(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= ratingNum ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const getRelatedInterviewTitle = (interviewId: number) => {
    const interview = interviews.find((i: any) => i.id === interviewId);
    return interview ? `${interview.position} - ${interview.candidateName}` : "Unknown Interview";
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Feedback & Reviews</h2>
            <p className="text-gray-600">Collect and manage feedback for interviews and system improvements</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowFeedbackModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Submit Feedback
            </Button>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="interview_feedback">Interview Feedback</SelectItem>
                <SelectItem value="general_feedback">General Feedback</SelectItem>
                <SelectItem value="system_improvement">System Improvement</SelectItem>
                <SelectItem value="user_experience">User Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Feedback Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{feedbackList.length}</p>
                <p className="text-gray-600">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {feedbackList.filter((f: any) => f.rating && parseInt(f.rating) >= 4).length}
                </p>
                <p className="text-gray-600">High Rated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {feedbackList.filter((f: any) => f.type === "interview_feedback").length}
                </p>
                <p className="text-gray-600">Interview Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(feedbackList.map((f: any) => f.submittedBy.id)).size}
                </p>
                <p className="text-gray-600">Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <div className="space-y-6">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-600 mb-4">
                {typeFilter === "all" 
                  ? "No feedback has been submitted yet."
                  : `No ${typeFilter.replace('_', ' ')} feedback found.`
                }
              </p>
              <Button onClick={() => setShowFeedbackModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Submit First Feedback
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                      {item.rating && (
                        <div className="flex space-x-1">
                          {getRatingStars(item.rating)}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4">{item.description}</p>
                    
                    {item.relatedInterviewId && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Related Interview:</p>
                        <p className="text-sm text-gray-900">
                          {getRelatedInterviewTitle(item.relatedInterviewId)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>
                          By {item.submittedBy.firstName} {item.submittedBy.lastName}
                        </span>
                        <span>•</span>
                        <span>{getRelativeTime(item.createdAt)}</span>
                      </div>
                      
                      {(user?.role === "admin" || user?.role === "manager") && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Reply
                          </Button>
                          <Button variant="outline" size="sm">
                            Archive
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <FeedbackModal 
        open={showFeedbackModal} 
        onOpenChange={setShowFeedbackModal} 
        interviews={interviews}
      />
    </div>
  );
}