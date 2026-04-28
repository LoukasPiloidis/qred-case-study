import { z } from "zod";
import type { getDashboardByUserId } from "../services/dashboard.service.js";
import { cardResponseSchema, toCardResponse } from "./card.serializer.js";
import {
	invoicesResponseSchema,
	toInvoicesResponse,
} from "./invoice.serializer.js";
import {
	toTransactionsResponse,
	transactionsResponseSchema,
} from "./transaction.serializer.js";
import { toUserResponse, userResponseSchema } from "./user.serializer.js";

export type DashboardData = Awaited<ReturnType<typeof getDashboardByUserId>>;

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
