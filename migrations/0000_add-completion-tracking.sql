CREATE TYPE "public"."device_notification_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."device_notification_type" AS ENUM('system_alert', 'task_reminder', 'user_activity', 'security_alert', 'maintenance_notice', 'deadline_warning', 'achievement', 'general');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('interview_feedback', 'general_feedback', 'system_improvement', 'user_experience');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."rating" AS ENUM('1', '2', '3', '4', '5');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'manager', 'security', 'secretary', 'office', 'office_team');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'pending');--> statement-breakpoint
CREATE TABLE "archived_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "archived_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"item_type" text NOT NULL,
	"item_id" integer NOT NULL,
	"item_data" text NOT NULL,
	"archived_by_id" integer NOT NULL,
	"archived_at" timestamp DEFAULT now() NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "device_notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "device_notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"type" "device_notification_type" NOT NULL,
	"priority" "device_notification_priority" DEFAULT 'normal' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"icon" text,
	"action_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_sent_to_device" boolean DEFAULT false NOT NULL,
	"device_data" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "feedback_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"rating" "rating",
	"submitted_by_id" integer NOT NULL,
	"related_interview_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "feedback_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "interview_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"position" text NOT NULL,
	"candidate_name" text NOT NULL,
	"candidate_email" text,
	"requested_by_id" integer NOT NULL,
	"manager_id" integer,
	"proposed_date_time" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"description" text,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"action_taken_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operational_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"data" jsonb NOT NULL,
	"stats" jsonb,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"todo_item_id" integer,
	"reminder_date" timestamp NOT NULL,
	"message" text,
	"title" text,
	"item_text" text,
	"item_data" jsonb,
	"is_completed" boolean DEFAULT false NOT NULL,
	"notification_sent" boolean DEFAULT false NOT NULL,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"todo_list_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp,
	"reminder_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "todo_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_by_id" integer NOT NULL,
	"assigned_to_id" integer,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" "role" DEFAULT 'security' NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb,
	"department" text,
	"position" text,
	"phone_number" text,
	"comments" text,
	"manager_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "archived_items" ADD CONSTRAINT "archived_items_archived_by_id_users_id_fk" FOREIGN KEY ("archived_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_notifications" ADD CONSTRAINT "device_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_related_interview_id_interview_requests_id_fk" FOREIGN KEY ("related_interview_id") REFERENCES "public"."interview_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_types" ADD CONSTRAINT "feedback_types_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_action_taken_by_id_users_id_fk" FOREIGN KEY ("action_taken_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_todo_item_id_todo_items_id_fk" FOREIGN KEY ("todo_item_id") REFERENCES "public"."todo_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_todo_list_id_todo_lists_id_fk" FOREIGN KEY ("todo_list_id") REFERENCES "public"."todo_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_lists" ADD CONSTRAINT "todo_lists_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_lists" ADD CONSTRAINT "todo_lists_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;