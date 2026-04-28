import { describe, expect, it } from "vitest";
import {
	clampLimit,
	DEFAULT_LIMIT,
	decodeCursor,
	encodeCursor,
	MAX_LIMIT,
} from "./cursor.js";

describe("encodeCursor / decodeCursor", () => {
	it("round-trips a date and id", () => {
		const date = new Date("2026-04-25T10:30:00.000Z");
		const id = "550e8400-e29b-41d4-a716-446655440000";

		const cursor = encodeCursor(date, id);
		const decoded = decodeCursor(cursor);

		expect(decoded.date.toISOString()).toBe(date.toISOString());
		expect(decoded.id).toBe(id);
	});

	it("produces a base64url string without padding", () => {
		const cursor = encodeCursor(new Date(), "abc");
		expect(cursor).toMatch(/^[A-Za-z0-9_-]+$/);
	});

	it("throws INVALID_CURSOR for garbage input", () => {
		expect(() => decodeCursor("not-valid")).toThrow();
		expect(() => decodeCursor("not-valid")).toThrowError(/Invalid cursor/);
	});

	it("throws INVALID_CURSOR for missing separator", () => {
		const cursor = Buffer.from("no-separator").toString("base64url");
		expect(() => decodeCursor(cursor)).toThrowError(/Invalid cursor/);
	});

	it("throws INVALID_CURSOR for invalid date", () => {
		const cursor = Buffer.from("not-a-date|some-id").toString("base64url");
		expect(() => decodeCursor(cursor)).toThrowError(/Invalid cursor/);
	});

	it("throws INVALID_CURSOR for missing id", () => {
		const cursor = Buffer.from("2026-04-25T10:30:00.000Z|").toString(
			"base64url",
		);
		expect(() => decodeCursor(cursor)).toThrowError(/Invalid cursor/);
	});
});

describe("clampLimit", () => {
	it("returns DEFAULT_LIMIT when undefined", () => {
		expect(clampLimit(undefined)).toBe(DEFAULT_LIMIT);
	});

	it("clamps to 1 when below minimum", () => {
		expect(clampLimit(0)).toBe(1);
		expect(clampLimit(-5)).toBe(1);
	});

	it("clamps to MAX_LIMIT when above maximum", () => {
		expect(clampLimit(100)).toBe(MAX_LIMIT);
	});

	it("returns the value when within range", () => {
		expect(clampLimit(10)).toBe(10);
	});
});
