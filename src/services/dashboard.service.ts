import type { Database } from "../lib/db/client.js";
import { getCardByUserId } from "./card.service.js";
import { getInvoicesByUserId } from "./invoice.service.js";
import { getTransactionsByUserId } from "./transaction.service.js";
import { getUserById } from "./user.service.js";

const DASHBOARD_TRANSACTION_LIMIT = 3;

export const getDashboardByUserId = async (db: Database, userId: string) => {
	const [user, card, invoiceData, transactionData] = await Promise.all([
		getUserById(db, userId),
		getCardByUserId(db, userId),
		getInvoicesByUserId(db, userId),
		getTransactionsByUserId(db, userId, {
			limit: DASHBOARD_TRANSACTION_LIMIT,
		}),
	]);

	return { user, card, invoiceData, transactionData };
};
