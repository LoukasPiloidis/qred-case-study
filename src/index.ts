import { env } from "./config/env.js";
import { db } from "./lib/db/client.js";
import { createApp } from "./server.js";

const start = async () => {
	const app = await createApp({ db });

	await app.listen({ port: env.PORT, host: env.HOST });
};

start();
