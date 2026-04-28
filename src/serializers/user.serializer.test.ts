import { describe, expect, it } from "vitest";
import { toUserResponse } from "./user.serializer.js";

describe("toUserResponse", () => {
	it("transforms a user row to the API response shape", () => {
		const userRow = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			companyName: "Company AB",
			email: "info@company-ab.se",
			createdAt: new Date("2025-01-15T10:30:00.000Z"),
		};

		const result = toUserResponse(userRow);

		expect(result).toEqual({
			id: "550e8400-e29b-41d4-a716-446655440000",
			companyName: "Company AB",
			email: "info@company-ab.se",
			createdAt: "2025-01-15T10:30:00.000Z",
		});
	});

	it("formats createdAt as an ISO string", () => {
		const userRow = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			companyName: "Test Co",
			email: "test@test.se",
			createdAt: new Date("2024-12-31T23:59:59.999Z"),
		};

		const result = toUserResponse(userRow);

		expect(result.createdAt).toBe("2024-12-31T23:59:59.999Z");
	});
});
