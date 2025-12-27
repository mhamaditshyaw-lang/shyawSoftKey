CREATE TYPE "public"."meeting_status" AS ENUM('planned', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."task_progress" AS ENUM('not_started', 'in_progress', 'completed', 'verified');--> statement-breakpoint
CREATE TABLE "department_task_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"department_head_id" integer NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"status" "task_progress" DEFAULT 'not_started' NOT NULL,
	"notes" text,
	"proof_url" text,
	"last_updated_by_id" integer,
	"last_updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_request_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"comment" text NOT NULL,
	"proof_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_meeting_archive" (
	"id" serial PRIMARY KEY NOT NULL,
	"meeting_id" integer NOT NULL,
	"meeting_data" jsonb NOT NULL,
	"tasks_data" jsonb NOT NULL,
	"results_data" jsonb,
	"archived_by_id" integer NOT NULL,
	"archived_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_meeting_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"meeting_id" integer NOT NULL,
	"department_name" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_value" integer,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"assigned_user_ids" integer[],
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"week_number" integer NOT NULL,
	"year" integer NOT NULL,
	"meeting_date" timestamp NOT NULL,
	"name" text,
	"status" "meeting_status" DEFAULT 'planned' NOT NULL,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "department_task_progress" ADD CONSTRAINT "department_task_progress_task_id_weekly_meeting_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."weekly_meeting_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_task_progress" ADD CONSTRAINT "department_task_progress_department_head_id_users_id_fk" FOREIGN KEY ("department_head_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_task_progress" ADD CONSTRAINT "department_task_progress_last_updated_by_id_users_id_fk" FOREIGN KEY ("last_updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_comments" ADD CONSTRAINT "interview_comments_interview_request_id_interview_requests_id_fk" FOREIGN KEY ("interview_request_id") REFERENCES "public"."interview_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_comments" ADD CONSTRAINT "interview_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_weekly_meeting_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."weekly_meeting_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_meeting_archive" ADD CONSTRAINT "weekly_meeting_archive_archived_by_id_users_id_fk" FOREIGN KEY ("archived_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_meeting_tasks" ADD CONSTRAINT "weekly_meeting_tasks_meeting_id_weekly_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."weekly_meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_meetings" ADD CONSTRAINT "weekly_meetings_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;