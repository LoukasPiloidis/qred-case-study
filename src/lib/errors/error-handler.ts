import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { AppError } from "./errors.js";

export const errorHandler = (
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	if (error instanceof AppError) {
		request.log.warn(
			{ errorCode: error.errorCode, statusCode: error.statusCode },
			error.message,
		);

		return reply.status(error.statusCode).send({
			statusCode: error.statusCode,
			error: error.name,
			message: error.message,
			errorCode: error.errorCode,
		});
	}

	if (hasZodFastifySchemaValidationErrors(error)) {
		request.log.warn({ validation: error.validation }, "Validation error");

		return reply.status(400).send({
			statusCode: 400,
			error: "VALIDATION_ERROR",
			message: error.message,
			errorCode: 9000,
			details: error.validation,
		});
	}

	request.log.error(error, "Unhandled error");

	return reply.status(500).send({
		statusCode: 500,
		error: "INTERNAL_SERVER_ERROR",
		message: "An unexpected error occurred",
		errorCode: 9999,
	});
};
