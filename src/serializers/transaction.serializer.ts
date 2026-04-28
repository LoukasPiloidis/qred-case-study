import { z } from "zod";
import type { transactions } from "../lib/db/schema/transactions.js";

type TransactionRow = typeof transactions.$inferSelect;

const formatOere = (oere: number) => {
	const kr = Math.floor(Math.abs(oere) / 100);
	const sign = oere < 0 ? "-" : "";
	return `${sign}${kr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
};

const transactionResponseSchema = z.object({
	id: z.uuid(),
	cardId: z.uuid(),
	amount: z.number().int(),
	formattedAmount: z.string(),
	merchant: z.string(),
	createdAt: z.iso.datetime(),
});

export const transactionsResponseSchema = z.object({
	transactions: z.array(transactionResponseSchema),
	totalCount: z.number().int(),
});

export const toTransactionResponse = (transaction: TransactionRow) => ({
	id: transaction.id,
	cardId: transaction.cardId,
	amount: transaction.amount,
	formattedAmount: `${formatOere(transaction.amount)} kr`,
	merchant: transaction.merchant,
	createdAt: transaction.createdAt.toISOString(),
});

export const toTransactionsResponse = (rows: TransactionRow[]) => ({
	transactions: rows.map(toTransactionResponse),
	totalCount: rows.length,
});

export type TransactionResponse = ReturnType<typeof toTransactionResponse>;
export type TransactionsResponse = ReturnType<typeof toTransactionsResponse>;
