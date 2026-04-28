import { eq } from "drizzle-orm";
import type { Database } from "../lib/db/client.js";
import { cards } from "../lib/db/schema/cards.js";
import { CardErrors } from "../lib/errors/errors.js";

export const getCardByUserId = async (db: Database, userId: string) => {
	const [card] = await db.select().from(cards).where(eq(cards.userId, userId));

	if (!card) {
		throw CardErrors.NOT_FOUND;
	}

	return card;
};

export const activateCard = async (db: Database, userId: string) => {
	const card = await getCardByUserId(db, userId);

	if (card.status === "active") {
		throw CardErrors.ALREADY_ACTIVE;
	}

	if (card.status === "blocked") {
		throw CardErrors.BLOCKED;
	}

	if (card.expiryDate <= new Date()) {
		throw CardErrors.EXPIRED;
	}

	const [updated] = await db
		.update(cards)
		.set({ status: "active" })
		.where(eq(cards.id, card.id))
		.returning();

	return updated;
};
