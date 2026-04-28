import { describe, expect, it } from "vitest";
import { users } from "../lib/db/schema/index.js";
import { createTestApp } from "../test/helpers.js";
import { useTestDb } from "../test/setup.js";

describe("GET /api/self", () => {
	const getDb = useTestDb();

	it("returns 200 with the user data", async () => {
		const db = getDb();
		const [inserted] = await db
			.insert(users)
			.values({
				companyName: "Company AB",
				email: "info@company-ab.se",
			})
			.returning();

		const app = await createTestApp(db);
		const response = await app.inject({
			method: "GET",
			url: "/api/self",
			headers: { "x-user-id": inserted.id },
		});

		expect(response.statusCode).toBe(200);

		const body = response.json();
		expect(body.id).toBe(inserted.id);
		expect(body.companyName).toBe("Company AB");
		expect(body.email).toBe("info@company-ab.se");
		expect(body.createdAt).toBeDefined();

		await app.close();
	});

	it("returns 404 when user does not exist", async () => {
		const app = await createTestApp(getDb());
		const response = await app.inject({
			method: "GET",
			url: "/api/self",
			headers: { "x-user-id": "550e8400-e29b-41d4-a716-446655440000" },
		});

		expect(response.statusCode).toBe(404);

		const body = response.json();
		expect(body.errorCode).toBe(3001);
		expect(body.message).toBe("User not found");

		await app.close();
	});

	it("returns 401 when no auth header is provided", async () => {
		const app = await createTestApp(getDb());
		const response = await app.inject({
			method: "GET",
			url: "/api/self",
		});

		expect(response.statusCode).toBe(401);
		expect(response.json().errorCode).toBe(3002);

		await app.close();
	});
});
