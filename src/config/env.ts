import { z } from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().default(3000),
	HOST: z.string().default("0.0.0.0"),
	DATABASE_URL: z.string().default("postgres://qred:qred@localhost:5432/qred"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
});

export const env = envSchema.parse(process.env);
