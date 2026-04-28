import { describe, expect, it } from "vitest";
import { toInvoiceResponse, toInvoicesResponse } from "./invoice.serializer.js";

describe("toInvoiceResponse", () => {
	it("transforms an invoice row to the API response shape", () => {
		const invoiceRow = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			userId: "660e8400-e29b-41d4-a716-446655440000",
			amount: 150000,
			dueDate: new Date("2025-03-15T00:00:00.000Z"),
			status: "pending" as const,
			createdAt: new Date("2025-01-01T00:00:00.000Z"),
		};

		const result = toInvoiceResponse(invoiceRow);

		expect(result).toEqual({
			id: "550e8400-e29b-41d4-a716-446655440000",
			amount: 150000,
			dueDate: "2025-03-15T00:00:00.000Z",
			status: "pending",
			createdAt: "2025-01-01T00:00:00.000Z",
		});
	});
});

describe("toInvoicesResponse", () => {
	it("includes hasDueInvoice and dueInvoiceCount alongside invoices", () => {
		const data = {
			invoices: [
				{
					id: "aaa",
					userId: "bbb",
					amount: 50000,
					dueDate: new Date("2025-02-01T00:00:00.000Z"),
					status: "paid" as const,
					createdAt: new Date("2025-01-01T00:00:00.000Z"),
				},
				{
					id: "ccc",
					userId: "bbb",
					amount: 75000,
					dueDate: new Date("2025-03-01T00:00:00.000Z"),
					status: "overdue" as const,
					createdAt: new Date("2025-01-15T00:00:00.000Z"),
				},
			],
			hasDueInvoice: true,
			dueInvoiceCount: 1,
		};

		const result = toInvoicesResponse(data);

		expect(result.invoices).toHaveLength(2);
		expect(result.hasDueInvoice).toBe(true);
		expect(result.dueInvoiceCount).toBe(1);
	});

	it("returns empty invoices array with no due invoices", () => {
		const data = {
			invoices: [],
			hasDueInvoice: false,
			dueInvoiceCount: 0,
		};

		const result = toInvoicesResponse(data);

		expect(result.invoices).toHaveLength(0);
		expect(result.hasDueInvoice).toBe(false);
		expect(result.dueInvoiceCount).toBe(0);
	});
});
