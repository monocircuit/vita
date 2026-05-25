CREATE TABLE `addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`street` text,
	`city` text,
	`postal_code` text,
	`country` integer,
	FOREIGN KEY (`country`) REFERENCES `countries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chronicle_entities` (
	`chronicle_id` integer NOT NULL,
	`entity_id` integer NOT NULL,
	PRIMARY KEY(`chronicle_id`, `entity_id`),
	FOREIGN KEY (`chronicle_id`) REFERENCES `chronicles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chronicle_relations` (
	`chronicle_id` integer NOT NULL,
	`ancestor` integer NOT NULL,
	PRIMARY KEY(`chronicle_id`, `ancestor`),
	FOREIGN KEY (`chronicle_id`) REFERENCES `chronicles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ancestor`) REFERENCES `chronicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chronicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`orientation` text,
	`scope` text NOT NULL,
	`knots` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `continents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`continent` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`iso_code` text NOT NULL,
	`name` text NOT NULL,
	`continent` integer,
	FOREIGN KEY (`continent`) REFERENCES `continents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `countries_iso_code_unique` ON `countries` (`iso_code`);--> statement-breakpoint
CREATE TABLE `dynamic_vita_paths` (
	`dynamic_vita_id` integer NOT NULL,
	`chronicle_id` integer NOT NULL,
	`knots` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`dynamic_vita_id`, `chronicle_id`),
	FOREIGN KEY (`dynamic_vita_id`) REFERENCES `dynamic_vitas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chronicle_id`) REFERENCES `chronicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `dynamic_vitas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `entities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`address`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vitas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`scope` text,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `vitas_shards_dynamic` (
	`vita_id` integer NOT NULL,
	`chronicle_id` integer NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`prev_id` integer,
	`next_id` integer,
	PRIMARY KEY(`vita_id`, `chronicle_id`),
	FOREIGN KEY (`vita_id`) REFERENCES `vitas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chronicle_id`) REFERENCES `chronicles`(`id`) ON UPDATE no action ON DELETE cascade
);
