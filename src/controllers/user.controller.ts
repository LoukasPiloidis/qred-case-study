import type { FastifyReply, FastifyRequest } from "fastify";
import { toUserResponse } from "../serializers/user.serializer.js";
import { getUserById } from "../services/user.service.js";

export const getUserController = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const { userId } = request;

	request.log.info({ userId }, "Fetching user");

	const user = await getUserById(request.server.db, userId);
	const response = toUserResponse(user);

	return reply.send(response);
};
