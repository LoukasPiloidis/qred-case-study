import { describe, expect, it } from "vitest";
import { transactions } from "../lib/db/schema/transactions.js";
import {
	createCard,
	createInvoice,
	createTransaction,
	createUser,
} from "../test/factories.js";
import { useTestDb } from "../test/setup.js";
import { getDashboardByUserId } from "./dashboard.service.js";

describe("getDashboardByUserId", () => {
	const getDb = useTestDb();

	it("returns user, card, invoices, and transactions", async () => {
		const user = await createUser(getDb());
		const card = await createCard(getDb(), {
			userId: user.id,
			currentSpend: 540000,
			status: "active",
		});

		await createInvoice(getDb(), { userId: user.id });
		await createTransaction(getDb(), {
			userId: user.id,
			cardId: card.id,
			description: "Coffee shop",
			amount: -4500,
			category: "food",
			date: new Date("2025-06-10"),
		});

		const result = await getDashboardByUserId(getDb(), user.id);

		expect(result.user.id).toBe(user.id);
		expect(result.card.id).toBe(card.id);
		expect(result.invoiceData.invoices).toHaveLength(1);
		expect(result.transactionData.rows).toHaveLength(1);
	});

	it("limits transactions to 3", async () => {
		const user = await createUser(getDb());
		const card = await createCard(getDb(), {
			userId: user.id,
			status: "active",
		});

		const txValues = Array.from({ length: 5 }, (_, i) => ({
			userId: user.id,
			cardId: card.id,
			description: `Transaction ${i}`,
			amount: -1000 * (i + 1),
			currency: "SEK",
			date: new Date(`2025-06-${10 + i}`),
			category: "food",
		}));

		await getDb().insert(transactions).values(txValues);

		const result = await getDashboardByUserId(getDb(), user.id);

		expect(result.transactionData.rows).toHaveLength(3);
		expect(result.transactionData.remainingCount).toBe(2);
	});

	it("throws when user does not exist", async () => {
		const fakeId = "550e8400-e29b-41d4-a716-446655440000";

		await expect(getDashboardByUserId(getDb(), fakeId)).rejects.toMatchObject({
			errorCode: 3001,
		});
	});

	it("throws when user has no card", async () => {
		const user = await createUser(getDb());

		await expect(getDashboardByUserId(getDb(), user.id)).rejects.toMatchObject({
			errorCode: 1001,
		});
	});
});
