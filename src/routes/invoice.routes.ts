import type { FastifyInstance } from "fastify";
import { getInvoicesController } from "../controllers/invoice.controller.js";
import { UserErrors } from "../lib/errors/errors.js";
import { errorResponseSchema } from "../lib/schemas/error.schema.js";
import { invoicesResponseSchema } from "../serializers/invoice.serializer.js";

export const registerInvoiceRoutes = async (app: FastifyInstance) => {
	app.get(
		"/api/self/invoices",
		{
			schema: {
				tags: ["Invoices"],
				summary: "Get invoices for the authenticated user",
				response: {
					200: invoicesResponseSchema,
					401: errorResponseSchema(UserErrors.UNAUTHORIZED),
				},
			},
		},
		getInvoicesController,
	);
};
