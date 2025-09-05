import { mutation } from '../../_generated/server';
import { zCustomMutation, zid } from 'convex-helpers/server/zod';
import { NoOp } from 'convex-helpers/server/customFunctions';
import { ProductPropsSchema } from '../../../lib/modules/spm/domain/ProductDTO';
import { z } from 'zod';

/**
 * Command mutations for Product entity
 * Write operations following SPM architecture patterns
 */

// Create custom mutation builder with NoOp modifier (TODO: replace with requireJWTModifier for auth)
const zMutation = zCustomMutation(mutation, NoOp);

export const create = zMutation({
	args: ProductPropsSchema,
	handler: async (ctx, args) => {
		return await ctx.db.insert('products', args);
	}
});

export const updateById = zMutation({
	args: z.object({
		id: zid('products'),
		updates: ProductPropsSchema.partial()
	}),
	handler: async (ctx, args) => {
		const product = await ctx.db.get(args.id);
		if (!product) {
			throw new Error(`Product with id ${args.id} not found`);
		}

		return await ctx.db.patch(args.id, args.updates);
	}
});

export const deleteById = zMutation({
	args: z.object({
		id: zid('products')
	}),
	handler: async (ctx, args) => {
		const product = await ctx.db.get(args.id);
		if (!product) {
			throw new Error(`Product with id ${args.id} not found`);
		}

		return await ctx.db.delete(args.id);
	}
});

export const updatePrice = zMutation({
	args: z.object({
		id: zid('products'),
		price: z.number().min(0, 'Price must be non-negative')
	}),
	handler: async (ctx, args) => {
		const product = await ctx.db.get(args.id);
		if (!product) {
			throw new Error(`Product with id ${args.id} not found`);
		}

		return await ctx.db.patch(args.id, {
			price: args.price
		});
	}
});

export const bulkUpdateTaxonomy = zMutation({
	args: z.object({
		oldTaxonomyNodeId: z.string().min(1),
		newTaxonomyNodeId: z.string().min(1)
	}),
	handler: async (ctx, args) => {
		const products = await ctx.db
			.query('products')
			.filter((q) => q.eq(q.field('taxonomyNodeId'), args.oldTaxonomyNodeId))
			.collect();

		if (products.length === 0) {
			return {
				updated: 0,
				message: `No products found with taxonomy node '${args.oldTaxonomyNodeId}'`
			};
		}

		const updatePromises = products.map((product) =>
			ctx.db.patch(product._id, { taxonomyNodeId: args.newTaxonomyNodeId })
		);

		await Promise.all(updatePromises);
		return {
			updated: products.length,
			message: `Updated ${products.length} products to new taxonomy node`
		};
	}
});

export const updateByIdFull = zMutation({
	args: z.object({
		id: zid('products'),
		data: ProductPropsSchema
	}),
	handler: async (ctx, args) => {
		const product = await ctx.db.get(args.id);
		if (!product) {
			throw new Error(`Product with id ${args.id} not found`);
		}

		return await ctx.db.replace(args.id, args.data);
	}
});
