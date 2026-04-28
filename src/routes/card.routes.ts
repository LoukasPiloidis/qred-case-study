import type { FastifyInstance } from "fastify";
import {
	activateCardController,
	getCardController,
} from "../controllers/card.controller.js";
import { CardErrors, UserErrors } from "../lib/errors/errors.js";
import { errorResponseSchema } from "../lib/schemas/error.schema.js";
import { cardResponseSchema } from "../serializers/card.serializer.js";

export const registerCardRoutes = async (app: FastifyInstance) => {
	app.get(
		"/api/self/card",
		{
			schema: {
				tags: ["Cards"],
				summary: "Get the authenticated user's card",
				response: {
					200: cardResponseSchema,
					401: errorResponseSchema(UserErrors.UNAUTHORIZED),
					404: errorResponseSchema(CardErrors.NOT_FOUND),
				},
			},
		},
		getCardController,
	);

	app.patch(
		"/api/self/card/activate",
		{
			config: {
				rateLimit: {
					max: 10,
					timeWindow: "1 minute",
				},
			},
			schema: {
				tags: ["Cards"],
				summary: "Activate the authenticated user's card",
				response: {
					200: cardResponseSchema,
					400: errorResponseSchema(CardErrors.EXPIRED),
					401: errorResponseSchema(UserErrors.UNAUTHORIZED),
					403: errorResponseSchema(CardErrors.BLOCKED),
					404: errorResponseSchema(CardErrors.NOT_FOUND),
					409: errorResponseSchema(CardErrors.ALREADY_ACTIVE),
				},
			},
		},
		activateCardController,
	);
};
