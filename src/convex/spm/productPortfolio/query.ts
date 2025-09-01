import { query } from '../../_generated/server';
import { zCustomQuery, zid } from 'convex-helpers/server/zod';
import { NoOp } from 'convex-helpers/server/customFunctions';
import { z } from 'zod';

/**
 * Storage queries for ProductPortfolio entity
 * Read-only operations following SPM architecture patterns
 */

// Create custom query builder with NoOp modifier (no authentication required for reads)
const zQuery = zCustomQuery(query, NoOp);

export const getAll = zQuery({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('productPortfolios').collect();
	}
});

export const listActive = zQuery({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query('productPortfolios')
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect();
	}
});

export const getById = zQuery({
	args: {
		id: zid('productPortfolios')
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

export const getByName = zQuery({
	args: {
		name: z.string()
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('productPortfolios')
			.filter((q) => q.eq(q.field('name'), args.name))
			.first();
	}
});
