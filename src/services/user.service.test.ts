import { describe, expect, it } from "vitest";
import { users } from "../lib/db/schema/index.js";
import { useTestDb } from "../test/setup.js";
import { getUserById } from "./user.service.js";

describe("getUserById", () => {
	const getDb = useTestDb();

	it("returns the user when found", async () => {
		const db = getDb();
		const [inserted] = await db
			.insert(users)
			.values({
				companyName: "Company AB",
				email: "info@company-ab.se",
			})
			.returning();

		const result = await getUserById(db, inserted.id);

		expect(result.id).toBe(inserted.id);
		expect(result.companyName).toBe("Company AB");
		expect(result.email).toBe("info@company-ab.se");
	});

	it("throws AppError 404 when user is not found", async () => {
		const fakeId = "550e8400-e29b-41d4-a716-446655440000";

		await expect(getUserById(getDb(), fakeId)).rejects.toMatchObject({
			statusCode: 404,
			errorCode: 3001,
			message: "User not found",
		});
	});
});
