import type { FastifyReply, FastifyRequest } from "fastify";
import { toTransactionsResponse } from "../serializers/transaction.serializer.js";
import { getTransactionsByUserId } from "../services/transaction.service.js";

export const getTransactionsController = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const { userId } = request;

	request.log.info({ userId }, "Fetching transactions");

	const rows = await getTransactionsByUserId(request.server.db, userId);
	const response = toTransactionsResponse(rows);

	return reply.send(response);
};
