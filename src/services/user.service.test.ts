import { describe, expect, it } from "vitest";
import { createUser } from "../test/factories.js";
import { useTestDb } from "../test/setup.js";
import { getUserById } from "./user.service.js";

describe("getUserById", () => {
	const getDb = useTestDb();

	it("returns the user when found", async () => {
		const user = await createUser(getDb());

		const result = await getUserById(getDb(), user.id);

		expect(result.id).toBe(user.id);
		expect(result.companyName).toBe("Company AB");
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
