import { integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const invoiceStatusEnum = pgEnum("invoice_status", [
	"pending",
	"paid",
	"overdue",
]);

export const invoices = pgTable("invoices", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	amount: integer("amount").notNull(),
	dueDate: timestamp("due_date").notNull(),
	status: invoiceStatusEnum("status").notNull().default("pending"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
