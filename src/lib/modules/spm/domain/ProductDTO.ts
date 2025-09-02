import { z } from 'zod';

export const ProductPropsSchema = z.object({
	// Existing fields
	name: z.string().min(2).max(100),
	description: z.string().max(500).optional(),
	price: z.number().min(0),
	category: z.string().min(2).max(100),

	// Organizational fields
	productOwner: z.string().min(2).max(100),
	department: z.string().min(2).max(100),
	superDepartment: z.string().min(2).max(100),

	// Portfolio management fields
	modernity: z.enum(['LEGACY', 'TRANSITIONAL', 'MODERN', 'CUTTING_EDGE']),
	pdr: z.string().url().optional(), // Portfolio Decision Record - web link

	// Enhanced metadata
	businessCriticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
	lifecycleStage: z.enum(['PLAN', 'BUILD', 'RUN', 'RETIRE']).optional(),
	lastAssessmentDate: z.number().optional(), // Unix timestamp
	nextReviewDate: z.number().optional() // Unix timestamp
});

export const ProductSchema = ProductPropsSchema.extend({
	_id: z.string(),
	_creationTime: z.number().optional() // Convex adds this
});

export type ProductProps = z.infer<typeof ProductPropsSchema>;
export type Product = z.infer<typeof ProductSchema>;
