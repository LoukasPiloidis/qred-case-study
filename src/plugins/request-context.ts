import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";

export const registerRequestContext = async (app: FastifyInstance) => {
	app.addHook("onRequest", async (request) => {
		const requestId = randomUUID();
		request.log = request.log.child({ requestId });
		request.log.info(
			{ method: request.method, url: request.url },
			"Incoming request",
		);
	});

	app.addHook("onResponse", async (request, reply) => {
		request.log.info(
			{ statusCode: reply.statusCode, responseTime: reply.elapsedTime },
			"Request completed",
		);
	});
};
