import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

export const registerCors = async (app: FastifyInstance) => {
	await app.register(cors, {
		origin: true, // Reflects request origin for demo purposes — in production, restrict to specific domains
		methods: ["GET", "PATCH", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
		credentials: true,
	});
};
