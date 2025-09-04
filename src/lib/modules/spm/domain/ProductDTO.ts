import { z } from 'zod';

export const ProductPropsSchema = z.object({
	name: z.string().min(2).max(100),
	description: z.string().max(500).optional(),
	price: z.number().min(0),
	category: z.string().min(2).max(100),
	taxonomyNodeId: z.string() // References unified taxonomy node (portfolio/line/category)
});

export const ProductSchema = ProductPropsSchema.extend({
	_id: z.string(),
	_creationTime: z.number().optional() // Convex adds this
});

export type ProductProps = z.infer<typeof ProductPropsSchema>;
export type Product = z.infer<typeof ProductSchema>;

export function getProductDefaults(): ProductProps {
	return {
		name: '',
		description: '',
		price: 0,
		category: '',
		taxonomyNodeId: ''
	};
}
