import fastifySwagger from "@fastify/swagger";
import scalarFastify from "@scalar/fastify-api-reference";
import type { FastifyInstance } from "fastify";

export const registerSwagger = async (app: FastifyInstance) => {
	await app.register(fastifySwagger, {
		openapi: {
			info: {
				title: "Qred API",
				description: "Qred banking backend API",
				version: "1.0.0",
			},
		},
	});

	await app.register(scalarFastify, {
		routePrefix: "/reference",
	});
};
