import { db } from "./db";
import { feedback, archivedItems, feedbackTypes, InsertFeedback, InsertArchivedItem, InsertFeedbackType, insertFeedbackSchema, insertFeedbackTypeSchema, insertArchivedItemSchema } from "../shared/feedback-schema";
import { users, interviewRequests, todoLists } from "../shared/schema";
import { eq, desc } from "drizzle-orm";

export class FeedbackService {
  static async createFeedback(feedbackData: InsertFeedback): Promise<any> {
    if (!feedbackData || typeof feedbackData !== 'object' || Object.keys(feedbackData).length === 0) {
      throw new Error('Feedback data is empty or not an object.');
    }
    // Accept both camelCase and snake_case for submittedById
    const insertObj = {
      type: (feedbackData as any).type,
      title: (feedbackData as any).title,
      description: (feedbackData as any).description,
      rating: (feedbackData as any).rating,
      submittedById: (feedbackData as any).submittedById ?? (feedbackData as any).submitted_by_id,
      relatedInterviewId: (feedbackData as any).relatedInterviewId ?? (feedbackData as any).related_interview_id,
    };
    const [newFeedback] = await db.insert(feedback).values(insertObj).returning();
    return newFeedback;
  }

  static async getAllFeedback(): Promise<any[]> {
    const feedbackList = await db
      .select({
        id: feedback.id,
        type: feedback.type,
        title: feedback.title,
        description: feedback.description,
        rating: feedback.rating,
        relatedInterviewId: feedback.relatedInterviewId,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        submittedBy: {
          id: users.id,
          firstName: users.first_name,
          lastName: users.last_name,
          email: users.email,
        },
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.submittedById, users.id))
      .orderBy(desc(feedback.createdAt));

    return feedbackList;
  }

  static async archiveItem(
    itemType: string,
    itemId: number,
    itemData: any,
    archivedById: number,
    reason?: string
  ): Promise<any> {
    if (!itemType || !itemId || !itemData || !archivedById) {
      throw new Error('Archive data is missing required fields.');
    }
    // Normalize and validate using insertArchivedItemSchema
    const archiveObj = {
      itemType,
      itemId,
      itemData: JSON.stringify(itemData),
      archivedById,
      reason,
    };
    const [archivedItem] = await db.insert(archivedItems).values(archiveObj).returning();
    return archivedItem;
  }

  static async getArchivedItems(): Promise<any[]> {
    const archived = await db
      .select({
        id: archivedItems.id,
        itemType: archivedItems.itemType,
        itemId: archivedItems.itemId,
        itemData: archivedItems.itemData,
        reason: archivedItems.reason,
        archivedAt: archivedItems.archivedAt,
        archivedBy: {
          id: users.id,
          firstName: users.first_name,
          lastName: users.last_name,
          email: users.email,
        },
      })
      .from(archivedItems)
      .leftJoin(users, eq(archivedItems.archivedById, users.id))
      .orderBy(desc(archivedItems.archivedAt));

    return archived;
  }

  static async updateArchivedItem(archiveId: number, updates: any): Promise<any> {
    const [updatedItem] = await db
      .update(archivedItems)
      .set(updates)
      .where(eq(archivedItems.id, archiveId))
      .returning();

    return updatedItem;
  }

  static async restoreItem(archiveId: number, itemType: string): Promise<void> {
    // Get the archived item
    const [archivedItem] = await db
      .select()
      .from(archivedItems)
      .where(eq(archivedItems.id, archiveId));

    if (!archivedItem) {
      throw new Error("Archived item not found");
    }

    const itemData = JSON.parse(archivedItem.itemData);

    // Restore the item based on type
    switch (itemType) {
      case "interview":
        await db.insert(interviewRequests).values({
          ...itemData,
          id: undefined, // Let the database generate a new ID
          createdAt: undefined,
        });
        break;
      case "todo":
        await db.insert(todoLists).values({
          ...itemData,
          id: undefined,
          createdAt: undefined,
        });
        break;
      case "user":
        await db.insert(users).values({
          ...itemData,
          id: undefined,
          createdAt: undefined,
        });
        break;
      default:
        throw new Error(`Cannot restore item of type: ${itemType}`);
    }

    // Remove from archive
    await db.delete(archivedItems).where(eq(archivedItems.id, archiveId));
  }

  // Feedback Types Management
  static async createFeedbackType(feedbackTypeData: InsertFeedbackType): Promise<any> {
    // Accept both camelCase and snake_case for displayName/createdById
    const typeObj = {
      name: (feedbackTypeData as any).name,
      displayName: (feedbackTypeData as any).displayName ?? (feedbackTypeData as any).display_name,
      createdById: (feedbackTypeData as any).createdById ?? (feedbackTypeData as any).created_by_id,
      description: (feedbackTypeData as any).description,
      isActive: (feedbackTypeData as any).isActive,
    };
    const [newType] = await db.insert(feedbackTypes).values(typeObj).returning();
    return newType;
  }

  static async getAllFeedbackTypes(): Promise<any[]> {
    const types = await db
      .select({
        id: feedbackTypes.id,
        name: feedbackTypes.name,
        displayName: feedbackTypes.displayName,
        description: feedbackTypes.description,
        isActive: feedbackTypes.isActive,
        createdAt: feedbackTypes.createdAt,
        createdBy: {
          id: users.id,
          firstName: users.first_name,
          lastName: users.last_name,
        },
      })
      .from(feedbackTypes)
      .leftJoin(users, eq(feedbackTypes.createdById, users.id))
      .where(eq(feedbackTypes.isActive, 1))
      .orderBy(feedbackTypes.displayName);

    return types;
  }

  static async updateFeedbackType(typeId: number, updates: Partial<InsertFeedbackType>): Promise<any> {
    const [updatedType] = await db
      .update(feedbackTypes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(feedbackTypes.id, typeId))
      .returning();

    return updatedType;
  }

  static async deleteFeedbackType(typeId: number): Promise<void> {
    await db
      .update(feedbackTypes)
      .set({ isActive: 0, updatedAt: new Date() })
      .where(eq(feedbackTypes.id, typeId));
  }
}