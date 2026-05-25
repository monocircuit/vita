CREATE TABLE `__seed_state` (
	`key` text PRIMARY KEY NOT NULL,
	`applied_at` integer NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_vitas_shards_dynamic` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vita_id` integer NOT NULL,
	`chronicle_id` integer NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`prev_id` integer,
	`next_id` integer,
	FOREIGN KEY (`vita_id`) REFERENCES `vitas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chronicle_id`) REFERENCES `chronicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_vitas_shards_dynamic`("vita_id", "chronicle_id", "x", "y", "prev_id", "next_id") SELECT "vita_id", "chronicle_id", "x", "y", "prev_id", "next_id" FROM `vitas_shards_dynamic`;--> statement-breakpoint
DROP TABLE `vitas_shards_dynamic`;--> statement-breakpoint
ALTER TABLE `__new_vitas_shards_dynamic` RENAME TO `vitas_shards_dynamic`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `vitas_shards_dynamic_vita_chronicle_uniq` ON `vitas_shards_dynamic` (`vita_id`,`chronicle_id`);--> statement-breakpoint
ALTER TABLE `chronicle_relations` ADD `orientation` text;