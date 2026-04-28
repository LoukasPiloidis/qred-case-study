import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { cards, invoices, transactions, users } from "./schema/index.js";

const USER_ID = "00000000-0000-0000-0000-000000000001";

async function seed() {
	await db
		.insert(users)
		.values({
			id: USER_ID,
			companyName: "Acme Corp",
			email: "test@acme.com",
		})
		.onConflictDoNothing();

	await db.delete(transactions);
	await db.delete(cards);
	await db.delete(invoices);

	await db
		.insert(invoices)
		.values([
			{
				userId: USER_ID,
				amount: 10000,
				dueDate: new Date("2025-01-01"),
				status: "paid",
			},
			{
				userId: USER_ID,
				amount: 25000,
				dueDate: new Date("2024-12-01"),
				status: "overdue",
			},
			{
				userId: USER_ID,
				amount: 15000,
				dueDate: new Date("2026-06-01"),
				status: "pending",
			},
		])
		.onConflictDoNothing();

	await db
		.insert(cards)
		.values({
			userId: USER_ID,
			lastFourDigits: "4567",
			status: "active",
			spendingLimit: 1000000,
			currentSpend: 540000,
			expiryDate: new Date("2027-12-31"),
		})
		.onConflictDoNothing();

	const [card] = await db
		.select({ id: cards.id })
		.from(cards)
		.where(eq(cards.userId, USER_ID));

	await db
		.insert(transactions)
		.values([
			{
				userId: USER_ID,
				cardId: card.id,
				amount: 15000,
				merchant: "Office Supplies AB",
				createdAt: new Date("2026-04-25T10:30:00Z"),
			},
			{
				userId: USER_ID,
				cardId: card.id,
				amount: 250000,
				merchant: "Cloud Services Inc",
				createdAt: new Date("2026-04-20T14:15:00Z"),
			},
			{
				userId: USER_ID,
				cardId: card.id,
				amount: 75000,
				merchant: "Business Lunch AB",
				createdAt: new Date("2026-04-18T12:00:00Z"),
			},
		])
		.onConflictDoNothing();

	console.log(
		`Seeded user ${USER_ID} with 3 invoices, 1 card, and 3 transactions`,
	);
	process.exit(0);
}

seed();
