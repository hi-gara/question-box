import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const questions = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/questions",
	}),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		published: z.boolean().default(false),
	}),
});

export const collections = {
	questions,
};