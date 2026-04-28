import { z } from "zod";
import type { getDashboardByUserId } from "../services/dashboard.service.js";
import {
	type CardResponse,
	cardResponseSchema,
	toCardResponse,
} from "./card.serializer.js";
import {
	type InvoicesResponse,
	invoicesResponseSchema,
	toInvoicesResponse,
} from "./invoice.serializer.js";
import {
	type TransactionsResponse,
	toTransactionsResponse,
	transactionsResponseSchema,
} from "./transaction.serializer.js";
import {
	toUserResponse,
	type UserResponse,
	userResponseSchema,
} from "./user.serializer.js";

type DashboardData = Awaited<ReturnType<typeof getDashboardByUserId>>;

export const dashboardResponseSchema = z.object({
	user: userResponseSchema,
	card: cardResponseSchema,
	invoices: invoicesResponseSchema,
	transactions: transactionsResponseSchema,
});

export const toDashboardResponse = (data: DashboardData) => ({
	user: toUserResponse(data.user),
	card: toCardResponse(data.card),
	invoices: toInvoicesResponse(data.invoiceData),
	transactions: toTransactionsResponse(
		data.transactionData.rows,
		data.transactionData.remainingCount,
	),
});

export type DashboardResponse = {
	user: UserResponse;
	card: CardResponse;
	invoices: InvoicesResponse;
	transactions: TransactionsResponse;
};
