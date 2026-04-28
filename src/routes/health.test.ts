import { describe, expect, it } from "vitest";
import { createTestApp } from "../test/helpers.js";
import { useTestDb } from "../test/setup.js";

describe("GET /health", () => {
	const getDb = useTestDb();

	it("returns 200 with status ok", async () => {
		const app = await createTestApp(getDb());

		const response = await app.inject({
			method: "GET",
			url: "/health",
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({ status: "ok" });

		await app.close();
	});
});
