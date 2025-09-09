import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Plus } from "lucide-react";
import { authenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviews: any[];
}

export default function FeedbackModal({ open, onOpenChange, interviews }: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    type: "general_feedback",
    title: "",
    description: "",
    rating: "",
    relatedInterviewId: "none",
  });
  const [selectedRating, setSelectedRating] = useState(0);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newTypeData, setNewTypeData] = useState({
    name: "",
    displayName: "",
    description: ""
  });
  const [descriptionLists, setDescriptionLists] = useState<{id: string, title: string, items: string[]}[]>([]);
  const [reminders, setReminders] = useState<{id: string, title: string, dueDate: string, completed: boolean}[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListItem, setNewListItem] = useState("");
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fetch feedback types from API
  const { data: feedbackTypes, isLoading: typesLoading } = useQuery({
    queryKey: ["/api/feedback-types"],
    queryFn: async () => {
      const response = await authenticatedRequest("GET", "/api/feedback-types");
      const data = await response.json();
      return data.feedbackTypes;
    },
  });

  // Mutation for creating new feedback types
  const createTypeMutation = useMutation({
    mutationFn: async (typeData: any) => {
      const response = await authenticatedRequest("POST", "/api/feedback-types", typeData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback-types"] });
      toast({
        title: "Success",
        description: "New feedback type added successfully",
      });
      setNewTypeData({ name: "", displayName: "", description: "" });
      setShowAddTypeModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add feedback type",
        variant: "destructive",
      });
    },
  });

  const createFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      const response = await authenticatedRequest("POST", "/api/feedback", {
        ...feedbackData,
        rating: feedbackData.rating || undefined,
        relatedInterviewId: feedbackData.relatedInterviewId && feedbackData.relatedInterviewId !== "none" 
          ? parseInt(feedbackData.relatedInterviewId) 
          : undefined,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      type: "general_feedback",
      title: "",
      description: "",
      rating: "",
      relatedInterviewId: "none",
    });
    setSelectedRating(0);
    setDescriptionLists([]);
    setReminders([]);
  };

  const addListToDescription = (title: string, items: string[]) => {
    const newList = { id: Date.now().toString(), title, items };
    setDescriptionLists([...descriptionLists, newList]);
    updateDescriptionWithLists([...descriptionLists, newList]);
  };

  const addReminderToDescription = (title: string, dueDate: string) => {
    const newReminder = { id: Date.now().toString(), title, dueDate, completed: false };
    setReminders([...reminders, newReminder]);
    updateDescriptionWithReminders([...reminders, newReminder]);
  };

  const updateDescriptionWithLists = (lists: typeof descriptionLists) => {
    let description = formData.description;
    const listsText = lists.map(list => 
      `\n\n**${list.title}:**\n${list.items.map(item => `• ${item}`).join('\n')}`
    ).join('');
    
    // Remove existing lists from description
    const cleanDescription = description.replace(/\n\n\*\*.*:\*\*[\s\S]*?(?=\n\n|$)/g, '');
    setFormData({...formData, description: cleanDescription + listsText});
  };

  const updateDescriptionWithReminders = (remindersList: typeof reminders) => {
    let description = formData.description;
    const remindersText = remindersList.length > 0 ? 
      `\n\n**Reminders:**\n${remindersList.map(reminder => 
        `• ${reminder.title} (Due: ${reminder.dueDate}) ${reminder.completed ? '✓' : '○'}`
      ).join('\n')}` : '';
    
    // Remove existing reminders from description
    const cleanDescription = description.replace(/\n\n\*\*Reminders:\*\*[\s\S]*?(?=\n\n|$)/g, '');
    setFormData({...formData, description: cleanDescription + remindersText});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeedbackMutation.mutate({
      ...formData,
      rating: selectedRating > 0 ? selectedRating.toString() : undefined,
    });
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setFormData({ ...formData, rating: rating.toString() });
  };

  const showRating = formData.type === "interview_feedback" || formData.type === "user_experience";
  const showInterviewSelect = formData.type === "interview_feedback";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Share your feedback to help us improve our system and processes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="type">Feedback Type</Label>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setShowAddTypeModal(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Type
              </Button>
            </div>
            <Select 
              value={formData.type} 
              onValueChange={(value) => {
                setFormData({ ...formData, type: value, relatedInterviewId: "none" });
                setSelectedRating(0);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typesLoading ? (
                  <SelectItem value="loading" disabled>Loading types...</SelectItem>
                ) : (
                  Array.isArray(feedbackTypes) ? feedbackTypes.map((type: any) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.displayName}
                    </SelectItem>
                  )) : [
                    // Fallback types if API fails
                    <SelectItem key="general" value="general_feedback">General Feedback</SelectItem>,
                    <SelectItem key="interview" value="interview_feedback">Interview Feedback</SelectItem>,
                    <SelectItem key="system" value="system_improvement">System Improvement</SelectItem>,
                    <SelectItem key="ux" value="user_experience">User Experience</SelectItem>
                  ]
                )}
              </SelectContent>
            </Select>
          </div>

          {showInterviewSelect && (
            <div className="space-y-2">
              <Label htmlFor="relatedInterviewId">Related Interview (Optional)</Label>
              <Select 
                value={formData.relatedInterviewId} 
                onValueChange={(value) => setFormData({ ...formData, relatedInterviewId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an interview" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific interview</SelectItem>
                  {interviews.map((interview: any) => (
                    <SelectItem key={interview.id} value={interview.id.toString()}>
                      {interview.position} - {interview.candidateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief summary of your feedback"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowListModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add List
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReminderModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Reminder
                </Button>
              </div>
            </div>
            <Textarea
              id="description"
              placeholder="Detailed feedback and suggestions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              required
            />
            
            {/* Show current lists and reminders */}
            {(descriptionLists.length > 0 || reminders.length > 0) && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-sm font-medium mb-2">Current Lists & Reminders:</div>
                {descriptionLists.map(list => (
                  <div key={list.id} className="mb-2">
                    <div className="font-medium text-sm">{list.title}:</div>
                    <ul className="text-xs ml-2">
                      {list.items.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {reminders.map(reminder => (
                  <div key={reminder.id} className="mb-1 text-xs">
                    <span className={reminder.completed ? 'line-through' : ''}>
                      📅 {reminder.title} (Due: {reminder.dueDate})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showRating && (
            <div className="space-y-2">
              <Label>Rating (Optional)</Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        rating <= selectedRating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={createFeedbackMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createFeedbackMutation.isPending}>
              {createFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Add New Type Modal */}
      <Dialog open={showAddTypeModal} onOpenChange={setShowAddTypeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addNewFeedbackType")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type-name">Type Name</Label>
              <Input
                id="type-name"
                placeholder="Enter type name (e.g., performance_review)"
                value={newTypeData.name}
                onChange={(e) => setNewTypeData({...newTypeData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                placeholder="Enter display name (e.g., Performance Review)"
                value={newTypeData.displayName}
                onChange={(e) => setNewTypeData({...newTypeData, displayName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="type-description">Description (Optional)</Label>
              <Textarea
                id="type-description"
                placeholder="Describe when this feedback type should be used..."
                value={newTypeData.description}
                onChange={(e) => setNewTypeData({...newTypeData, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => {
              setShowAddTypeModal(false);
              setNewTypeData({ name: "", displayName: "", description: "" });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newTypeData.name.trim() && newTypeData.displayName.trim()) {
                  createTypeMutation.mutate(newTypeData);
                }
              }}
              disabled={createTypeMutation.isPending || !newTypeData.name.trim() || !newTypeData.displayName.trim()}
            >
              {createTypeMutation.isPending ? "Adding..." : "Add Type"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New List Modal */}
      <Dialog open={showListModal} onOpenChange={setShowListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="list-title">List Title</Label>
              <Input
                id="list-title"
                placeholder="Enter list title..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="list-item">Add Items</Label>
              <div className="flex space-x-2">
                <Input
                  id="list-item"
                  placeholder="Enter list item..."
                  value={newListItem}
                  onChange={(e) => setNewListItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newListItem.trim()) {
                      const currentItems = newListTitle ? (
                        descriptionLists.find(list => list.title === newListTitle)?.items || []
                      ) : [];
                      if (newListTitle.trim()) {
                        addListToDescription(newListTitle, [...currentItems, newListItem.trim()]);
                        setNewListItem("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newListItem.trim() && newListTitle.trim()) {
                      const currentItems = descriptionLists.find(list => list.title === newListTitle)?.items || [];
                      addListToDescription(newListTitle, [...currentItems, newListItem.trim()]);
                      setNewListItem("");
                    }
                  }}
                >
                  Add Item
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => {
              setShowListModal(false);
              setNewListTitle("");
              setNewListItem("");
            }}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Reminder Modal */}
      <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reminder-title">Reminder Title</Label>
              <Input
                id="reminder-title"
                placeholder="Enter reminder title..."
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reminder-date">Due Date</Label>
              <Input
                id="reminder-date"
                type="date"
                value={newReminderDate}
                onChange={(e) => setNewReminderDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => {
              setShowReminderModal(false);
              setNewReminderTitle("");
              setNewReminderDate("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newReminderTitle.trim() && newReminderDate) {
                  addReminderToDescription(newReminderTitle, newReminderDate);
                  setNewReminderTitle("");
                  setNewReminderDate("");
                  setShowReminderModal(false);
                }
              }}
              disabled={!newReminderTitle.trim() || !newReminderDate}
            >
              Add Reminder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}