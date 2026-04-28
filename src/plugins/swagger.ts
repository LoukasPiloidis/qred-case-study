import fastifySwagger from "@fastify/swagger";
import scalarFastify from "@scalar/fastify-api-reference";
import type { FastifyInstance } from "fastify";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export const registerSwagger = async (app: FastifyInstance) => {
	await app.register(fastifySwagger, {
		openapi: {
			info: {
				title: "Qred API",
				description: "Qred banking backend API",
				version: "1.0.0",
			},
		},
		transform: jsonSchemaTransform,
	});

	await app.register(scalarFastify, {
		routePrefix: "/reference",
	});
};
