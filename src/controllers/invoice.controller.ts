import type { FastifyReply, FastifyRequest } from "fastify";
import { toInvoicesResponse } from "../serializers/invoice.serializer.js";
import { getInvoicesByUserId } from "../services/invoice.service.js";

export const getInvoicesController = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const { userId } = request;

	request.log.info({ userId }, "Fetching invoices");

	const result = await getInvoicesByUserId(request.server.db, userId);
	const response = toInvoicesResponse(result);

	return reply.send(response);
};
