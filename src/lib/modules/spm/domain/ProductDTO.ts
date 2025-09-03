import { z } from 'zod';

// Define enum for Modernity choices
export const ModernityEnum = z.enum(['Migrate', 'Hold', 'Continue', 'Adopt', 'Assess']);

export const ProductPropsSchema = z.object({
	// Core product information
	name: z.string().min(2).max(100),
	owningSuperDepartment: z.string().min(1).max(100),
	productOwner: z.string().min(1).max(100),
	eonids: z.string().max(500),
	productOverview: z.string().max(1000),
	productRelatedLinks: z.string().max(500),
	productType: z.string().min(1).max(100),
	modernity: ModernityEnum,
	lifecycleStatus: z.string().min(1).max(100),
	fleet: z.string().min(1).max(100),
	squad: z.string().min(1).max(100),
	roadmapLink: z.string().max(500),

	// Legacy fields for backward compatibility (now optional)
	description: z.string().max(500).optional(),
	price: z.number().min(0).optional(),
	category: z.string().min(2).max(100).optional(),
	department: z.string().min(2).max(100).optional(),
	superDepartment: z.string().min(2).max(100).optional(),
	pdr: z.string().url().optional(),
	businessCriticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
	lifecycleStage: z.enum(['PLAN', 'BUILD', 'RUN', 'RETIRE']).optional(),
	lastAssessmentDate: z.number().optional(),
	nextReviewDate: z.number().optional(),

	// New field from main branch
	productPortfolioId: z.string().optional()
});

export const ProductSchema = ProductPropsSchema.extend({
	_id: z.string(),
	_creationTime: z.number().optional() // Convex adds this
});

export type ProductProps = z.infer<typeof ProductPropsSchema>;
export type Product = z.infer<typeof ProductSchema>;
