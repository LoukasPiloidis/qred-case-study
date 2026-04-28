import type { invoices } from "../lib/db/schema/invoices.js";

type InvoiceRow = typeof invoices.$inferSelect;

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
