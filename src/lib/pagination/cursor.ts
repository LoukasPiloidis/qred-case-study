import { AppError, CursorErrors } from "../errors/errors.js";

export type DecodedCursor = {
	date: Date;
	id: string;
};

export const encodeCursor = (date: Date, id: string): string =>
	Buffer.from(`${date.toISOString()}|${id}`).toString("base64url");

export const decodeCursor = (cursor: string): DecodedCursor => {
	try {
		const decoded = Buffer.from(cursor, "base64url").toString();
		const separatorIndex = decoded.indexOf("|");

		if (separatorIndex === -1) {
			throw CursorErrors.INVALID_CURSOR;
		}

		const dateStr = decoded.slice(0, separatorIndex);
		const id = decoded.slice(separatorIndex + 1);
		const date = new Date(dateStr);

		if (Number.isNaN(date.getTime()) || !id) {
			throw CursorErrors.INVALID_CURSOR;
		}

		return { date, id };
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}

		throw CursorErrors.INVALID_CURSOR;
	}
};

export const DEFAULT_LIMIT = 3;
export const MAX_LIMIT = 50;

export const clampLimit = (limit: number | undefined): number => {
	return Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
};
