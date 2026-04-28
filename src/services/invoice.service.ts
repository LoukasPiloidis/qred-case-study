import { eq } from "drizzle-orm";
import type { Database } from "../lib/db/client.js";
import { invoices } from "../lib/db/schema/invoices.js";

export const getInvoicesByUserId = async (db: Database, userId: string) => {
	const userInvoices = await db
		.select()
		.from(invoices)
		.where(eq(invoices.userId, userId));

	const now = new Date();
	const dueInvoices = userInvoices.filter(
		(invoice) => invoice.status !== "paid" && invoice.dueDate <= now,
	);

	return {
		invoices: userInvoices,
		hasDueInvoice: dueInvoices.length > 0,
		dueInvoiceCount: dueInvoices.length,
	};
};
