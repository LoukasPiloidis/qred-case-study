import type { FastifyInstance } from "fastify";
import { getInvoicesController } from "../controllers/invoice.controller.js";

export const registerInvoiceRoutes = async (app: FastifyInstance) => {
	app.get(
		"/api/self/invoices",
		{
			schema: {
				tags: ["Invoices"],
				summary: "Get invoices for the authenticated user",
			},
		},
		getInvoicesController,
	);
};
