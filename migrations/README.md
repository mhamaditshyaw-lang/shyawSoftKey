This folder contains SQL migrations for the database. To apply migrations using the project's tooling run:

# Push migrations (drizzle-kit)
npm run db:push

The new migration `0003_add-weekly-task-columns.sql` adds `created_by_id` and `completed_by_id` to the `weekly_meeting_tasks` table and creates the necessary foreign key constraints.

If running directly against the database, you can execute the SQL in this file using psql or a DB client.
