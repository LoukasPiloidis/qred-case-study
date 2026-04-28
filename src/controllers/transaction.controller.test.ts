import { describe, expect, it } from "vitest";
import { cards } from "../lib/db/schema/cards.js";
import { transactions } from "../lib/db/schema/transactions.js";
import { users } from "../lib/db/schema/users.js";
import { createTestApp } from "../test/helpers.js";
import { useTestDb } from "../test/setup.js";

describe("GET /api/self/transactions", () => {
	const getDb = useTestDb();

	it("returns 200 with transaction data", async () => {
		const db = getDb();
		const [user] = await db
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();

		const [card] = await db
			.insert(cards)
			.values({
				userId: user.id,
				lastFourDigits: "4567",
				spendingLimit: 1000000,
				currentSpend: 0,
				expiryDate: new Date("2027-12-31"),
			})
			.returning();

		await db.insert(transactions).values([
			{
				userId: user.id,
				cardId: card.id,
				amount: 15000,
				merchant: "Office Supplies AB",
				createdAt: new Date("2026-04-25T10:30:00Z"),
			},
			{
				userId: user.id,
				cardId: card.id,
				amount: 25000,
				merchant: "Cloud Services Inc",
				createdAt: new Date("2026-04-20T14:00:00Z"),
			},
		]);

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "GET",
			url: "/api/self/transactions",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(200);

		const body = response.json();
		expect(body.transactions).toHaveLength(2);
		expect(body.totalCount).toBe(2);
		expect(body.transactions[0].merchant).toBe("Office Supplies AB");
		expect(body.transactions[0].formattedAmount).toBe("150 kr");

		await app.close();
	});

	it("returns 404 when user has no transactions", async () => {
		const db = getDb();
		const [user] = await db
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "GET",
			url: "/api/self/transactions",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(404);
		expect(response.json().errorCode).toBe(2001);

		await app.close();
	});

	it("returns 401 when no auth header is provided", async () => {
		const app = await createTestApp(getDb());
		const response = await app.inject({
			method: "GET",
			url: "/api/self/transactions",
		});

		expect(response.statusCode).toBe(401);
		expect(response.json().errorCode).toBe(3002);

		await app.close();
	});
});
