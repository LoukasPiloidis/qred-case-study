import type { FastifyInstance } from "fastify";

export const registerHealthRoute = async (app: FastifyInstance) => {
	app.get("/health", async () => {
		return { status: "ok" };
	});
};
