import type { FastifyInstance } from "fastify";
import { getTransactionsController } from "../controllers/transaction.controller.js";
import { TransactionErrors, UserErrors } from "../lib/errors/errors.js";
import { errorResponseSchema } from "../lib/schemas/error.schema.js";
import { transactionsResponseSchema } from "../serializers/transaction.serializer.js";

export const registerTransactionRoutes = async (app: FastifyInstance) => {
	app.get(
		"/api/self/transactions",
		{
			schema: {
				tags: ["Transactions"],
				summary: "Get the authenticated user's transactions",
				response: {
					200: transactionsResponseSchema,
					401: errorResponseSchema(UserErrors.UNAUTHORIZED),
					404: errorResponseSchema(TransactionErrors.NOT_FOUND),
				},
			},
		},
		getTransactionsController,
	);
};
