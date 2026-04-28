import { describe, expect, it } from "vitest";
import { cards } from "../lib/db/schema/cards.js";
import { users } from "../lib/db/schema/users.js";
import { createTestApp } from "../test/helpers.js";
import { useTestDb } from "../test/setup.js";

describe("GET /api/self/card", () => {
	const getDb = useTestDb();

	it("returns 200 with card data", async () => {
		const db = getDb();
		const [user] = await db
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();

		await db.insert(cards).values({
			userId: user.id,
			lastFourDigits: "4567",
			spendingLimit: 1000000,
			currentSpend: 540000,
			expiryDate: new Date("2027-12-31"),
			status: "active",
		});

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "GET",
			url: "/api/self/card",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(200);

		const body = response.json();
		expect(body.lastFourDigits).toBe("4567");
		expect(body.status).toBe("active");
		expect(body.remainingSpend.current).toBe(540000);
		expect(body.remainingSpend.limit).toBe(1000000);
		expect(body.remainingSpend.formatted).toBe("4 600/10 000 kr");

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
			url: "/api/self/card",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(404);
		expect(response.json().errorCode).toBe(1001);

		await app.close();
	});

	it("returns 401 when no auth header is provided", async () => {
		const app = await createTestApp(getDb());
		const response = await app.inject({
			method: "GET",
			url: "/api/self/card",
		});

		expect(response.statusCode).toBe(401);
		expect(response.json().errorCode).toBe(3002);

		await app.close();
	});
});

describe("PATCH /api/self/card/activate", () => {
	const getDb = useTestDb();

	it("returns 200 and activates the card", async () => {
		const db = getDb();
		const [user] = await db
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();

		await db.insert(cards).values({
			userId: user.id,
			lastFourDigits: "4567",
			spendingLimit: 1000000,
			currentSpend: 0,
			expiryDate: new Date("2027-12-31"),
			status: "inactive",
		});

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "PATCH",
			url: "/api/self/card/activate",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(200);
		expect(response.json().status).toBe("active");

		await app.close();
	});

	it("returns 409 when card is already active", async () => {
		const db = getDb();
		const [user] = await db
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();

		await db.insert(cards).values({
			userId: user.id,
			lastFourDigits: "4567",
			spendingLimit: 1000000,
			currentSpend: 0,
			expiryDate: new Date("2027-12-31"),
			status: "active",
		});

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "PATCH",
			url: "/api/self/card/activate",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(409);
		expect(response.json().errorCode).toBe(1002);

		await app.close();
	});

	it("returns 403 when card is blocked", async () => {
		const db = getDb();
		const [user] = await db
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();

		await db.insert(cards).values({
			userId: user.id,
			lastFourDigits: "4567",
			spendingLimit: 1000000,
			currentSpend: 0,
			expiryDate: new Date("2027-12-31"),
			status: "blocked",
		});

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "PATCH",
			url: "/api/self/card/activate",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(403);
		expect(response.json().errorCode).toBe(1004);

		await app.close();
	});

	it("returns 400 when card has expired", async () => {
		const db = getDb();
		const [user] = await db
			.insert(users)
			.values({ companyName: "Company AB", email: "info@company-ab.se" })
			.returning();

		await db.insert(cards).values({
			userId: user.id,
			lastFourDigits: "4567",
			spendingLimit: 1000000,
			currentSpend: 0,
			expiryDate: new Date("2020-01-01"),
			status: "inactive",
		});

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "PATCH",
			url: "/api/self/card/activate",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().errorCode).toBe(1003);

		await app.close();
	});
});
