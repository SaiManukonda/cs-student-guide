CREATE TABLE `workspaces` (
	`user_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`updated_at` text NOT NULL
);
