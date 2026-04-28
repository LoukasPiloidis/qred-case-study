import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, afterEach, beforeAll } from "vitest";
import type { Database } from "../lib/db/client.js";
import * as schema from "../lib/db/schema/index.js";

export const useTestDb = () => {
	let client: PGlite;
	let db: Database;

	beforeAll(async () => {
		client = new PGlite();
		const pgliteDb = drizzle(client, { schema });
		await migrate(pgliteDb, { migrationsFolder: "./drizzle" });
		db = pgliteDb;
	});

	afterEach(async () => {
		await db.delete(schema.transactions);
		await db.delete(schema.cards);
		await db.delete(schema.invoices);
		await db.delete(schema.users);
	});

	afterAll(async () => {
		await client.close();
	});

	return () => db;
};
