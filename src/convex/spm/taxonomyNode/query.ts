/* eslint-disable @typescript-eslint/no-explicit-any */

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { QueryCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import type { TaxonomyNodeType } from '../../../lib/modules/spm/domain/TaxonomyNodeDTO';

interface TaxonomyNode extends Doc<'taxonomyNodes'> {
	_id: Id<'taxonomyNodes'>;
	name: string;
	type: TaxonomyNodeType;
	// Doc<'taxonomyNodes'> allows parentId to be undefined; accept undefined as well
	parentId?: Id<'taxonomyNodes'> | null;
	lastModified: number;
	isActive: boolean;
	description: string;
}

interface TaxonomyHierarchyNode extends TaxonomyNode {
	children: TaxonomyHierarchyNode[];
}

// Type-specific queries
export const getPortfolios = query({
	args: { activeOnly: v.optional(v.boolean()) },
	handler: async (ctx: QueryCtx, args: { activeOnly?: boolean }) => {
		const { activeOnly = true } = args;

		let q = ctx.db.query('taxonomyNodes').withIndex('by_type', (q) => q.eq('type', 'portfolio'));

		if (activeOnly) {
			q = q.filter((q) => q.eq(q.field('isActive'), true));
		}

		return await q.collect();
	}
});

export const getLines = query({
	args: {
		portfolioId: v.optional(v.id('taxonomyNodes')),
		activeOnly: v.optional(v.boolean())
	},
	handler: async (
		ctx: QueryCtx,
		args: { portfolioId?: Id<'taxonomyNodes'>; activeOnly?: boolean }
	) => {
		const { portfolioId, activeOnly = true } = args;

		let q = ctx.db.query('taxonomyNodes').withIndex('by_type', (q) => q.eq('type', 'line'));

		if (portfolioId) {
			q = q.filter((q) => q.eq(q.field('parentId'), portfolioId));
		}

		if (activeOnly) {
			q = q.filter((q) => q.eq(q.field('isActive'), true));
		}

		return await q.collect();
	}
});

export const getCategories = query({
	args: {
		lineId: v.optional(v.id('taxonomyNodes')),
		activeOnly: v.optional(v.boolean())
	},
	handler: async (ctx: QueryCtx, args: { lineId?: Id<'taxonomyNodes'>; activeOnly?: boolean }) => {
		const { lineId, activeOnly = true } = args;

		let q = ctx.db.query('taxonomyNodes').withIndex('by_type', (q) => q.eq('type', 'category'));

		if (lineId) {
			q = q.filter((q) => q.eq(q.field('parentId'), lineId));
		}

		if (activeOnly) {
			q = q.filter((q) => q.eq(q.field('isActive'), true));
		}

		return await q.collect();
	}
});

// Hierarchy queries
export const getChildren = query({
	args: {
		parentId: v.id('taxonomyNodes'),
		type: v.optional(v.union(v.literal('portfolio'), v.literal('line'), v.literal('category'))),
		activeOnly: v.optional(v.boolean())
	},
	handler: async (
		ctx: QueryCtx,
		args: {
			parentId: Id<'taxonomyNodes'>;
			type?: 'portfolio' | 'line' | 'category';
			activeOnly?: boolean;
		}
	) => {
		const { parentId, type, activeOnly = true } = args;

		let q = ctx.db.query('taxonomyNodes').withIndex('by_parent', (q) => q.eq('parentId', parentId));

		if (type) {
			q = q.filter((q) => q.eq(q.field('type'), type));
		}

		if (activeOnly) {
			q = q.filter((q) => q.eq(q.field('isActive'), true));
		}

		return await q.collect();
	}
});

export const getTopLevel = query({
	args: {
		activeOnly: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { activeOnly = true } = args;

		// Only portfolios can be top-level (parentId: null)
		let q = ctx.db
			.query('taxonomyNodes')
			.withIndex('by_parent', (q) => q.eq('parentId', null))
			.filter((q) => q.eq(q.field('type'), 'portfolio'));

		if (activeOnly) {
			q = q.filter((q) => q.eq(q.field('isActive'), true));
		}

		return await q.collect();
	}
});

export const getBreadcrumb = query({
	args: { nodeId: v.string() },
	handler: async (ctx, args) => {
		const { nodeId } = args;

		const breadcrumb: TaxonomyNode[] = [];
		let currentId: string | null = nodeId;

		// Walk up the hierarchy to build breadcrumb
		while (currentId) {
			const node: any = await ctx.db.get(currentId as Id<'taxonomyNodes'>);
			if (!node) break;

			breadcrumb.unshift(node as TaxonomyNode);
			currentId = node.parentId;
		}

		return breadcrumb;
	}
});

export const getFullHierarchy = query({
	args: { activeOnly: v.optional(v.boolean()) },
	handler: async (ctx, args) => {
		const { activeOnly = true } = args;

		let q = ctx.db.query('taxonomyNodes');

		if (activeOnly) {
			q = q.filter((q) => q.eq(q.field('isActive'), true));
		}

		const allNodes = await q.collect();

		// Build hierarchy tree structure
		const nodeMap = new Map();
		const rootNodes: TaxonomyHierarchyNode[] = [];

		// First pass: create node map
		allNodes.forEach((node) => {
			nodeMap.set(node._id, { ...node, children: [] });
		});

		// Second pass: build parent-child relationships
		allNodes.forEach((node) => {
			if (node.parentId && nodeMap.has(node.parentId)) {
				nodeMap.get(node.parentId).children.push(nodeMap.get(node._id));
			} else {
				rootNodes.push(nodeMap.get(node._id));
			}
		});

		return rootNodes;
	}
});

// Individual node queries
// Query to get a node by ID
export const getById = query({
	args: {
		nodeId: v.id('taxonomyNodes')
	},
	handler: async (ctx: QueryCtx, args: { nodeId: Id<'taxonomyNodes'> }) => {
		const { nodeId } = args;
		return await ctx.db.get(nodeId);
	}
});

export const getByName = query({
	args: {
		name: v.string(),
		type: v.optional(v.union(v.literal('portfolio'), v.literal('line'), v.literal('category')))
	},
	handler: async (ctx, args) => {
		const { name, type } = args;

		let q = ctx.db.query('taxonomyNodes').withIndex('by_name', (q) => q.eq('name', name));

		if (type) {
			q = q.filter((q) => q.eq(q.field('type'), type));
		}

		return await q.first();
	}
});

// Search and filter queries
export const search = query({
	args: {
		query: v.string(),
		type: v.optional(v.union(v.literal('portfolio'), v.literal('line'), v.literal('category'))),
		activeOnly: v.optional(v.boolean())
	},
	handler: async (
		ctx: QueryCtx,
		args: { query: string; type?: TaxonomyNodeType; activeOnly?: boolean }
	) => {
		const { query: searchQuery, type, activeOnly = true } = args;

		// Case-insensitive search on name and description
		const searchRegex = new RegExp(searchQuery, 'i');

		let q = ctx.db.query('taxonomyNodes');

		if (type) {
			q = q.filter((q) => q.eq(q.field('type'), type));
		}

		if (activeOnly) {
			q = q.filter((q) => q.eq(q.field('isActive'), true));
		}

		const results = await q.collect();

		return results.filter(
			(node: any) =>
				searchRegex.test(node.name) || (node.description && searchRegex.test(node.description))
		);
	}
});

// Audit-aware queries
export const getByCreator = query({
	args: {
		createdBy: v.string(),
		type: v.optional(v.union(v.literal('portfolio'), v.literal('line'), v.literal('category')))
	},
	handler: async (ctx, args) => {
		const { createdBy, type } = args;

		let q = ctx.db
			.query('taxonomyNodes')
			.withIndex('by_created_by', (q) => q.eq('createdBy', createdBy));

		if (type) {
			q = q.filter((q) => q.eq(q.field('type'), type));
		}

		return await q.collect();
	}
});

export const getRecentlyUpdated = query({
	args: {
		hoursAgo: v.optional(v.number()),
		type: v.optional(v.union(v.literal('portfolio'), v.literal('line'), v.literal('category')))
	},
	handler: async (ctx, args) => {
		const { hoursAgo = 24, type } = args;

		const cutoffTime = Date.now() - hoursAgo * 60 * 60 * 1000;

		let q = ctx.db
			.query('taxonomyNodes')
			.withIndex('by_last_modified')
			.filter((q) => q.gte(q.field('lastModified'), cutoffTime));

		if (type) {
			q = q.filter((q) => q.eq(q.field('type'), type));
		}

		return await q.order('desc').collect();
	}
});

// Validation queries for hierarchy rules
export const validateParentChild = query({
	args: {
		parentId: v.union(v.string(), v.null()),
		childType: v.union(v.literal('portfolio'), v.literal('line'), v.literal('category'))
	},
	handler: async (ctx, args) => {
		const { parentId, childType } = args;

		// Portfolios cannot have parents - they must be top-level
		if (childType === 'portfolio') {
			if (parentId !== null) {
				return {
					valid: false,
					reason: 'Portfolios cannot have parent nodes - they must be top-level'
				};
			}
			return { valid: true };
		}

		// Lines and categories must have parents
		if (parentId === null) {
			return { valid: false, reason: `${childType} nodes must have a parent` };
		}

		const parent: any = await ctx.db.get(parentId as Id<'taxonomyNodes'>);
		if (!parent) {
			return { valid: false, reason: 'Parent node not found' };
		}

		// Validate hierarchy rules for non-portfolio types
		switch (childType) {
			case 'line':
				// Line must have portfolio parent
				if (parent.type !== 'portfolio') {
					return { valid: false, reason: 'Product line must have portfolio parent' };
				}
				break;
			case 'category':
				// Category must have line parent
				if (parent.type !== 'line') {
					return { valid: false, reason: 'Category must have product line parent' };
				}
				break;
		}

		return { valid: true };
	}
});

export const checkCircularReference = query({
	args: { nodeId: v.string(), newParentId: v.string() },
	handler: async (ctx, args) => {
		const { nodeId, newParentId } = args;

		// Walk up from newParentId to check if nodeId is an ancestor
		let currentId: string | null = newParentId;
		const visited = new Set();

		while (currentId && !visited.has(currentId)) {
			if (currentId === nodeId) {
				return { hasCircularReference: true };
			}

			visited.add(currentId);
			const node: any = await ctx.db.get(currentId as Id<'taxonomyNodes'>);
			currentId = node?.parentId || null;
		}

		return { hasCircularReference: false };
	}
});
