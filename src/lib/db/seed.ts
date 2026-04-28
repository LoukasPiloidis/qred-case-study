import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { cards, invoices, transactions, users } from "./schema/index.js";

const USER_ID = "cac45c3f-be23-429e-8ccf-3f3f4d45521a";

const MERCHANTS = [
	{
		description: "Office Supplies AB",
		category: "supplies",
		min: 5000,
		max: 25000,
	},
	{
		description: "Cloud Services Inc",
		category: "software",
		min: 50000,
		max: 300000,
	},
	{
		description: "Business Lunch AB",
		category: "meals",
		min: 15000,
		max: 85000,
	},
	{
		description: "Stockholm Taxi",
		category: "transport",
		min: 8000,
		max: 35000,
	},
	{ description: "Pressbyrån", category: "meals", min: 3000, max: 12000 },
	{
		description: "Adobe Creative Cloud",
		category: "software",
		min: 60000,
		max: 60000,
	},
	{
		description: "IKEA Business",
		category: "supplies",
		min: 20000,
		max: 150000,
	},
	{
		description: "Scandic Hotels",
		category: "travel",
		min: 100000,
		max: 250000,
	},
	{ description: "SJ Rail", category: "transport", min: 15000, max: 45000 },
	{ description: "Coop Kontor", category: "supplies", min: 5000, max: 30000 },
	{ description: "Wolt Business", category: "meals", min: 10000, max: 40000 },
	{
		description: "GitHub Enterprise",
		category: "software",
		min: 90000,
		max: 90000,
	},
	{
		description: "Circle K Fuel",
		category: "transport",
		min: 30000,
		max: 80000,
	},
	{ description: "Espresso House", category: "meals", min: 4000, max: 10000 },
	{
		description: "PostNord Shipping",
		category: "supplies",
		min: 8000,
		max: 20000,
	},
];

const generateTransactions = (cardId: string, count: number) => {
	const result = [];
	const startDate = new Date("2026-04-25T10:30:00Z");

	for (let i = 0; i < count; i++) {
		const merchant = MERCHANTS[i % MERCHANTS.length];
		const date = new Date(startDate.getTime() - i * 12 * 60 * 60 * 1000); // ~12h apart
		const amount =
			merchant.min === merchant.max
				? merchant.min
				: merchant.min +
					Math.floor(Math.random() * (merchant.max - merchant.min));

		result.push({
			userId: USER_ID,
			cardId,
			description: merchant.description,
			amount,
			category: merchant.category,
			date,
		});
	}

	return result;
};

const seed = async () => {
	await db.delete(transactions);
	await db.delete(cards);
	await db.delete(invoices);
	await db.delete(users);

	await db
		.insert(users)
		.values({
			id: USER_ID,
			companyName: "Acme Corp",
			email: "test@acme.com",
		})
		.onConflictDoNothing();

	await db.insert(invoices).values([
		{
			userId: USER_ID,
			amount: 10000,
			dueDate: new Date("2025-01-01"),
			status: "paid",
		},
		{
			userId: USER_ID,
			amount: 25000,
			dueDate: new Date("2024-12-01"),
			status: "overdue",
		},
		{
			userId: USER_ID,
			amount: 15000,
			dueDate: new Date("2026-06-01"),
			status: "pending",
		},
	]);

	await db.insert(cards).values({
		userId: USER_ID,
		lastFourDigits: "4567",
		status: "active",
		spendingLimit: 1000000,
		currentSpend: 540000,
		expiryDate: new Date("2027-12-31"),
	});

	const [card] = await db
		.select({ id: cards.id })
		.from(cards)
		.where(eq(cards.userId, USER_ID));

	const txns = generateTransactions(card.id, 57);
	await db.insert(transactions).values(txns);

	console.log(
		`Seeded user ${USER_ID} with 3 invoices, 1 card, and 57 transactions`,
	);
	process.exit(0);
};

seed();
