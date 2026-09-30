CREATE TABLE `practice_limits` (
	`user_id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`runs` integer NOT NULL,
	`next_at` integer NOT NULL
);
