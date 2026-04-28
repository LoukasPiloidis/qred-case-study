import { describe, expect, it } from "vitest";
import {
	toTransactionResponse,
	toTransactionsResponse,
} from "./transaction.serializer.js";

const makeTransaction = (overrides = {}) => ({
	id: "550e8400-e29b-41d4-a716-446655440000",
	userId: "660e8400-e29b-41d4-a716-446655440000",
	cardId: "770e8400-e29b-41d4-a716-446655440000",
	amount: 15000,
	merchant: "Office Supplies AB",
	createdAt: new Date("2026-04-25T10:30:00.000Z"),
	...overrides,
});

describe("toTransactionResponse", () => {
	it("transforms a transaction row to the API response shape", () => {
		const result = toTransactionResponse(makeTransaction());

		expect(result).toEqual({
			id: "550e8400-e29b-41d4-a716-446655440000",
			cardId: "770e8400-e29b-41d4-a716-446655440000",
			amount: 15000,
			formattedAmount: "150 kr",
			merchant: "Office Supplies AB",
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
	it("wraps transactions with totalCount", () => {
		const rows = [makeTransaction(), makeTransaction({ id: "aaa" })];
		const result = toTransactionsResponse(rows);

		expect(result.transactions).toHaveLength(2);
		expect(result.totalCount).toBe(2);
	});

	it("returns empty array with zero count", () => {
		const result = toTransactionsResponse([]);

		expect(result.transactions).toHaveLength(0);
		expect(result.totalCount).toBe(0);
	});
});
