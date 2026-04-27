import fastify from "fastify";
import { errorHandler } from "./lib/errors/error-handler.js";
import { loggerConfig } from "./lib/logger/index.js";
import { registerRequestContext } from "./plugins/request-context.js";
import { registerSwagger } from "./plugins/swagger.js";
import { registerHealthRoute } from "./routes/health.js";

export const createApp = async () => {
	const app = fastify({
		logger: loggerConfig,
	});

	app.setErrorHandler(errorHandler);

	await registerSwagger(app);
	await registerRequestContext(app);
	await registerHealthRoute(app);

	return app;
};
