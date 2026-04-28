import { eq } from "drizzle-orm";
import type { Database } from "../lib/db/client.js";
import { users } from "../lib/db/schema/users.js";
import { UserErrors } from "../lib/errors/errors.js";

export const getUserById = async (db: Database, userId: string) => {
	const [user] = await db.select().from(users).where(eq(users.id, userId));

	if (!user) {
		throw UserErrors.NOT_FOUND;
	}

	return user;
};
