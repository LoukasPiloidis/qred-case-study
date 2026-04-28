import { describe, expect, it } from "vitest";
import { cards } from "../lib/db/schema/cards.js";
import { invoices } from "../lib/db/schema/invoices.js";
import { transactions } from "../lib/db/schema/transactions.js";
import { users } from "../lib/db/schema/users.js";
import { createTestApp } from "../test/helpers.js";
import { useTestDb } from "../test/setup.js";

describe("GET /api/self/dashboard", () => {
	const getDb = useTestDb();

	const seedFullUser = async () => {
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
				currentSpend: 540000,
				expiryDate: new Date("2027-12-31"),
				status: "active",
			})
			.returning();

		await db.insert(invoices).values({
			userId: user.id,
			amount: 150000,
			dueDate: new Date("2025-06-01"),
			status: "pending",
		});

		await db.insert(transactions).values({
			userId: user.id,
			cardId: card.id,
			description: "Coffee shop",
			amount: -4500,
			currency: "SEK",
			date: new Date("2025-06-10"),
			category: "food",
		});

		return user;
	};

	it("returns 200 with full dashboard data", async () => {
		const user = await seedFullUser();

		const app = await createTestApp(getDb());
		const response = await app.inject({
			method: "GET",
			url: "/api/self/dashboard",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(200);

		const body = response.json();
		expect(body.user.companyName).toBe("Company AB");
		expect(body.card.lastFourDigits).toBe("4567");
		expect(body.card.remainingSpend.formatted).toBe("4 600/10 000 kr");
		expect(body.invoices.hasDueInvoice).toBe(true);
		expect(body.transactions.transactions).toHaveLength(1);

		await app.close();
	});

	it("returns 401 when no auth header is provided", async () => {
		const app = await createTestApp(getDb());
		const response = await app.inject({
			method: "GET",
			url: "/api/self/dashboard",
		});

		expect(response.statusCode).toBe(401);
		expect(response.json().errorCode).toBe(3002);

		await app.close();
	});

	it("returns 404 when user has no card", async () => {
		const db = getDb();
		const [user] = await db
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "GET",
			url: "/api/self/dashboard",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(404);
		expect(response.json().errorCode).toBe(1001);

		await app.close();
	});
});
