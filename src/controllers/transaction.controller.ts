import type { FastifyReply, FastifyRequest } from "fastify";
import { toTransactionsResponse } from "../serializers/transaction.serializer.js";
import { getTransactionsByUserId } from "../services/transaction.service.js";

export const getTransactionsController = async (
	request: FastifyRequest<{
		Querystring: { limit?: number; cursor?: string };
	}>,
	reply: FastifyReply,
) => {
	const { userId } = request;
	const { limit, cursor } = request.query;

	request.log.info({ userId, limit, cursor }, "Fetching transactions");

	const { rows, remainingCount } = await getTransactionsByUserId(
		request.server.db,
		userId,
		{ limit, cursor },
	);
	const response = toTransactionsResponse(rows, remainingCount);

	return reply.send(response);
};
