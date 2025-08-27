import { z } from 'zod';

export const ProductPropsSchema = z.object({
	name: z.string().min(2).max(100),
	description: z.string().max(500).optional(),
	price: z.number().min(0),
	category: z.string().min(2).max(100),
});

export const ProductSchema = ProductPropsSchema.extend({
	_id: z.string(),
	_creationTime: z.number().optional(), // Convex adds this
});

export type ProductProps = z.infer<typeof ProductPropsSchema>;
export type Product = z.infer<typeof ProductSchema>;