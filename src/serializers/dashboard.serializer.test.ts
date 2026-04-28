import { describe, expect, it } from "vitest";
import {
	makeCard,
	makeInvoice,
	makeTransaction,
	makeUser,
} from "../test/factories.js";
import { toDashboardResponse } from "./dashboard.serializer.js";

const makeInvoiceData = () => ({
	invoices: [makeInvoice()],
	hasDueInvoice: true,
	dueInvoiceCount: 1,
});

const makeTransactionData = () => ({
	rows: [
		makeTransaction({
			description: "Coffee shop",
			amount: -4500,
			category: "food",
			date: new Date("2025-06-10T00:00:00.000Z"),
			createdAt: new Date("2025-06-10T00:00:00.000Z"),
		}),
	],
	remainingCount: 54,
});

describe("toDashboardResponse", () => {
	it("composes all sub-serializers into a single response", () => {
		const result = toDashboardResponse({
			user: makeUser(),
			card: makeCard(),
			invoiceData: makeInvoiceData(),
			transactionData: makeTransactionData(),
		});

		expect(result.user.companyName).toBe("Company AB");
		expect(result.card.lastFourDigits).toBe("4567");
		expect(result.card.remainingSpend.formatted).toBe("4 600/10 000 kr");
		expect(result.invoices.hasDueInvoice).toBe(true);
		expect(result.invoices.dueInvoiceCount).toBe(1);
		expect(result.transactions.transactions).toHaveLength(1);
		expect(result.transactions.remainingCount).toBe(54);
		expect(result.transactions.nextCursor).toBeTypeOf("string");
	});

	it("handles empty transactions", () => {
		const result = toDashboardResponse({
			user: makeUser(),
			card: makeCard(),
			invoiceData: makeInvoiceData(),
			transactionData: { rows: [], remainingCount: 0 },
		});

		expect(result.transactions.transactions).toHaveLength(0);
		expect(result.transactions.remainingCount).toBe(0);
		expect(result.transactions.nextCursor).toBeNull();
	});
});
