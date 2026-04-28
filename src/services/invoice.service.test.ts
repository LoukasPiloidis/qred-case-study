import { describe, expect, it } from "vitest";
import { createInvoice, createUser } from "../test/factories.js";
import { useTestDb } from "../test/setup.js";
import { getInvoicesByUserId } from "./invoice.service.js";

describe("getInvoicesByUserId", () => {
	const getDb = useTestDb();

	it("returns invoices for a user", async () => {
		const user = await createUser(getDb());
		await createInvoice(getDb(), {
			userId: user.id,
			amount: 100000,
			dueDate: new Date("2025-06-01"),
		});

		const result = await getInvoicesByUserId(getDb(), user.id);

		expect(result.invoices).toHaveLength(1);
		expect(result.invoices[0].amount).toBe(100000);
	});

	it("returns empty array when user has no invoices", async () => {
		const user = await createUser(getDb());

		const result = await getInvoicesByUserId(getDb(), user.id);

		expect(result.invoices).toHaveLength(0);
		expect(result.hasDueInvoice).toBe(false);
		expect(result.dueInvoiceCount).toBe(0);
	});

	it("detects due invoices correctly", async () => {
		const user = await createUser(getDb());
		const pastDate = new Date("2024-01-01");

		await Promise.all([
			createInvoice(getDb(), {
				userId: user.id,
				amount: 50000,
				dueDate: pastDate,
				status: "pending",
			}),
			createInvoice(getDb(), {
				userId: user.id,
				amount: 75000,
				dueDate: pastDate,
				status: "overdue",
			}),
			createInvoice(getDb(), {
				userId: user.id,
				amount: 30000,
				dueDate: pastDate,
				status: "paid",
			}),
		]);

		const result = await getInvoicesByUserId(getDb(), user.id);

		expect(result.hasDueInvoice).toBe(true);
		expect(result.dueInvoiceCount).toBe(2);
	});

	it("returns empty array when user ID has no invoices", async () => {
		const fakeId = "550e8400-e29b-41d4-a716-446655440000";

		const result = await getInvoicesByUserId(getDb(), fakeId);

		expect(result.invoices).toHaveLength(0);
		expect(result.hasDueInvoice).toBe(false);
	});
});
