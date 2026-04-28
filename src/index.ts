import { env } from "./config/env.js";
import { db } from "./lib/db/client.js";
import { createApp } from "./server.js";

const start = async () => {
	const app = await createApp({ db });

	const shutdown = async (signal: string) => {
		app.log.info(`${signal} received, shutting down gracefully`);
		await app.close();
		process.exit(0);
	};

	process.on("SIGTERM", () => shutdown("SIGTERM"));
	process.on("SIGINT", () => shutdown("SIGINT"));

	await app.listen({ port: env.PORT, host: env.HOST });
};

start();
