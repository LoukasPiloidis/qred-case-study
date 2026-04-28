import { describe, expect, it } from "vitest";
import { toDashboardResponse } from "./dashboard.serializer.js";

const makeUser = () => ({
	id: "550e8400-e29b-41d4-a716-446655440000",
	companyName: "Company AB",
	email: "info@company-ab.se",
	createdAt: new Date("2025-01-01T00:00:00.000Z"),
});

const makeCard = () => ({
	id: "660e8400-e29b-41d4-a716-446655440000",
	userId: "550e8400-e29b-41d4-a716-446655440000",
	lastFourDigits: "4567",
	status: "active" as const,
	spendingLimit: 1000000,
	currentSpend: 540000,
	expiryDate: new Date("2027-12-31T00:00:00.000Z"),
	createdAt: new Date("2025-01-01T00:00:00.000Z"),
});

const makeInvoiceData = () => ({
	invoices: [
		{
			id: "770e8400-e29b-41d4-a716-446655440000",
			userId: "550e8400-e29b-41d4-a716-446655440000",
			amount: 150000,
			dueDate: new Date("2025-06-01T00:00:00.000Z"),
			status: "pending" as const,
			createdAt: new Date("2025-01-01T00:00:00.000Z"),
		},
	],
	hasDueInvoice: true,
	dueInvoiceCount: 1,
});

const makeTransactionData = () => ({
	rows: [
		{
			id: "880e8400-e29b-41d4-a716-446655440000",
			userId: "550e8400-e29b-41d4-a716-446655440000",
			cardId: "660e8400-e29b-41d4-a716-446655440000",
			description: "Coffee shop",
			amount: -4500,
			currency: "SEK",
			date: new Date("2025-06-10T00:00:00.000Z"),
			category: "food",
			createdAt: new Date("2025-06-10T00:00:00.000Z"),
		},
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
