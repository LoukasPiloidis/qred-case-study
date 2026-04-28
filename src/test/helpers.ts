import type { Database } from "../lib/db/client.js";
import { createApp } from "../server.js";

export const createTestApp = async (db: Database) => {
	const app = await createApp({ db });
	await app.ready();
	return app;
};
