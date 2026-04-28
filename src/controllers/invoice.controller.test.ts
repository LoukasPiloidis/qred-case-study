import { describe, expect, it } from "vitest";
import { createInvoice, createUser } from "../test/factories.js";
import { createTestApp } from "../test/helpers.js";
import { useTestDb } from "../test/setup.js";

describe("GET /api/self/invoices", () => {
	const getDb = useTestDb();

	it("returns 200 with invoices data", async () => {
		const db = getDb();
		const user = await createUser(db);
		await createInvoice(db, {
			userId: user.id,
			amount: 100000,
			dueDate: new Date("2025-06-01"),
		});

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "GET",
			url: "/api/self/invoices",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(200);

		const body = response.json();
		expect(body.invoices).toHaveLength(1);
		expect(body.invoices[0].amount).toBe(100000);
		expect(body.hasDueInvoice).toBeDefined();
		expect(body.dueInvoiceCount).toBeDefined();

		await app.close();
	});

	it("returns 200 with empty invoices when user has none", async () => {
		const db = getDb();
		const user = await createUser(db);

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "GET",
			url: "/api/self/invoices",
			headers: { "x-user-id": user.id },
		});

		expect(response.statusCode).toBe(200);
		expect(response.json().invoices).toHaveLength(0);

		await app.close();
	});

	it("returns 401 when no auth header is provided", async () => {
		const app = await createTestApp(getDb());
		const response = await app.inject({
			method: "GET",
			url: "/api/self/invoices",
		});

		expect(response.statusCode).toBe(401);
		expect(response.json().errorCode).toBe(3002);

		await app.close();
	});
});
