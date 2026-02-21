# Reminder Feature - Complete Flow Diagram

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         START: User Opens Application                        │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     User is Authenticated (Logged In)                        │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              User Navigates to: Task Management → Manage Tasks               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   Manager Tasks Page Loads with Task Lists                   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Task List 1                                              [Priority] │   │
│  │  ├─ Task Item 1  [✓] [ Sparkles ] [Bell] [X]                       │   │
│  │  ├─ Task Item 2  [ ] [ Sparkles ] [Bell] [X]                       │   │
│  │  └─ Task Item 3  [ ] [ Sparkles ] [Bell] [X]                       │   │
│  │                                                                      │   │
│  │ Task List 2                                                          │   │
│  │  ├─ Another Task [ ] [ Sparkles ] [Bell] [X]                       │   │
│  │  └─ More Tasks   [ ] [ Sparkles ] [Bell] [X]                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    User Clicks Bell Icon (🔔) on a Task                      │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Reminder Dialog Opens (Modal)                            │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Create Reminder                                │   │
│  │                                                                      │   │
│  │  Task: "Update project documentation"                             │   │
│  │  ─────────────────────────────────────                            │   │
│  │                                                                      │   │
│  │  Reminder Date & Time:                                            │   │
│  │  [📅 2025-12-28 14:30]  ← User clicks to open date/time picker    │   │
│  │                                                                      │   │
│  │  Message (Optional):                                              │   │
│  │  [┌─────────────────────────────────────────────────────────┐]   │   │
│  │   │ Follow up with team after review                         │   │   │
│  │   └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │                               [Cancel] [Create Reminder]          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│     User Selects Date & Time (Browser DateTime Picker Appears)               │
│                                                                               │
│     ┌────────────────────────────────────────┐                              │
│     │ December 2025          ◀  ▶            │                              │
│     │ Su Mo Tu We Th Fr Sa                   │                              │
│     │                    1  2  3  4  5       │                              │
│     │  6  7  8  9 10 11 12                  │                              │
│     │ 13 14 15 16 17 18 19                  │                              │
│     │ 20 21 22 23 24 25 26                  │                              │
│     │ 27 28 29 30 31        ← Selected      │                              │
│     │                                        │                              │
│     │ Time: [14:30]  (Hour : Minute)        │                              │
│     │                                        │                              │
│     │             [OK]          [Cancel]    │                              │
│     └────────────────────────────────────────┘                              │
│                                                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                User Optionally Adds a Message (Notes)                        │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 User Clicks "Create Reminder" Button                         │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                        ┌─────────────┴──────────────┐
                        │                            │
                        ▼                            ▼
            ┌──────────────────────┐    ┌──────────────────────┐
            │   Frontend Validation │    │ Show Loading State   │
            │  (Date/Time Required) │    │ "Creating..."       │
            └──────────┬───────────┘    └──────────┬───────────┘
                       │                           │
                       ▼                           ▼
        ┌─────────────────────────┐   ┌──────────────────────────┐
        │ Invalid: Show Error     │   │ API POST to Backend      │
        │ "Please select a date"  │   │ /api/reminders           │
        │ ✗ STOP                  │   └──────────┬───────────────┘
        └─────────────────────────┘              │
                                                  ▼
                                    ┌──────────────────────────┐
                                    │  Backend Validation      │
                                    │  - Check todoItemId      │
                                    │  - Validate reminderDate │
                                    │  - Check user auth       │
                                    └──────────┬───────────────┘
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        │                                              │
                        ▼                                              ▼
            ┌──────────────────────────┐            ┌──────────────────────────┐
            │ Error: Invalid Data      │            │ Success: Insert into DB  │
            │ Return 400 Bad Request   │            │ reminders table          │
            │ ✗ STOP                   │            └──────────┬───────────────┘
            └──────────────────────────┘                        │
                                                                ▼
                                                    ┌──────────────────────────┐
                                                    │ Reminder Saved to DB:    │
                                                    │ ✓ id: 456                │
                                                    │ ✓ todoItemId: 123        │
                                                    │ ✓ reminderDate: 2025-... │
                                                    │ ✓ message: "..."         │
                                                    │ ✓ isCompleted: false     │
                                                    │ ✓ createdById: 1         │
                                                    │ ✓ createdAt: now         │
                                                    └──────────┬───────────────┘
                                                               │
                                                               ▼
                                                    ┌──────────────────────────┐
                                                    │ Return 201 Created       │
                                                    │ Response with reminder   │
                                                    └──────────┬───────────────┘
                                                               │
                                                               ▼
                                                    ┌──────────────────────────┐
                                                    │ Frontend Receives Data   │
                                                    │ Success! Dialog Closes   │
                                                    │ Toast: "Reminder        │
                                                    │  created successfully!" │
                                                    └──────────┬───────────────┘
                                                               │
                                                               ▼
                                                    ┌──────────────────────────┐
                                                    │ Invalidate React Query   │
                                                    │ Cache for:               │
                                                    │ /api/reminders           │
                                                    │ /api/reminders/today     │
                                                    └──────────┬───────────────┘
                                                               │
                                                               ▼
                                                    ┌──────────────────────────┐
                                                    │ User Back at Manager     │
                                                    │ Tasks Page               │
                                                    │ ✓ Reminder Created!      │
                                                    └──────────┬───────────────┘
                                                               │
                                                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│       User Navigates to: Task Management → Reminders                         │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Reminders Page Loads                                  │
│                                                                               │
│  Filter: [Today] [Upcoming] [Overdue] [All]  Search: [           ]          │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Reminder #1                                        [✓] [🗑️] [>]     │   │
│  │  Update project documentation                                        │   │
│  │  📅 Dec 28, 2025 at 2:30 PM                                         │   │
│  │  💬 "Follow up with team after review"                              │   │
│  │  👤 Created by: Admin  📝 Dec 28, 2025                              │   │
│  │                                                                       │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │  Reminder #2                                        [ ] [🗑️] [>]     │   │
│  │  Review pull requests                                                │   │
│  │  📅 Dec 29, 2025 at 10:00 AM                                        │   │
│  │  👤 Created by: Admin  📝 Dec 28, 2025                              │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  User can now:                                                               │
│  ✓ Click checkmark to mark reminder as complete                            │
│  ✓ Click trash icon to delete reminder                                     │
│  ✓ Click arrow to view full details                                        │
│  ✓ Use filters to find specific reminders                                  │
│  ✓ Search by task name or message                                         │
│                                                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              Reminder Notification Service (Backend Running)                  │
│                                                                               │
│  Every 5 minutes:                                                             │
│  1. Check all reminders where reminderDate <= now AND isCompleted = false    │
│  2. For each due reminder:                                                    │
│     a) Get user details from createdById                                     │
│     b) Send notification (browser/email/SMS)                                 │
│     c) Mark reminder as completed (isCompleted = true)                       │
│  3. Log results                                                               │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React/TypeScript)                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Manager Tasks Page (manager-todos.tsx)                                     │
│  ├─ State: reminderDialog, reminderDate, reminderMessage                   │
│  ├─ Mutation: createReminderMutation                                       │
│  ├─ UI: Bell icon button → Dialog → API call                               │
│  └─ Flow: Click Bell → Dialog → Select Date → Create Reminder              │
│                                                                              │
│  Reminders Page (reminders.tsx)                                             │
│  ├─ Query: /api/reminders, /api/reminders/today                            │
│  ├─ Mutations: updateReminderMutation, deleteReminderMutation              │
│  └─ UI: List view with filters and actions                                 │
│                                                                              │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                 │ HTTP/REST API
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Express.js)                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Routes (server/routes.ts)                                                  │
│  ├─ POST   /api/reminders         → Create reminder                         │
│  ├─ GET    /api/reminders         → Get all reminders                       │
│  ├─ GET    /api/reminders/today   → Get today's reminders                   │
│  ├─ PATCH  /api/reminders/:id     → Update reminder                         │
│  └─ DELETE /api/reminders/:id     → Delete reminder                         │
│                                                                              │
│  Database Operations (server/storage.ts)                                    │
│  ├─ createReminder(data)          → INSERT into reminders table             │
│  ├─ getReminders()                → SELECT from reminders                   │
│  ├─ getTodayReminders()           → SELECT today's reminders                │
│  ├─ updateReminder(id, data)      → UPDATE reminders                        │
│  └─ deleteReminder(id)            → DELETE from reminders                   │
│                                                                              │
│  Notification Service (server/reminder-notification-service.ts)            │
│  └─ checkAndSendReminders()       → Runs every 5 minutes                    │
│                                                                              │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                 │ SQL Queries
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (PostgreSQL)                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Table: reminders                                                            │
│  ├─ id (PK)              → Auto-increment unique identifier                 │
│  ├─ todoItemId (FK)      → Links to todo_items table                        │
│  ├─ reminderDate         → When reminder should trigger                     │
│  ├─ message              → Optional user message                            │
│  ├─ isCompleted          → Status of reminder                               │
│  ├─ createdById (FK)     → User who created reminder                        │
│  └─ createdAt            → Timestamp of creation                            │
│                                                                              │
│  Indexes:                                                                    │
│  ├─ idx_reminders_todoItemId      → Fast lookup by task                     │
│  ├─ idx_reminders_createdById     → Fast lookup by user                     │
│  └─ idx_reminders_reminderDate    → Fast lookup by date                     │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

## Interaction Sequence

```
User                Frontend                Backend                  Database
 │                    │                       │                         │
 ├──Click Bell──────>  │                       │                         │
 │                    │                       │                         │
 │  <─Dialog Opens─   │                       │                         │
 │                    │                       │                         │
 ├─Select Date/Time─> │                       │                         │
 │                    │                       │                         │
 ├─Add Message──────> │                       │                         │
 │                    │                       │                         │
 ├─Click Create──────>│                       │                         │
 │                    ├──POST /api/reminders─>│                         │
 │                    │   {todoItemId, date}  │                         │
 │                    │                       ├──INSERT reminder───────>│
 │                    │                       │                         │
 │                    │                       │ <─Reminder saved────────┤
 │                    │                       │                         │
 │                    │ <─201 Created─────────┤                         │
 │                    │                         │                       │
 │ <─Success Toast────│                         │                       │
 │                    │                         │                       │
 │                    ├─Invalidate Cache───────>│                       │
 │                    │ (/api/reminders)        │                       │
 │                    │                         │                       │
 │─Navigate to────────>│                        │                       │
 │ Reminders Page     │                        │                       │
 │                    ├──GET /api/reminders──> │                       │
 │                    │                        ├──SELECT reminders───>  │
 │                    │                        │                  │     │
 │                    │                        │ <──Reminders list─┤     │
 │                    │                        │                       │
 │ <─List Displayed───┤ <──200 OK──────────────┤                       │
 │                    │                        │                       │
 └────────────────────└────────────────────────└───────────────────────┘
```

## Summary

The reminder feature provides a complete workflow:
1. **Creation**: Users click bell icon on tasks
2. **Configuration**: Select date/time and add optional message
3. **Storage**: Reminder saved to database
4. **Display**: View reminders in dedicated page
5. **Management**: Mark complete or delete reminders
6. **Notifications**: Automatic notifications when reminders are due

All components are fully integrated and working together seamlessly! ✅
