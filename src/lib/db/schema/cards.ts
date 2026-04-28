import {
	integer,
	pgEnum,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const cardStatusEnum = pgEnum("card_status", [
	"inactive",
	"active",
	"blocked",
]);

export const cards = pgTable("cards", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	lastFourDigits: varchar("last_four_digits", { length: 4 }).notNull(),
	status: cardStatusEnum("status").notNull().default("inactive"),
	spendingLimit: integer("spending_limit").notNull(),
	currentSpend: integer("current_spend").notNull().default(0),
	expiryDate: timestamp("expiry_date").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
