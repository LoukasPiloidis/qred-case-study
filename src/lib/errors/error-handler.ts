import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./app-error.js";

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

	request.log.error(error, "Unhandled error");

	return reply.status(500).send({
		statusCode: 500,
		error: "INTERNAL_SERVER_ERROR",
		message: "An unexpected error occurred",
		errorCode: 9999,
	});
};
