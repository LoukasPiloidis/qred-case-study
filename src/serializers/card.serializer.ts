import { z } from "zod";
import type { cards } from "../lib/db/schema/cards.js";

type CardRow = typeof cards.$inferSelect;

const formatOere = (oere: number) => {
	const kr = Math.floor(oere / 100);
	return kr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const remainingSpendSchema = z.object({
	current: z.number().int(),
	limit: z.number().int(),
	currency: z.string(),
	formatted: z.string(),
});

export const cardResponseSchema = z.object({
	id: z.uuid(),
	lastFourDigits: z.string(),
	status: z.enum(["inactive", "active", "blocked"]),
	remainingSpend: remainingSpendSchema,
	expiryDate: z.iso.datetime(),
	createdAt: z.iso.datetime(),
});

export const toCardResponse = (card: CardRow) => {
	const remaining = card.spendingLimit - card.currentSpend;
	return {
		id: card.id,
		lastFourDigits: card.lastFourDigits,
		status: card.status,
		remainingSpend: {
			current: card.currentSpend,
			limit: card.spendingLimit,
			currency: "SEK",
			formatted: `${formatOere(remaining)}/${formatOere(card.spendingLimit)} kr`,
		},
		expiryDate: card.expiryDate.toISOString(),
		createdAt: card.createdAt.toISOString(),
	};
};

export type CardResponse = ReturnType<typeof toCardResponse>;
