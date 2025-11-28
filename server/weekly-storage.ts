import { 
  weeklyMeetings, 
  weeklyMeetingTasks, 
  departmentTaskProgress, 
  weeklyMeetingArchive,
  type WeeklyMeeting,
  type InsertWeeklyMeeting,
  type WeeklyMeetingTask,
  type InsertWeeklyMeetingTask,
  type DepartmentTaskProgress,
  type InsertDepartmentTaskProgress,
  type WeeklyMeetingArchive,
  type InsertWeeklyMeetingArchive,
} from "@shared/schema";
import { db, executeWithRetry } from "./db";
import { eq, desc } from "drizzle-orm";

export class WeeklyMeetingStorage {
  async createWeeklyMeeting(data: InsertWeeklyMeeting): Promise<WeeklyMeeting> {
    return await executeWithRetry(async () => {
      const result = await db.insert(weeklyMeetings).values(data).returning();
      return (result as WeeklyMeeting[])[0];
    });
  }

  async getWeeklyMeetings(): Promise<WeeklyMeeting[]> {
    return await executeWithRetry(async () => {
      const result = await db.select().from(weeklyMeetings).orderBy(desc(weeklyMeetings.createdAt));
      return result as WeeklyMeeting[];
    });
  }

  async getWeeklyMeeting(id: number): Promise<WeeklyMeeting | undefined> {
    return await executeWithRetry(async () => {
      const result = await db.select().from(weeklyMeetings).where(eq(weeklyMeetings.id, id));
      return (result as WeeklyMeeting[])[0] || undefined;
    });
  }

  async createWeeklyMeetingTask(data: InsertWeeklyMeetingTask): Promise<WeeklyMeetingTask> {
    return await executeWithRetry(async () => {
      const result = await db.insert(weeklyMeetingTasks).values(data).returning();
      return (result as WeeklyMeetingTask[])[0];
    });
  }

  async getWeeklyMeetingTasks(meetingId: number): Promise<WeeklyMeetingTask[]> {
    return await executeWithRetry(async () => {
      const result = await db.select().from(weeklyMeetingTasks).where(eq(weeklyMeetingTasks.meetingId, meetingId));
      return result as WeeklyMeetingTask[];
    });
  }

  async updateDepartmentTaskProgress(taskId: number, departmentHeadId: number, updates: Partial<DepartmentTaskProgress>): Promise<DepartmentTaskProgress> {
    return await executeWithRetry(async () => {
      const result = await db
        .update(departmentTaskProgress)
        .set(updates as any)
        .where(
          (col) =>
            col.and(
              eq(departmentTaskProgress.taskId, taskId),
              eq(departmentTaskProgress.departmentHeadId, departmentHeadId)
            ) as any
        )
        .returning();
      
      if ((result as DepartmentTaskProgress[]).length === 0) {
        const inserted = await db
          .insert(departmentTaskProgress)
          .values({
            taskId,
            departmentHeadId,
            ...updates,
          } as any)
          .returning();
        return (inserted as DepartmentTaskProgress[])[0];
      }
      
      return (result as DepartmentTaskProgress[])[0];
    });
  }

  async getWeeklyMeetingArchive(meetingId: number): Promise<WeeklyMeetingArchive[]> {
    return await executeWithRetry(async () => {
      const result = await db.select().from(weeklyMeetingArchive).where(eq(weeklyMeetingArchive.meetingId, meetingId));
      return result as WeeklyMeetingArchive[];
    });
  }

  async archiveWeeklyMeeting(meetingId: number, archivedById: number, resultsData: any): Promise<WeeklyMeetingArchive> {
    return await executeWithRetry(async () => {
      const meeting = await this.getWeeklyMeeting(meetingId);
      const tasks = await this.getWeeklyMeetingTasks(meetingId);

      if (!meeting) throw new Error("Meeting not found");

      const result = await db
        .insert(weeklyMeetingArchive)
        .values({
          meetingId,
          meetingData: JSON.stringify(meeting),
          tasksData: JSON.stringify(tasks),
          resultsData: JSON.stringify(resultsData),
          archivedById,
        } as any)
        .returning();

      await db.update(weeklyMeetings).set({ status: "archived" as any }).where(eq(weeklyMeetings.id, meetingId));

      return (result as WeeklyMeetingArchive[])[0];
    });
  }
}

export const weeklyMeetingStorage = new WeeklyMeetingStorage();
