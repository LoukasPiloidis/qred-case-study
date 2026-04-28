import fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import type { Database } from "./lib/db/client.js";
import { errorHandler } from "./lib/errors/error-handler.js";
import { loggerConfig } from "./lib/logger/index.js";
import { registerAuth } from "./plugins/auth.js";
import { registerCors } from "./plugins/cors.js";
import { registerDatabase } from "./plugins/database.js";
import { registerRequestContext } from "./plugins/request-context.js";
import { registerSwagger } from "./plugins/swagger.js";
import { registerCardRoutes } from "./routes/card.routes.js";
import { registerDashboardRoutes } from "./routes/dashboard.routes.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerInvoiceRoutes } from "./routes/invoice.routes.js";
import { registerTransactionRoutes } from "./routes/transaction.routes.js";
import { registerUserRoutes } from "./routes/user.routes.js";

type CreateAppOptions = {
	db: Database;
};

export const createApp = async ({ db }: CreateAppOptions) => {
	const app = fastify({
		logger: loggerConfig,
	});

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);
	app.setErrorHandler(errorHandler);

	await registerCors(app);
	await registerDatabase(app, db);
	await registerSwagger(app);
	await registerRequestContext(app);
	await registerHealthRoute(app);

	await app.register(async (protectedRoutes) => {
		await registerAuth(protectedRoutes);
		await registerUserRoutes(protectedRoutes);
		await registerInvoiceRoutes(protectedRoutes);
		await registerCardRoutes(protectedRoutes);
		await registerTransactionRoutes(protectedRoutes);
		await registerDashboardRoutes(protectedRoutes);
	});

	return app;
};
