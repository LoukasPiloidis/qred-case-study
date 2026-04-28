import { and, count, desc, eq, lt, or, type SQL } from "drizzle-orm";
import type { Database } from "../lib/db/client.js";
import { transactions } from "../lib/db/schema/transactions.js";
import {
	clampLimit,
	type DecodedCursor,
	decodeCursor,
} from "../lib/pagination/cursor.js";

type PaginationParams = {
	limit?: number;
	cursor?: string;
};

export const getTransactionsByUserId = async (
	db: Database,
	userId: string,
	params: PaginationParams = {},
) => {
	const limit = clampLimit(params.limit);
	let decoded: DecodedCursor | undefined;

	if (params.cursor) {
		decoded = decodeCursor(params.cursor);
	}

	const baseCondition = eq(transactions.userId, userId);

	let cursorCondition: SQL | undefined;
	let where: SQL | undefined = baseCondition;

	if (decoded) {
		cursorCondition = or(
			lt(transactions.date, decoded.date),
			and(eq(transactions.date, decoded.date), lt(transactions.id, decoded.id)),
		);
	}

	if (cursorCondition) {
		where = and(baseCondition, cursorCondition);
	}

	const rows = await db
		.select()
		.from(transactions)
		.where(where)
		.orderBy(desc(transactions.date), desc(transactions.id))
		.limit(limit);

	const [{ matchingCount }] = await db
		.select({ matchingCount: count() })
		.from(transactions)
		.where(where);

	const remainingCount = matchingCount - rows.length;

	return { rows, remainingCount };
};
