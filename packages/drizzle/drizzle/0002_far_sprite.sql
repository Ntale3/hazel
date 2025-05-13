ALTER TABLE "channel_notifications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "channel_notifications" CASCADE;--> statement-breakpoint
ALTER TABLE "channel_members" ADD COLUMN "last_seen_message_id" text;--> statement-breakpoint
ALTER TABLE "channel_members" ADD COLUMN "notification_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_last_seen_message_id_messages_id_fk" FOREIGN KEY ("last_seen_message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;