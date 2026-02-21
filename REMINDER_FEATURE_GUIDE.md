# Reminder Feature Guide

## Overview
Users can now create reminders for tasks in the Manager Tasks page, and view all reminders in the Reminders page.

## How to Use Reminders

### Step 1: Create a Reminder from Manager Tasks
1. Navigate to **Task Management → Manage Tasks** in the sidebar
2. Find the task you want to set a reminder for
3. Click the **Bell Icon** (🔔) next to the task
4. A dialog will open where you can:
   - See the task name displayed
   - Select a **Date & Time** for when you want to be reminded
   - Add an optional **Message** for the reminder

### Step 2: Set the Reminder Date & Time
1. Click on the **"Reminder Date & Time"** input field
2. A date/time picker will appear
3. Select the date and time when you want to be reminded
4. You can set reminders for:
   - Today
   - Tomorrow
   - Any future date/time
5. Click **"Create Reminder"** button

### Step 3: View Reminders
1. Go to **Task Management → Reminders** in the sidebar
2. You will see all your reminders organized by:
   - **Today** - Reminders for today (default view)
   - **Upcoming** - Future reminders
   - **Overdue** - Reminders that have passed
   - **All** - All reminders in the system

### Step 4: Manage Reminders
In the Reminders page, you can:
- **Mark as Complete** - Click the checkmark to mark a reminder as done
- **Delete** - Click the trash icon to remove a reminder
- **Filter** - Use the filter buttons to view specific reminder types
- **Search** - Use the search box to find specific reminders

## Data Flow

```
Manager Tasks Page
    ↓
User clicks Bell Icon
    ↓
Reminder Dialog Opens
    ↓
User selects Date/Time & Message
    ↓
Creates reminder via POST /api/reminders
    ↓
Reminder saved to database
    ↓
Reminders page automatically refreshes
    ↓
User can see reminder in Reminders page
```

## API Endpoints

### Create Reminder
- **POST** `/api/reminders`
- **Body:**
  ```json
  {
    "todoItemId": 123,
    "reminderDate": "2025-12-29T10:00:00Z",
    "message": "Optional reminder message"
  }
  ```

### Get All Reminders
- **GET** `/api/reminders`

### Get Today's Reminders
- **GET** `/api/reminders/today`

### Update Reminder
- **PATCH** `/api/reminders/:id`
- **Body:**
  ```json
  {
    "isCompleted": true
  }
  ```

### Delete Reminder
- **DELETE** `/api/reminders/:id`

## Database Schema

Reminders are stored in the `reminders` table with the following fields:
- `id` - Unique identifier
- `todoItemId` - ID of the associated todo item
- `reminderDate` - When the reminder should trigger
- `message` - Optional message for the reminder
- `isCompleted` - Whether the reminder has been completed
- `createdById` - User who created the reminder
- `createdAt` - When the reminder was created

## Notifications

Reminders are automatically checked by the reminder notification service:
- Runs every 5 minutes
- Checks for due reminders
- Sends notifications to users
- Marks reminders as completed after notification

## Troubleshooting

### Bell Icon Not Clickable
- Make sure you're using the latest version of the application
- Try refreshing the page
- Clear browser cache

### Reminder Not Showing After Creation
- Wait a few seconds for the page to refresh
- Go to the Reminders page to verify it was created
- Check the browser console for any error messages

### Reminder Not at Expected Time
- Ensure your system clock is set correctly
- Reminders use server time, not client time
- Verify the timezone settings

## Features Coming Soon
- Recurring reminders
- Reminder categories
- Email/SMS notifications
- Reminder attachments
- Collaboration on reminders

