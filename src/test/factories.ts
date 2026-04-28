import type { Database } from "../lib/db/client.js";
import { cards } from "../lib/db/schema/cards.js";
import { invoices } from "../lib/db/schema/invoices.js";
import { transactions } from "../lib/db/schema/transactions.js";
import { users } from "../lib/db/schema/users.js";

let userCounter = 0;

// ── Plain object factories (for serializer tests) ──

export const makeUser = (overrides = {}) => ({
	id: "550e8400-e29b-41d4-a716-446655440000",
	companyName: "Company AB",
	email: `user-${++userCounter}@test.se`,
	createdAt: new Date("2025-01-01T00:00:00.000Z"),
	...overrides,
});

export const makeCard = (overrides = {}) => ({
	id: "660e8400-e29b-41d4-a716-446655440000",
	userId: "550e8400-e29b-41d4-a716-446655440000",
	lastFourDigits: "4567",
	status: "active" as const,
	spendingLimit: 1000000,
	currentSpend: 540000,
	expiryDate: new Date("2027-12-31T00:00:00.000Z"),
	createdAt: new Date("2025-01-01T00:00:00.000Z"),
	...overrides,
});

export const makeInvoice = (overrides = {}) => ({
	id: "770e8400-e29b-41d4-a716-446655440000",
	userId: "550e8400-e29b-41d4-a716-446655440000",
	amount: 150000,
	dueDate: new Date("2025-06-01T00:00:00.000Z"),
	status: "pending" as const,
	createdAt: new Date("2025-01-01T00:00:00.000Z"),
	...overrides,
});

export const makeTransaction = (overrides = {}) => ({
	id: "880e8400-e29b-41d4-a716-446655440000",
	userId: "550e8400-e29b-41d4-a716-446655440000",
	cardId: "660e8400-e29b-41d4-a716-446655440000",
	description: "Office Supplies AB",
	amount: 15000,
	currency: "SEK",
	date: new Date("2026-04-25T10:30:00.000Z"),
	category: "supplies",
	createdAt: new Date("2026-04-25T10:30:00.000Z"),
	...overrides,
});

// ── DB-inserting factories (for service/controller tests) ──

export const createUser = async (
	db: Database,
	overrides: Partial<typeof users.$inferInsert> = {},
) => {
	const [user] = await db
		.insert(users)
		.values({
			companyName: "Company AB",
			email: `user-${++userCounter}@test.se`,
			...overrides,
		})
		.returning();
	return user;
};

export const createCard = async (
	db: Database,
	{
		userId,
		...overrides
	}: { userId: string } & Partial<Omit<typeof cards.$inferInsert, "userId">>,
) => {
	const [card] = await db
		.insert(cards)
		.values({
			userId,
			lastFourDigits: "1234",
			spendingLimit: 1000000,
			currentSpend: 0,
			expiryDate: new Date("2027-12-31"),
			...overrides,
		})
		.returning();
	return card;
};

export const createInvoice = async (
	db: Database,
	{
		userId,
		...overrides
	}: { userId: string } & Partial<
		Omit<typeof invoices.$inferInsert, "userId">
	>,
) => {
	const [invoice] = await db
		.insert(invoices)
		.values({
			userId,
			amount: 150000,
			dueDate: new Date("2025-06-01"),
			status: "pending",
			...overrides,
		})
		.returning();
	return invoice;
};

export const createTransaction = async (
	db: Database,
	{
		userId,
		cardId,
		...overrides
	}: { userId: string; cardId: string } & Partial<
		Omit<typeof transactions.$inferInsert, "userId" | "cardId">
	>,
) => {
	const [transaction] = await db
		.insert(transactions)
		.values({
			userId,
			cardId,
			description: "Office Supplies AB",
			amount: 15000,
			category: "supplies",
			date: new Date("2026-04-25T10:30:00Z"),
			...overrides,
		})
		.returning();
	return transaction;
};
