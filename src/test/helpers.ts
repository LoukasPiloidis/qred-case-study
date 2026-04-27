import { createApp } from "../server.js";

export const createTestApp = async () => {
	const app = await createApp();
	await app.ready();
	return app;
};
