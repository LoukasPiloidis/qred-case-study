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
