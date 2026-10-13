CREATE TABLE `verification_tokens` (
	`user_id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`sent_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verification_tokens_token_hash_unique` ON `verification_tokens` (`token_hash`);--> statement-breakpoint
ALTER TABLE `users` ADD `email_verified_at` integer;