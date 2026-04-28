import type { FastifyReply, FastifyRequest } from "fastify";
import { toCardResponse } from "../serializers/card.serializer.js";
import { activateCard, getCardByUserId } from "../services/card.service.js";

export const getCardController = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const { userId } = request;

	request.log.info({ userId }, "Fetching card");

	const card = await getCardByUserId(request.server.db, userId);
	const response = toCardResponse(card);

	return reply.send(response);
};

export const activateCardController = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const { userId } = request;

	request.log.info({ userId }, "Activating card");

	const card = await activateCard(request.server.db, userId);
	const response = toCardResponse(card);

	return reply.send(response);
};
