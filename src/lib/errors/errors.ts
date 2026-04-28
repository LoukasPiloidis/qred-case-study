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

export const UserErrors = {
	NOT_FOUND: new AppError(404, "User not found", 3001),
	UNAUTORIZED: new AppError(401, "Unauthorized", 3002),
} as const;

export const InvoiceErrors = {
	USER_NOT_FOUND: new AppError(404, "User not found", 4001),
} as const;
