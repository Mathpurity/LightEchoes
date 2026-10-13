ALTER TABLE `payments` ADD `publication_id` text REFERENCES publications(id);--> statement-breakpoint
ALTER TABLE `payments` ADD `access_months` integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE `publications` ADD `price_kobo` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `publications` ADD `access_months` integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE `publications` ADD `page_keys` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `publications` ADD `preview_pages` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `preferences` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `account_status` text DEFAULT 'active' NOT NULL;