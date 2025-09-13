import { storage } from "./storage";
import { DeviceNotificationService } from "./device-notification-service";

export class ReminderNotificationService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * Start the reminder notification service
   * Checks for due reminders every hour
   */
  static start() {
    if (this.isRunning) {
      console.log("Reminder notification service is already running");
      return;
    }

    console.log("Starting reminder notification service...");
    this.isRunning = true;

    // Run immediately on start
    this.checkAndSendReminders();

    // Then run every hour
    this.intervalId = setInterval(() => {
      this.checkAndSendReminders();
    }, 60 * 60 * 1000); // 1 hour = 60 minutes * 60 seconds * 1000 milliseconds

    console.log("Reminder notification service started successfully");
  }

  /**
   * Stop the reminder notification service
   */
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("Reminder notification service stopped");
  }

  /**
   * Check for due reminders and send notifications
   */
  static async checkAndSendReminders() {
    try {
      console.log("Checking for due reminders...");

      // Get today's date range in local timezone
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all users to check their reminders
      const users = await storage.getAllUsers();
      
      for (const user of users) {
        if (user.status !== 'active') {
          continue; // Skip inactive users
        }

        try {
          // Get today's reminders for this user that haven't been completed and haven't had notifications sent
          const reminders = await storage.getRemindersByDateRange(user.id, today, tomorrow);
          const pendingReminders = reminders.filter(reminder => 
            !reminder.isCompleted && !reminder.notificationSent
          );

          if (pendingReminders.length === 0) {
            continue; // No pending reminders for this user
          }

          console.log(`Found ${pendingReminders.length} pending reminders for user ${user.username}`);

          // Send notifications for each pending reminder
          for (const reminder of pendingReminders) {
            await this.sendReminderNotification(user.id, reminder);
            
            // Mark notification as sent in the database
            await storage.updateReminder(reminder.id, { notificationSent: true });
          }
        } catch (userError) {
          console.error(`Error processing reminders for user ${user.username}:`, userError);
        }
      }

      console.log("Reminder check completed");
    } catch (error) {
      console.error("Error in reminder notification service:", error);
    }
  }

  /**
   * Send a notification for a specific reminder
   */
  private static async sendReminderNotification(userId: number, reminder: any) {
    try {
      const title = reminder.title || "Reminder";
      const message = reminder.message || reminder.itemText || "You have a reminder due today";

      await DeviceNotificationService.createUserNotification(
        userId,
        "reminder",
        `📅 ${title}`,
        message,
        "normal",
        {
          icon: "🔔",
          actionUrl: "/reminders",
        }
      );

      console.log(`Notification sent for reminder "${title}" to user ${userId}`);
    } catch (error) {
      console.error(`Failed to send notification for reminder ${reminder.id}:`, error);
    }
  }

  /**
   * Manually trigger reminder check (for testing)
   */
  static async triggerCheck() {
    console.log("Manually triggering reminder check...");
    await this.checkAndSendReminders();
  }

  /**
   * Get service status
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId !== null,
    };
  }
}