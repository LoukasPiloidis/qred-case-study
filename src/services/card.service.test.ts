import { describe, expect, it } from "vitest";
import { createCard, createUser } from "../test/factories.js";
import { useTestDb } from "../test/setup.js";
import { activateCard, getCardByUserId } from "./card.service.js";

describe("getCardByUserId", () => {
	const getDb = useTestDb();

	it("returns the card for a user", async () => {
		const user = await createUser(getDb());
		await createCard(getDb(), { userId: user.id });

		const card = await getCardByUserId(getDb(), user.id);

		expect(card.lastFourDigits).toBe("1234");
		expect(card.spendingLimit).toBe(1000000);
	});

	it("throws NOT_FOUND when user has no card", async () => {
		const fakeId = "550e8400-e29b-41d4-a716-446655440000";

		await expect(getCardByUserId(getDb(), fakeId)).rejects.toMatchObject({
			errorCode: 1001,
		});
	});
});

describe("activateCard", () => {
	const getDb = useTestDb();

	it("activates an inactive card", async () => {
		const user = await createUser(getDb());
		await createCard(getDb(), { userId: user.id, status: "inactive" });

		const result = await activateCard(getDb(), user.id);

		expect(result.status).toBe("active");
	});

	it("throws ALREADY_ACTIVE when card is already active", async () => {
		const user = await createUser(getDb());
		await createCard(getDb(), { userId: user.id, status: "active" });

		await expect(activateCard(getDb(), user.id)).rejects.toMatchObject({
			errorCode: 1002,
		});
	});

	it("throws BLOCKED when card is blocked", async () => {
		const user = await createUser(getDb());
		await createCard(getDb(), { userId: user.id, status: "blocked" });

		await expect(activateCard(getDb(), user.id)).rejects.toMatchObject({
			errorCode: 1004,
		});
	});

	it("throws EXPIRED when card has expired", async () => {
		const user = await createUser(getDb());
		await createCard(getDb(), {
			userId: user.id,
			status: "inactive",
			expiryDate: new Date("2020-01-01"),
		});

		await expect(activateCard(getDb(), user.id)).rejects.toMatchObject({
			errorCode: 1003,
		});
	});

	it("throws NOT_FOUND when user has no card", async () => {
		const fakeId = "550e8400-e29b-41d4-a716-446655440000";

		await expect(activateCard(getDb(), fakeId)).rejects.toMatchObject({
			errorCode: 1001,
		});
	});
});
