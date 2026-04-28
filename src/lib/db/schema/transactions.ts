import {
	integer,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { cards } from "./cards.js";
import { users } from "./users.js";

export const transactions = pgTable("transactions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	cardId: uuid("card_id")
		.notNull()
		.references(() => cards.id),
	description: varchar("description", { length: 255 }).notNull(),
	amount: integer("amount").notNull(),
	currency: varchar("currency", { length: 3 }).notNull().default("SEK"),
	date: timestamp("date").notNull(),
	category: varchar("category", { length: 100 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
