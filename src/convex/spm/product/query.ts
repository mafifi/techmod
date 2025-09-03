import { query } from '../../_generated/server';
import { zCustomQuery, zid } from 'convex-helpers/server/zod';
import { NoOp } from 'convex-helpers/server/customFunctions';
import { z } from 'zod';

/**
 * Storage queries for Product entity
 * Read-only operations following SPM architecture patterns
 */

// Create custom query builder with NoOp modifier (no authentication required for reads)
const zQuery = zCustomQuery(query, NoOp);

export const getAll = zQuery({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('products').collect();
	}
});

export const getById = zQuery({
	args: {
		id: zid('products')
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

export const getByCategory = zQuery({
	args: {
		category: z.string().min(1).max(100)
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('products')
			.filter((q) => q.eq(q.field('category'), args.category))
			.collect();
	}
});

export const getInPriceRange = zQuery({
	args: {
		minPrice: z.number().min(0),
		maxPrice: z.number().min(0)
	},
	handler: async (ctx, args) => {
		// Validate that minPrice <= maxPrice
		if (args.minPrice > args.maxPrice) {
			throw new Error('Minimum price cannot be greater than maximum price');
		}

		return await ctx.db
			.query('products')
			.filter((q) =>
				q.and(q.gte(q.field('price'), args.minPrice), q.lte(q.field('price'), args.maxPrice))
			)
			.collect();
	}
});

export const search = zQuery({
	args: {
		searchTerm: z.string().min(1).max(100)
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('products')
			.filter((q) =>
				q.or(
					q.eq(q.field('name'), args.searchTerm),
					q.eq(q.field('description'), args.searchTerm),
					q.eq(q.field('category'), args.searchTerm)
				)
			)
			.collect();
	}
});
