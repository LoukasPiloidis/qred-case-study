import type { FastifyInstance } from "fastify";
import { getUserController } from "../controllers/user.controller.js";

export const registerUserRoutes = async (app: FastifyInstance) => {
	app.get(
		"/api/self",
		{
			schema: {
				tags: ["Users"],
				summary: "Get the authenticated user",
			},
		},
		getUserController,
	);
};
