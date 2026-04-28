import { describe, expect, it } from "vitest";
import { cards } from "../lib/db/schema/cards.js";
import { transactions } from "../lib/db/schema/transactions.js";
import { users } from "../lib/db/schema/users.js";
import { encodeCursor } from "../lib/pagination/cursor.js";
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

	const insertTransactions = async (userId: string, cardId: string) => {
		await getDb()
			.insert(transactions)
			.values([
				{
					userId,
					cardId,
					description: "Office Supplies AB",
					amount: 15000,
					category: "supplies",
					date: new Date("2026-04-18T10:00:00Z"),
				},
				{
					userId,
					cardId,
					description: "Cloud Services Inc",
					amount: 25000,
					category: "software",
					date: new Date("2026-04-20T14:00:00Z"),
				},
				{
					userId,
					cardId,
					description: "Business Lunch AB",
					amount: 8500,
					category: "meals",
					date: new Date("2026-04-22T12:00:00Z"),
				},
				{
					userId,
					cardId,
					description: "Taxi Stockholm",
					amount: 35000,
					category: "travel",
					date: new Date("2026-04-24T09:00:00Z"),
				},
			]);
	};

	it("returns transactions ordered by most recent first", async () => {
		const user = await insertUser();
		const card = await insertCard(user.id);
		await insertTransactions(user.id, card.id);

		const { rows } = await getTransactionsByUserId(getDb(), user.id);

		expect(rows).toHaveLength(3); // default limit = 3
		expect(rows[0].description).toBe("Taxi Stockholm");
		expect(rows[1].description).toBe("Business Lunch AB");
		expect(rows[2].description).toBe("Cloud Services Inc");
	});

	it("returns remainingCount for pagination", async () => {
		const user = await insertUser();
		const card = await insertCard(user.id);
		await insertTransactions(user.id, card.id);

		const { remainingCount } = await getTransactionsByUserId(getDb(), user.id);

		expect(remainingCount).toBe(1); // 4 total, 3 returned
	});

	it("paginates with cursor", async () => {
		const user = await insertUser();
		const card = await insertCard(user.id);
		await insertTransactions(user.id, card.id);

		const firstPage = await getTransactionsByUserId(getDb(), user.id);
		const lastRow = firstPage.rows[firstPage.rows.length - 1];
		const cursor = encodeCursor(lastRow.date, lastRow.id);

		const secondPage = await getTransactionsByUserId(getDb(), user.id, {
			cursor,
		});

		expect(secondPage.rows).toHaveLength(1);
		expect(secondPage.rows[0].description).toBe("Office Supplies AB");
		expect(secondPage.remainingCount).toBe(0);
	});

	it("respects custom limit", async () => {
		const user = await insertUser();
		const card = await insertCard(user.id);
		await insertTransactions(user.id, card.id);

		const { rows, remainingCount } = await getTransactionsByUserId(
			getDb(),
			user.id,
			{ limit: 2 },
		);

		expect(rows).toHaveLength(2);
		expect(remainingCount).toBe(2);
	});

	it("returns empty array when user has no transactions", async () => {
		const user = await insertUser();

		const { rows, remainingCount } = await getTransactionsByUserId(
			getDb(),
			user.id,
		);

		expect(rows).toHaveLength(0);
		expect(remainingCount).toBe(0);
	});

	it("throws INVALID_CURSOR for bad cursor", async () => {
		const user = await insertUser();

		await expect(
			getTransactionsByUserId(getDb(), user.id, { cursor: "garbage" }),
		).rejects.toMatchObject({
			errorCode: 2001,
		});
	});
});
