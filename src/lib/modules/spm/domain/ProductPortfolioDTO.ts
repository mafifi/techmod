import { z } from 'zod';

export const ProductPortfolioPropsSchema = z.object({
	name: z.string().min(2).max(100),
	description: z.string().min(10).max(500),
	isActive: z.boolean().default(true),
	parentId: z.string().nullable().default(null) // null for top-level portfolios
});

export const ProductPortfolioSchema = ProductPortfolioPropsSchema.extend({
	_id: z.string(),
	_creationTime: z.number().optional() // Convex adds this
});

export type ProductPortfolioProps = z.infer<typeof ProductPortfolioPropsSchema>;
export type ProductPortfolio = z.infer<typeof ProductPortfolioSchema>;
