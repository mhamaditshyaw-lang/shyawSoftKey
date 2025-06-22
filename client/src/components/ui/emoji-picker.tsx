import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Star, Award, TrendingUp, CheckCircle, AlertCircle, Users, Calendar, Target, Heart } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  selectedEmoji?: string;
}

const emojiCategories = [
  {
    name: "Performance",
    emojis: [
      { emoji: "⭐", icon: Star, label: "Excellent" },
      { emoji: "🏆", icon: Award, label: "Outstanding" },
      { emoji: "📈", icon: TrendingUp, label: "Improving" },
      { emoji: "✅", icon: CheckCircle, label: "Completed" },
      { emoji: "🎯", icon: Target, label: "Goal Achieved" },
      { emoji: "💪", icon: null, label: "Strong Performance" },
    ]
  },
  {
    name: "Feedback",
    emojis: [
      { emoji: "😊", icon: Smile, label: "Positive" },
      { emoji: "👍", icon: null, label: "Good Job" },
      { emoji: "❤️", icon: Heart, label: "Loved It" },
      { emoji: "🔥", icon: null, label: "Amazing" },
      { emoji: "💡", icon: null, label: "Great Idea" },
      { emoji: "🌟", icon: null, label: "Star Quality" },
    ]
  },
  {
    name: "Areas",
    emojis: [
      { emoji: "⚠️", icon: AlertCircle, label: "Needs Attention" },
      { emoji: "📚", icon: null, label: "Learning" },
      { emoji: "🔄", icon: null, label: "In Progress" },
      { emoji: "🎓", icon: null, label: "Training" },
      { emoji: "🤝", icon: Users, label: "Teamwork" },
      { emoji: "📅", icon: Calendar, label: "Scheduled" },
    ]
  }
];

export function EmojiPicker({ onEmojiSelect, selectedEmoji }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          {selectedEmoji ? (
            <span className="text-base">{selectedEmoji}</span>
          ) : (
            <Smile className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <h4 className="font-medium text-sm mb-3">Select an emoji</h4>
          <div className="space-y-4">
            {emojiCategories.map((category) => (
              <div key={category.name}>
                <h5 className="text-xs font-medium text-gray-500 mb-2">{category.name}</h5>
                <div className="grid grid-cols-6 gap-1">
                  {category.emojis.map((item) => (
                    <Button
                      key={item.emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                      onClick={() => handleEmojiClick(item.emoji)}
                      title={item.label}
                    >
                      <span className="text-base">{item.emoji}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick remove option */}
          <div className="border-t mt-4 pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-500"
              onClick={() => handleEmojiClick("")}
            >
              Remove emoji
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}