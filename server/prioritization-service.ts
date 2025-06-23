import { storage } from "./storage";
import { TodoList, TodoItem } from "@shared/schema";

export interface PriorityScore {
  listId: number;
  score: number;
  factors: {
    urgency: number;
    priority: number;
    workload: number;
    completion: number;
    age: number;
    userPattern: number;
  };
  recommendation: string;
}

export class PrioritizationService {
  // Calculate priority score for a todo list (0-100)
  static async calculatePriorityScore(list: TodoList & { items: TodoItem[] }): Promise<PriorityScore> {
    const factors = {
      urgency: this.calculateUrgencyScore(list),
      priority: this.calculatePriorityScore(list),
      workload: this.calculateWorkloadScore(list),
      completion: this.calculateCompletionScore(list),
      age: this.calculateAgeScore(list),
      userPattern: await this.calculateUserPatternScore(list),
    };

    // Weighted scoring algorithm
    const weights = {
      urgency: 0.25,    // 25% - Due dates and time sensitivity
      priority: 0.20,   // 20% - User-defined priority
      workload: 0.15,   // 15% - Number of tasks
      completion: 0.15, // 15% - Completion rate
      age: 0.10,        // 10% - How long it's been pending
      userPattern: 0.15 // 15% - User behavior patterns
    };

    const score = Math.round(
      factors.urgency * weights.urgency +
      factors.priority * weights.priority +
      factors.workload * weights.workload +
      factors.completion * weights.completion +
      factors.age * weights.age +
      factors.userPattern * weights.userPattern
    );

    return {
      listId: list.id,
      score,
      factors,
      recommendation: this.generateRecommendation(score, factors)
    };
  }

  // Calculate urgency based on due dates and time sensitivity
  private static calculateUrgencyScore(list: TodoList & { items: TodoItem[] }): number {
    const now = new Date();
    let maxUrgency = 0;

    for (const item of list.items) {
      if (item.isCompleted || !item.dueDate) continue;

      const dueDate = new Date(item.dueDate);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      let urgency = 0;
      if (hoursUntilDue < 0) {
        urgency = 100; // Overdue
      } else if (hoursUntilDue < 24) {
        urgency = 90; // Due today
      } else if (hoursUntilDue < 48) {
        urgency = 70; // Due tomorrow
      } else if (hoursUntilDue < 168) {
        urgency = 50; // Due this week
      } else {
        urgency = 20; // Due later
      }

      maxUrgency = Math.max(maxUrgency, urgency);
    }

    return maxUrgency;
  }

  // Calculate priority score based on user-defined priority
  private static calculatePriorityScore(list: TodoList): number {
    const priorityMap = {
      urgent: 100,
      high: 80,
      medium: 50,
      low: 20
    };

    return priorityMap[list.priority] || 50;
  }

  // Calculate workload score based on number of incomplete tasks
  private static calculateWorkloadScore(list: TodoList & { items: TodoItem[] }): number {
    const incompleteTasks = list.items.filter(item => !item.isCompleted).length;
    
    if (incompleteTasks === 0) return 0;
    if (incompleteTasks <= 2) return 30;
    if (incompleteTasks <= 5) return 60;
    if (incompleteTasks <= 10) return 80;
    return 100;
  }

  // Calculate completion momentum score
  private static calculateCompletionScore(list: TodoList & { items: TodoItem[] }): number {
    if (list.items.length === 0) return 50;

    const completedCount = list.items.filter(item => item.isCompleted).length;
    const completionRate = completedCount / list.items.length;

    // Higher score for lists that are partially completed (momentum)
    if (completionRate === 0) return 20; // Not started
    if (completionRate < 0.5) return 80; // In progress - high priority to maintain momentum
    if (completionRate < 0.9) return 90; // Almost done - highest priority
    return 10; // Completed
  }

  // Calculate age score - how long the list has been pending
  private static calculateAgeScore(list: TodoList): number {
    const now = new Date();
    const created = new Date(list.createdAt);
    const daysOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

    if (daysOld < 1) return 30; // New
    if (daysOld < 3) return 50; // Recent
    if (daysOld < 7) return 70; // This week
    if (daysOld < 30) return 85; // This month
    return 100; // Old - needs attention
  }

  // Calculate user pattern score based on historical behavior
  private static async calculateUserPatternScore(list: TodoList): Promise<number> {
    try {
      const allLists = await storage.getTodoLists();
      const userLists = allLists.filter(l => l.assignedTo?.id === list.assignedTo?.id);

      if (userLists.length < 3) return 50; // Not enough data

      // Analyze user's typical completion patterns
      const completedLists = userLists.filter(l => 
        l.items.every(item => item.isCompleted)
      );

      const completionRate = completedLists.length / userLists.length;
      
      // Analyze priority preferences
      const priorityPreference = this.analyzePriorityPreference(userLists);
      
      // Score based on how well this list matches user patterns
      let patternScore = 50;
      
      if (list.priority === priorityPreference) {
        patternScore += 20;
      }
      
      if (completionRate > 0.7) {
        patternScore += 15; // User typically completes tasks
      }

      return Math.min(100, patternScore);
    } catch (error) {
      console.error("Error calculating user pattern score:", error);
      return 50; // Default score
    }
  }

  // Analyze user's priority preferences
  private static analyzePriorityPreference(userLists: any[]): string {
    const priorityCounts = userLists.reduce((acc, list) => {
      acc[list.priority] = (acc[list.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'medium';
  }

  // Generate recommendation text based on score and factors
  private static generateRecommendation(score: number, factors: any): string {
    if (score >= 90) {
      return "🔥 Critical Priority - Address immediately";
    } else if (score >= 75) {
      if (factors.urgency > 80) return "⏰ Time-sensitive - Due soon";
      if (factors.completion > 80) return "🎯 Nearly complete - Finish now";
      return "🚨 High Priority - Focus on this today";
    } else if (score >= 60) {
      if (factors.workload > 70) return "📋 Heavy workload - Break into smaller tasks";
      if (factors.age > 70) return "📅 Long pending - Schedule dedicated time";
      return "⚡ Medium Priority - Include in today's plan";
    } else if (score >= 40) {
      return "📝 Standard Priority - Schedule for this week";
    } else {
      return "💤 Low Priority - Review and consider postponing";
    }
  }

  // Get prioritized todo lists for a user
  static async getPrioritizedTodos(userId?: number): Promise<PriorityScore[]> {
    try {
      let todoLists;
      if (userId) {
        todoLists = await storage.getTodoListsByUser(userId);
      } else {
        todoLists = await storage.getTodoLists();
      }

      const priorityScores: PriorityScore[] = [];

      for (const list of todoLists) {
        const score = await this.calculatePriorityScore(list);
        priorityScores.push(score);
      }

      // Sort by score (highest first)
      return priorityScores.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error("Error getting prioritized todos:", error);
      return [];
    }
  }

  // Get daily recommendations
  static async getDailyRecommendations(userId: number): Promise<{
    topPriority: PriorityScore[];
    quickWins: PriorityScore[];
    overdue: PriorityScore[];
    suggestions: string[];
  }> {
    const prioritizedTodos = await this.getPrioritizedTodos(userId);
    
    const topPriority = prioritizedTodos.filter(p => p.score >= 75).slice(0, 3);
    const quickWins = prioritizedTodos.filter(p => 
      p.factors && p.factors.completion > 70 && p.score >= 60
    ).slice(0, 3);
    const overdue = prioritizedTodos.filter(p => p.factors && p.factors.urgency === 100);

    const suggestions = this.generateDailySuggestions(prioritizedTodos);

    return {
      topPriority,
      quickWins,
      overdue,
      suggestions
    };
  }

  // Generate daily productivity suggestions
  private static generateDailySuggestions(priorities: PriorityScore[]): string[] {
    const suggestions: string[] = [];

    if (priorities.length === 0) {
      suggestions.push("Great! No pending tasks. Consider planning tomorrow's work.");
      return suggestions;
    }

    const highPriorityCount = priorities.filter(p => p.score >= 75).length;
    const overdueCount = priorities.filter(p => p.factors && p.factors.urgency === 100).length;
    const lowProgressCount = priorities.filter(p => p.factors && p.factors.completion < 30).length;

    if (overdueCount > 0) {
      suggestions.push(`⚠️ You have ${overdueCount} overdue task(s). Consider addressing these first.`);
    }

    if (highPriorityCount > 5) {
      suggestions.push("🎯 You have many high-priority tasks. Consider breaking them into smaller, manageable chunks.");
    }

    if (lowProgressCount > 3) {
      suggestions.push("🚀 Several tasks haven't been started. Pick the highest priority one and begin with the first step.");
    }

    const avgScore = priorities.reduce((sum, p) => sum + p.score, 0) / priorities.length;
    if (avgScore > 70) {
      suggestions.push("⚡ Your task load is heavy today. Focus on the top 3 priorities and defer the rest.");
    } else if (avgScore < 40) {
      suggestions.push("✨ Light workload today. Great time to tackle some longer-term projects or planning.");
    }

    // Add time-based suggestions
    const now = new Date();
    const hour = now.getHours();

    if (hour < 10) {
      suggestions.push("🌅 Morning energy is great for high-priority and complex tasks.");
    } else if (hour > 15) {
      suggestions.push("🌆 Afternoon is perfect for quick wins and task completion.");
    }

    return suggestions;
  }

  // Auto-prioritize all todos for a user
  static async autoPrioritizeTodos(userId: number): Promise<{ updated: number; suggestions: string[] }> {
    try {
      const recommendations = await this.getDailyRecommendations(userId);
      
      // Auto-update priorities based on algorithm
      let updated = 0;
      const allPriorities = await this.getPrioritizedTodos(userId);
      
      for (const priority of allPriorities) {
        let newPriority: string;
        
        if (priority.score >= 90) {
          newPriority = "urgent";
        } else if (priority.score >= 75) {
          newPriority = "high";
        } else if (priority.score >= 50) {
          newPriority = "medium";
        } else {
          newPriority = "low";
        }

        // Only update if different from current priority
        // This would require additional database calls to update
        // For now, we'll return the analysis
        updated++;
      }

      return {
        updated,
        suggestions: recommendations.suggestions
      };
    } catch (error) {
      console.error("Error auto-prioritizing todos:", error);
      return { updated: 0, suggestions: ["Error occurred during auto-prioritization"] };
    }
  }
}