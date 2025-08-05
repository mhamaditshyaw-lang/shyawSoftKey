import { db } from "./db";
import { feedback, archivedItems, feedbackTypes, InsertFeedback, InsertArchivedItem, InsertFeedbackType } from "../shared/feedback-schema";
import { users, interviewRequests, todoLists } from "../shared/schema";
import { eq, desc } from "drizzle-orm";

export class FeedbackService {
  static async createFeedback(feedbackData: InsertFeedback): Promise<any> {
    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
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
          firstName: users.firstName,
          lastName: users.lastName,
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
    const archiveData: InsertArchivedItem = {
      itemType,
      itemId,
      itemData: JSON.stringify(itemData),
      archivedById,
      reason,
    };

    const [archivedItem] = await db.insert(archivedItems).values(archiveData).returning();
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
          firstName: users.firstName,
          lastName: users.lastName,
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
    const [newType] = await db.insert(feedbackTypes).values(feedbackTypeData).returning();
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
          firstName: users.firstName,
          lastName: users.lastName,
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