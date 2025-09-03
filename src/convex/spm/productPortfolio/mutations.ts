import { mutation } from '../../_generated/server';
import { zCustomMutation, zid } from 'convex-helpers/server/zod';
import { NoOp } from 'convex-helpers/server/customFunctions';
import { ProductPortfolioPropsSchema } from '../../../lib/modules/spm/domain/ProductPortfolioDTO';
import { z } from 'zod';

/**
 * Command mutations for ProductPortfolio entity
 * Write operations following SPM architecture patterns
 */

// Create custom mutation builder with NoOp modifier (TODO: replace with requireJWTModifier for auth)
const zMutation = zCustomMutation(mutation, NoOp);

export const create = zMutation({
	args: ProductPortfolioPropsSchema,
	handler: async (ctx, args) => {
		return await ctx.db.insert('productPortfolios', args);
	}
});

export const update = zMutation({
	args: z
		.object({
			id: zid('productPortfolios')
		})
		.merge(ProductPortfolioPropsSchema.partial()),
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		return await ctx.db.patch(id, updates);
	}
});

export const remove = zMutation({
	args: {
		id: zid('productPortfolios')
	},
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.id);
	}
});

export const activate = zMutation({
	args: {
		id: zid('productPortfolios')
	},
	handler: async (ctx, args) => {
		return await ctx.db.patch(args.id, { isActive: true });
	}
});

export const deactivate = zMutation({
	args: {
		id: zid('productPortfolios')
	},
	handler: async (ctx, args) => {
		return await ctx.db.patch(args.id, { isActive: false });
	}
});
