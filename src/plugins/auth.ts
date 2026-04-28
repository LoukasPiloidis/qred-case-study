import type { FastifyInstance } from "fastify";
import { UserErrors } from "../lib/errors/errors.js";

declare module "fastify" {
	interface FastifyRequest {
		userId: string;
	}
}

export const registerAuth = async (app: FastifyInstance) => {
	app.decorateRequest("userId", "");

	app.addHook("onRequest", async (request) => {
		// In a real application, this would extract the user ID from a JWT or session cookie.
		// For this demo, we read it from the x-user-id header to simulate authentication.
		const userId = request.headers["x-user-id"];

		if (typeof userId !== "string" || !userId) {
			throw UserErrors.UNAUTORIZED;
		}

		request.userId = userId;
	});
};
