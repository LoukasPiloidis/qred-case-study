import type { users } from "../lib/db/schema/users.js";

type UserRow = typeof users.$inferSelect;

export const toUserResponse = (user: UserRow) => ({
	id: user.id,
	companyName: user.companyName,
	email: user.email,
	createdAt: user.createdAt.toISOString(),
});

export type UserResponse = ReturnType<typeof toUserResponse>;
