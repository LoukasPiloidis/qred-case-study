import type { FastifyInstance } from "fastify";
import { getUserController } from "../controllers/user.controller.js";
import { UserErrors } from "../lib/errors/errors.js";
import { errorResponseSchema } from "../lib/schemas/error.schema.js";
import { userResponseSchema } from "../serializers/user.serializer.js";

export const registerUserRoutes = async (app: FastifyInstance) => {
	app.get(
		"/api/self",
		{
			schema: {
				tags: ["Users"],
				summary: "Get the authenticated user",
				response: {
					200: userResponseSchema,
					401: errorResponseSchema(UserErrors.UNAUTHORIZED),
					404: errorResponseSchema(UserErrors.NOT_FOUND),
				},
			},
		},
		getUserController,
	);
};
