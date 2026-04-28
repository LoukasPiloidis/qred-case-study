import { z } from "zod";
import type { transactions } from "../lib/db/schema/transactions.js";
import { encodeCursor } from "../lib/pagination/cursor.js";

type TransactionRow = typeof transactions.$inferSelect;

const formatOere = (oere: number) => {
	const kr = Math.floor(Math.abs(oere) / 100);
	const sign = oere < 0 ? "-" : "";
	return `${sign}${kr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
};

const transactionResponseSchema = z.object({
	id: z.uuid(),
	cardId: z.uuid(),
	description: z.string(),
	amount: z.number().int(),
	formattedAmount: z.string(),
	currency: z.string(),
	date: z.iso.datetime(),
	category: z.string(),
	createdAt: z.iso.datetime(),
});

export const transactionsResponseSchema = z.object({
	transactions: z.array(transactionResponseSchema),
	remainingCount: z.number().int(),
	nextCursor: z.string().nullable(),
});

export const toTransactionResponse = (transaction: TransactionRow) => ({
	id: transaction.id,
	cardId: transaction.cardId,
	description: transaction.description,
	amount: transaction.amount,
	formattedAmount: `${formatOere(transaction.amount)} kr`,
	currency: transaction.currency,
	date: transaction.date.toISOString(),
	category: transaction.category,
	createdAt: transaction.createdAt.toISOString(),
});

export const toTransactionsResponse = (
	rows: TransactionRow[],
	remainingCount: number,
) => {
	const lastRow = rows.at(-1);
	return {
		transactions: rows.map(toTransactionResponse),
		remainingCount,
		nextCursor: lastRow ? encodeCursor(lastRow.date, lastRow.id) : null,
	};
};

export type TransactionResponse = ReturnType<typeof toTransactionResponse>;
export type TransactionsResponse = ReturnType<typeof toTransactionsResponse>;
