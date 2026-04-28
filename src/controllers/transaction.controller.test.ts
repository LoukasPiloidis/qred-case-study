import { describe, expect, it } from "vitest";
import { cards } from "../lib/db/schema/cards.js";
import { transactions } from "../lib/db/schema/transactions.js";
import { users } from "../lib/db/schema/users.js";
import { createTestApp } from "../test/helpers.js";
import { useTestDb } from "../test/setup.js";

describe("GET /api/self/card/transactions", () => {
	const getDb = useTestDb();

	it("returns 200 with paginated transaction data", async () => {
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
				description: "Office Supplies AB",
				amount: 15000,
				category: "supplies",
				date: new Date("2026-04-25T10:30:00Z"),
			},
			{
				userId: user.id,
				cardId: card.id,
				description: "Cloud Services Inc",
				amount: 25000,
				category: "software",
				date: new Date("2026-04-20T14:00:00Z"),
			},
		]);

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "GET",
			url: "/api/self/card/transactions",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(200);

		const body = response.json();
		expect(body.transactions).toHaveLength(2);
		expect(body.remainingCount).toBe(0);
		expect(body.nextCursor).toBeTypeOf("string");

		// Verify ordering: most recent first
		expect(body.transactions[0].description).toBe("Office Supplies AB");
		expect(body.transactions[1].description).toBe("Cloud Services Inc");

		expect(body.transactions[0].formattedAmount).toBe("150 kr");
		expect(body.transactions[0].currency).toBe("SEK");
		expect(body.transactions[0].category).toBe("supplies");

		await app.close();
	});

	it("returns 200 with empty array when user has no transactions", async () => {
		const db = getDb();
		const [user] = await db
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "GET",
			url: "/api/self/card/transactions",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(200);

		const body = response.json();
		expect(body.transactions).toHaveLength(0);
		expect(body.remainingCount).toBe(0);
		expect(body.nextCursor).toBeNull();

		await app.close();
	});

	it("paginates with limit and cursor", async () => {
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
				description: "Item A",
				amount: 10000,
				category: "misc",
				date: new Date("2026-04-25T10:00:00Z"),
			},
			{
				userId: user.id,
				cardId: card.id,
				description: "Item B",
				amount: 20000,
				category: "misc",
				date: new Date("2026-04-24T10:00:00Z"),
			},
			{
				userId: user.id,
				cardId: card.id,
				description: "Item C",
				amount: 30000,
				category: "misc",
				date: new Date("2026-04-23T10:00:00Z"),
			},
		]);

		const app = await createTestApp(db);

		const firstPage = await app.inject({
			method: "GET",
			url: "/api/self/card/transactions?limit=2",
			headers: { "x-user-id": user.id },
		});

		const firstBody = firstPage.json();
		expect(firstBody.transactions).toHaveLength(2);
		expect(firstBody.remainingCount).toBe(1);
		expect(firstBody.nextCursor).toBeTypeOf("string");

		const secondPage = await app.inject({
			method: "GET",
			url: `/api/self/card/transactions?limit=2&cursor=${firstBody.nextCursor}`,
			headers: { "x-user-id": user.id },
		});

		const secondBody = secondPage.json();
		expect(secondBody.transactions).toHaveLength(1);
		expect(secondBody.transactions[0].description).toBe("Item C");
		expect(secondBody.remainingCount).toBe(0);
		expect(secondBody.nextCursor).toBeTypeOf("string");

		await app.close();
	});

	it("returns 400 for invalid cursor", async () => {
		const db = getDb();
		const [user] = await db
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "GET",
			url: "/api/self/card/transactions?cursor=invalid",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().errorCode).toBe(2001);

		await app.close();
	});

	it("returns 401 when no auth header is provided", async () => {
		const app = await createTestApp(getDb());
		const response = await app.inject({
			method: "GET",
			url: "/api/self/card/transactions",
		});

		expect(response.statusCode).toBe(401);
		expect(response.json().errorCode).toBe(3002);

		await app.close();
	});
});
