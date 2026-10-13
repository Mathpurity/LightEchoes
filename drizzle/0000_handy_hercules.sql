CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`publication_id` text NOT NULL,
	`session_id` text NOT NULL,
	`event` text NOT NULL,
	`page` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `activity_user` ON `activity` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`target_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `auth_user` ON `auth_sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `licences` (
	`id` text PRIMARY KEY NOT NULL,
	`licence_code` text NOT NULL,
	`user_id` text NOT NULL,
	`publication_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`publication_id`) REFERENCES `publications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `licences_licence_code_unique` ON `licences` (`licence_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `licence_user_book` ON `licences` (`user_id`,`publication_id`);--> statement-breakpoint
CREATE TABLE `memberships` (
	`user_id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`reference` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'NGN' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`credited` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `publications` (
	`id` text PRIMARY KEY NOT NULL,
	`publication_code` text NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`cover_key` text,
	`r2_object` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`release_at` integer,
	`page_count` integer DEFAULT 1 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `publications_publication_code_unique` ON `publications` (`publication_code`);--> statement-breakpoint
CREATE INDEX `publication_status` ON `publications` (`status`,`release_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reading_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`user_id` text NOT NULL,
	`publication_id` text NOT NULL,
	`licence_id` text NOT NULL,
	`watermark` text NOT NULL,
	`expires_at` integer NOT NULL,
	`last_activity` integer NOT NULL,
	`last_page` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`publication_id`) REFERENCES `publications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`licence_id`) REFERENCES `licences`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reading_sessions_token_hash_unique` ON `reading_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `reading_user_book` ON `reading_sessions` (`user_id`,`publication_id`);--> statement-breakpoint
CREATE TABLE `reset_tokens` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);