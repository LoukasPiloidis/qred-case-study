import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDashboardController } from "../controllers/dashboard.controller.js";
import { CardErrors, UserErrors } from "../lib/errors/errors.js";
import { errorResponseSchema } from "../lib/schemas/error.schema.js";
import { dashboardResponseSchema } from "../serializers/dashboard.serializer.js";

export const registerDashboardRoutes = async (app: FastifyInstance) => {
	app.get(
		"/api/self/dashboard",
		{
			schema: {
				tags: ["Dashboard"],
				summary: "Get the authenticated user's dashboard overview",
				response: {
					200: dashboardResponseSchema,
					401: errorResponseSchema(UserErrors.UNAUTHORIZED),
					404: z.union([
						errorResponseSchema(UserErrors.NOT_FOUND),
						errorResponseSchema(CardErrors.NOT_FOUND),
					]),
				},
			},
		},
		getDashboardController,
	);
};
