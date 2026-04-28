import { db } from "./client.js";
import { cards, invoices, users } from "./schema/index.js";

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

	console.log(`Seeded user ${USER_ID} with 3 invoices and 1 card`);
	process.exit(0);
}

seed();
