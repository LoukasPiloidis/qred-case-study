import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getTransactionsController } from "../controllers/transaction.controller.js";
import { CursorErrors, UserErrors } from "../lib/errors/errors.js";
import { errorResponseSchema } from "../lib/schemas/error.schema.js";
import { transactionsResponseSchema } from "../serializers/transaction.serializer.js";

const transactionsQuerySchema = z.object({
	limit: z.coerce.number().int().optional(),
	cursor: z.string().optional(),
});

export const registerTransactionRoutes = async (app: FastifyInstance) => {
	app.get(
		"/api/self/card/transactions",
		{
			schema: {
				tags: ["Transactions"],
				summary: "Get the authenticated user's transactions",
				querystring: transactionsQuerySchema,
				response: {
					200: transactionsResponseSchema,
					400: errorResponseSchema(CursorErrors.INVALID_CURSOR),
					401: errorResponseSchema(UserErrors.UNAUTHORIZED),
				},
			},
		},
		getTransactionsController,
	);
};
