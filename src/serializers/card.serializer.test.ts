import { describe, expect, it } from "vitest";
import { makeCard } from "../test/factories.js";
import { toCardResponse } from "./card.serializer.js";

describe("toCardResponse", () => {
	it("transforms a card row to the API response shape", () => {
		const result = toCardResponse(makeCard());

		expect(result).toEqual({
			id: "660e8400-e29b-41d4-a716-446655440000",
			lastFourDigits: "4567",
			status: "active",
			remainingSpend: {
				current: 540000,
				limit: 1000000,
				currency: "SEK",
				formatted: "4 600/10 000 kr",
			},
			expiryDate: "2027-12-31T00:00:00.000Z",
			createdAt: "2025-01-01T00:00:00.000Z",
		});
	});

	it("formats zero spend correctly", () => {
		const result = toCardResponse(makeCard({ currentSpend: 0 }));

		expect(result.remainingSpend.formatted).toBe("10 000/10 000 kr");
	});

	it("formats max spend correctly", () => {
		const result = toCardResponse(makeCard({ currentSpend: 1000000 }));

		expect(result.remainingSpend.formatted).toBe("0/10 000 kr");
	});

	it("clamps remaining to zero when currentSpend exceeds limit", () => {
		const result = toCardResponse(
			makeCard({ currentSpend: 1200000, spendingLimit: 1000000 }),
		);

		expect(result.remainingSpend.formatted).toBe("0/10 000 kr");
	});

	it("formats large amounts with thousand separators", () => {
		const result = toCardResponse(
			makeCard({ spendingLimit: 10000000, currentSpend: 0 }),
		);

		expect(result.remainingSpend.formatted).toBe("100 000/100 000 kr");
	});
});
