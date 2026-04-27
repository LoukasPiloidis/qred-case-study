import { env } from "./config/env.js";
import { createApp } from "./server.js";

const start = async () => {
	const app = await createApp();

	await app.listen({ port: env.PORT, host: env.HOST });
};

start();
