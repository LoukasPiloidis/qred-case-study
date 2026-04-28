import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

export const registerRateLimit = async (app: FastifyInstance) => {
	await app.register(rateLimit, {
		max: env.NODE_ENV === "test" ? 10_000 : 100,
		timeWindow: "1 minute",
	});
};
