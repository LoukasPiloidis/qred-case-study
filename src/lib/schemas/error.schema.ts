import { z } from "zod";
import type { AppError } from "../errors/errors.js";

export const errorResponseSchema = (error: AppError) =>
	z.object({
		statusCode: z.literal(error.statusCode),
		error: z.literal(error.name),
		message: z.literal(error.message),
		errorCode: z.literal(error.errorCode),
	});
