export class AppError extends Error {
	readonly statusCode: number;
	readonly errorCode: number;

	constructor(statusCode: number, message: string, errorCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		this.name = "AppError";
	}
}

export const UserErrors = Object.freeze({
	NOT_FOUND: Object.freeze(new AppError(404, "User not found", 3001)),
	UNAUTHORIZED: Object.freeze(new AppError(401, "Unauthorized", 3002)),
});

export const InvoiceErrors = Object.freeze({
	USER_NOT_FOUND: Object.freeze(new AppError(404, "User not found", 4001)),
});

export const CardErrors = Object.freeze({
	NOT_FOUND: Object.freeze(new AppError(404, "Card not found", 1001)),
	ALREADY_ACTIVE: Object.freeze(
		new AppError(409, "Card is already active", 1002),
	),
	EXPIRED: Object.freeze(new AppError(400, "Card has expired", 1003)),
	BLOCKED: Object.freeze(new AppError(403, "Card is blocked", 1004)),
});
