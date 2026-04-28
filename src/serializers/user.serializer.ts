import { z } from "zod";
import type { users } from "../lib/db/schema/users.js";

type UserRow = typeof users.$inferSelect;

export const userResponseSchema = z.object({
	id: z.uuid(),
	companyName: z.string(),
	email: z.email(),
	createdAt: z.iso.datetime(),
});

export const toUserResponse = (user: UserRow) => ({
	id: user.id,
	companyName: user.companyName,
	email: user.email,
	createdAt: user.createdAt.toISOString(),
});

export type UserResponse = ReturnType<typeof toUserResponse>;
