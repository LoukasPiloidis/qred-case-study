import { describe, expect, it } from "vitest";
import { cards } from "../lib/db/schema/cards.js";
import { transactions } from "../lib/db/schema/transactions.js";
import { users } from "../lib/db/schema/users.js";
import { useTestDb } from "../test/setup.js";
import { getTransactionsByUserId } from "./transaction.service.js";

describe("getTransactionsByUserId", () => {
	const getDb = useTestDb();

	const insertUser = async () => {
		const [user] = await getDb()
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();
		return user;
	};

	const insertCard = async (userId: string) => {
		const [card] = await getDb()
			.insert(cards)
			.values({
				userId,
				lastFourDigits: "1234",
				spendingLimit: 1000000,
				currentSpend: 0,
				expiryDate: new Date("2027-12-31"),
			})
			.returning();
		return card;
	};

	it("returns transactions for a user ordered by most recent first", async () => {
		const user = await insertUser();
		const card = await insertCard(user.id);

		await getDb()
			.insert(transactions)
			.values([
				{
					userId: user.id,
					cardId: card.id,
					amount: 15000,
					merchant: "Office Supplies AB",
					createdAt: new Date("2026-04-18T10:00:00Z"),
				},
				{
					userId: user.id,
					cardId: card.id,
					amount: 25000,
					merchant: "Cloud Services Inc",
					createdAt: new Date("2026-04-20T14:00:00Z"),
				},
			]);

		const result = await getTransactionsByUserId(getDb(), user.id);

		expect(result).toHaveLength(2);
		expect(result[0].merchant).toBe("Cloud Services Inc");
		expect(result[1].merchant).toBe("Office Supplies AB");
	});

	it("throws NOT_FOUND when user has no transactions", async () => {
		const fakeId = "550e8400-e29b-41d4-a716-446655440000";

		await expect(
			getTransactionsByUserId(getDb(), fakeId),
		).rejects.toMatchObject({
			errorCode: 2001,
		});
	});
});
