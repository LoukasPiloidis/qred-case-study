import { describe, expect, it } from "vitest";
import {
	createCard,
	createInvoice,
	createTransaction,
	createUser,
} from "../test/factories.js";
import { createTestApp } from "../test/helpers.js";
import { useTestDb } from "../test/setup.js";

describe("GET /api/self/dashboard", () => {
	const getDb = useTestDb();

	it("returns 200 with full dashboard data", async () => {
		const db = getDb();
		const user = await createUser(db);
		const card = await createCard(db, {
			userId: user.id,
			lastFourDigits: "4567",
			currentSpend: 540000,
			status: "active",
		});

		await createInvoice(db, { userId: user.id });
		await createTransaction(db, {
			userId: user.id,
			cardId: card.id,
			description: "Coffee shop",
			amount: -4500,
			category: "food",
			date: new Date("2025-06-10"),
		});

		const app = await createTestApp(db);
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
		const user = await createUser(db);

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
