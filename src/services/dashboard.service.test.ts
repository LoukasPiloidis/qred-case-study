import { describe, expect, it } from "vitest";
import { cards } from "../lib/db/schema/cards.js";
import { invoices } from "../lib/db/schema/invoices.js";
import { transactions } from "../lib/db/schema/transactions.js";
import { users } from "../lib/db/schema/users.js";
import { useTestDb } from "../test/setup.js";
import { getDashboardByUserId } from "./dashboard.service.js";

describe("getDashboardByUserId", () => {
	const getDb = useTestDb();

	const seedUser = async () => {
		const [user] = await getDb()
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();
		return user;
	};

	const seedCard = async (userId: string) => {
		const [card] = await getDb()
			.insert(cards)
			.values({
				userId,
				lastFourDigits: "4567",
				spendingLimit: 1000000,
				currentSpend: 540000,
				expiryDate: new Date("2027-12-31"),
				status: "active",
			})
			.returning();
		return card;
	};

	it("returns user, card, invoices, and transactions", async () => {
		const user = await seedUser();
		const card = await seedCard(user.id);

		await getDb()
			.insert(invoices)
			.values({
				userId: user.id,
				amount: 150000,
				dueDate: new Date("2025-06-01"),
				status: "pending",
			});

		await getDb()
			.insert(transactions)
			.values({
				userId: user.id,
				cardId: card.id,
				description: "Coffee shop",
				amount: -4500,
				currency: "SEK",
				date: new Date("2025-06-10"),
				category: "food",
			});

		const result = await getDashboardByUserId(getDb(), user.id);

		expect(result.user.id).toBe(user.id);
		expect(result.card.id).toBe(card.id);
		expect(result.invoiceData.invoices).toHaveLength(1);
		expect(result.transactionData.rows).toHaveLength(1);
	});

	it("limits transactions to 3", async () => {
		const user = await seedUser();
		const card = await seedCard(user.id);

		const txValues = Array.from({ length: 5 }, (_, i) => ({
			userId: user.id,
			cardId: card.id,
			description: `Transaction ${i}`,
			amount: -1000 * (i + 1),
			currency: "SEK",
			date: new Date(`2025-06-${10 + i}`),
			category: "food",
		}));

		await getDb().insert(transactions).values(txValues);

		const result = await getDashboardByUserId(getDb(), user.id);

		expect(result.transactionData.rows).toHaveLength(3);
		expect(result.transactionData.remainingCount).toBe(2);
	});

	it("throws when user does not exist", async () => {
		const fakeId = "550e8400-e29b-41d4-a716-446655440000";

		await expect(getDashboardByUserId(getDb(), fakeId)).rejects.toMatchObject({
			errorCode: 3001,
		});
	});

	it("throws when user has no card", async () => {
		const user = await seedUser();

		await expect(getDashboardByUserId(getDb(), user.id)).rejects.toMatchObject({
			errorCode: 1001,
		});
	});
});
