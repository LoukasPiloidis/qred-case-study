import type { FastifyInstance } from "fastify";
import type { Database } from "../lib/db/client.js";

declare module "fastify" {
	interface FastifyInstance {
		db: Database;
	}
}

export const registerDatabase = async (app: FastifyInstance, db: Database) => {
	app.decorate("db", db);
};
