import { z } from 'zod';

// Taxonomy node types for the unified hierarchy
export const TaxonomyNodeType = z.enum(['portfolio', 'line', 'category']);

export const TaxonomyNodePropsSchema = z.object({
	// Core identity fields
	name: z.string().min(2).max(100),
	description: z.string().min(10).max(1000),
	
	// Type discrimination for the unified hierarchy
	type: TaxonomyNodeType,
	
	// Optional strategy field (applicable to all levels)
	strategy: z.string().min(5).max(2000).optional(),
	
	// Hierarchy relationship - null for top-level portfolios (required for portfolios)
	parentId: z.string().nullable().default(null),
	
	// Audit trail fields
	createdBy: z.string(),
	updatedBy: z.string(),
	lastModified: z.number(), // timestamp
	changeHistory: z
		.array(
			z.object({
				timestamp: z.number(),
				updatedBy: z.string(),
				changes: z.record(z.any()), // field changes as key-value pairs
				reason: z.string().optional()
			})
		)
		.default([]),
	
	// Status tracking
	isActive: z.boolean().default(true),
	version: z.number().default(1)
});

export const TaxonomyNodeSchema = TaxonomyNodePropsSchema.extend({
	_id: z.string(),
	_creationTime: z.number().optional() // Convex adds this
});

export type TaxonomyNodeType = z.infer<typeof TaxonomyNodeType>;
export type TaxonomyNodeProps = z.infer<typeof TaxonomyNodePropsSchema>;
export type TaxonomyNode = z.infer<typeof TaxonomyNodeSchema>;

// Type-specific schemas for validation
export const PortfolioPropsSchema = TaxonomyNodePropsSchema.extend({
	type: z.literal('portfolio'),
	parentId: z.null() // Portfolios must always be top-level with null parent
});

export const LinePropsSchema = TaxonomyNodePropsSchema.extend({
	type: z.literal('line'),
	parentId: z.string() // Must reference a portfolio (cannot be null)
});

export const CategoryPropsSchema = TaxonomyNodePropsSchema.extend({
	type: z.literal('category'),
	parentId: z.string() // Must reference a line (cannot be null)
});

export type PortfolioProps = z.infer<typeof PortfolioPropsSchema>;
export type LineProps = z.infer<typeof LinePropsSchema>;
export type CategoryProps = z.infer<typeof CategoryPropsSchema>;

// Change history entry schema for type safety
export const ChangeHistoryEntrySchema = z.object({
	timestamp: z.number(),
	updatedBy: z.string(),
	changes: z.record(z.any()),
	reason: z.string().optional()
});

export type ChangeHistoryEntry = z.infer<typeof ChangeHistoryEntrySchema>;