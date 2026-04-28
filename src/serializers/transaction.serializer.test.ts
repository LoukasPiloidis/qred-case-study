import { describe, expect, it } from "vitest";
import { makeTransaction } from "../test/factories.js";
import {
	toTransactionResponse,
	toTransactionsResponse,
} from "./transaction.serializer.js";

describe("toTransactionResponse", () => {
	it("transforms a transaction row to the API response shape", () => {
		const result = toTransactionResponse(makeTransaction());

		expect(result).toEqual({
			id: "880e8400-e29b-41d4-a716-446655440000",
			cardId: "660e8400-e29b-41d4-a716-446655440000",
			description: "Office Supplies AB",
			amount: 15000,
			formattedAmount: "150 kr",
			currency: "SEK",
			date: "2026-04-25T10:30:00.000Z",
			category: "supplies",
			createdAt: "2026-04-25T10:30:00.000Z",
		});
	});

	it("formats large amounts with thousand separators", () => {
		const result = toTransactionResponse(makeTransaction({ amount: 250000 }));

		expect(result.formattedAmount).toBe("2 500 kr");
	});

	it("formats small amounts correctly", () => {
		const result = toTransactionResponse(makeTransaction({ amount: 50 }));

		expect(result.formattedAmount).toBe("0 kr");
	});

	it("excludes userId from the response", () => {
		const result = toTransactionResponse(makeTransaction());

		expect(result).not.toHaveProperty("userId");
	});
});

describe("toTransactionsResponse", () => {
	it("wraps transactions with remainingCount and nextCursor", () => {
		const rows = [
			makeTransaction(),
			makeTransaction({ id: "aaa", date: new Date("2026-04-20T10:00:00Z") }),
		];
		const result = toTransactionsResponse(rows, 5);

		expect(result.transactions).toHaveLength(2);
		expect(result.remainingCount).toBe(5);
		expect(result.nextCursor).toBeTypeOf("string");
	});

	it("returns empty array with zero count and null cursor", () => {
		const result = toTransactionsResponse([], 0);

		expect(result.transactions).toHaveLength(0);
		expect(result.remainingCount).toBe(0);
		expect(result.nextCursor).toBeNull();
	});
});
