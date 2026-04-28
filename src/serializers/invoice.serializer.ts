import { z } from "zod";
import type { invoices } from "../lib/db/schema/invoices.js";

type InvoiceRow = typeof invoices.$inferSelect;

const invoiceResponseSchema = z.object({
	id: z.uuid(),
	amount: z.number().int(),
	dueDate: z.iso.datetime(),
	status: z.enum(["pending", "paid", "overdue"]),
	createdAt: z.iso.datetime(),
});

export const invoicesResponseSchema = z.object({
	invoices: z.array(invoiceResponseSchema),
	hasDueInvoice: z.boolean(),
	dueInvoiceCount: z.number().int(),
});

export const toInvoiceResponse = (invoice: InvoiceRow) => ({
	id: invoice.id,
	amount: invoice.amount,
	dueDate: invoice.dueDate.toISOString(),
	status: invoice.status,
	createdAt: invoice.createdAt.toISOString(),
});

export const toInvoicesResponse = (data: {
	invoices: InvoiceRow[];
	hasDueInvoice: boolean;
	dueInvoiceCount: number;
}) => ({
	invoices: data.invoices.map(toInvoiceResponse),
	hasDueInvoice: data.hasDueInvoice,
	dueInvoiceCount: data.dueInvoiceCount,
});

export type InvoiceResponse = ReturnType<typeof toInvoiceResponse>;
export type InvoicesResponse = ReturnType<typeof toInvoicesResponse>;
