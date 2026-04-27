import { defineConfig } from "vitest/config";

export const config = defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.test.ts"],
	},
});

export default config;
