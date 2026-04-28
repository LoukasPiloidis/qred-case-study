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
	amount: integer("amount").notNull(),
	merchant: varchar("merchant", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
