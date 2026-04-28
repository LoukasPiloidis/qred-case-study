import type { FastifyReply, FastifyRequest } from "fastify";
import { toDashboardResponse } from "../serializers/dashboard.serializer.js";
import { getDashboardByUserId } from "../services/dashboard.service.js";

export const getDashboardController = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const { userId } = request;

	request.log.info({ userId }, "Fetching dashboard");

	const data = await getDashboardByUserId(request.server.db, userId);
	const response = toDashboardResponse(data);

	return reply.send(response);
};
