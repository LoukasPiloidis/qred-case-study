import { desc, eq } from "drizzle-orm";
import type { Database } from "../lib/db/client.js";
import { transactions } from "../lib/db/schema/transactions.js";
import { TransactionErrors } from "../lib/errors/errors.js";

export const getTransactionsByUserId = async (db: Database, userId: string) => {
	const rows = await db
		.select()
		.from(transactions)
		.where(eq(transactions.userId, userId))
		.orderBy(desc(transactions.createdAt));

	if (rows.length === 0) {
		throw TransactionErrors.NOT_FOUND;
	}

	return rows;
};
