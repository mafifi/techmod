import { mutation } from '../../_generated/server';
import { zodToConvex } from 'convex-helpers/server/zod';
import { v } from 'convex/values';
import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { 
	TaxonomyNodePropsSchema,
	PortfolioPropsSchema,
	LinePropsSchema,
	CategoryPropsSchema,
	ChangeHistoryEntrySchema
} from '../../../lib/modules/spm/domain/TaxonomyNodeDTO';

// Helper function to validate hierarchy rules
async function validateHierarchyRules(ctx: any, type: string, parentId: string | null) {
	if (parentId === null) {
		// Only portfolios can have null parent
		if (type !== 'portfolio') {
			throw new Error(`${type} nodes must have a parent`);
		}
		return;
	}
	
	// Portfolios cannot have parents - they must always be top-level
	if (type === 'portfolio') {
		throw new Error('Portfolios cannot have parent nodes - they must be top-level');
	}
	
	const parent: any = await ctx.db.get(parentId as Id<'taxonomyNodes'>);
	if (!parent) {
		throw new Error('Parent node not found');
	}
	
	// Validate hierarchy rules for non-portfolio types
	switch (type) {
		case 'line':
			if (parent.type !== 'portfolio') {
				throw new Error('Product line must have portfolio parent');
			}
			break;
		case 'category':
			if (parent.type !== 'line') {
				throw new Error('Category must have product line parent');
			}
			break;
		default:
			throw new Error(`Invalid node type: ${type}`);
	}
}

// Helper function to check circular references
async function checkCircularReference(ctx: any, nodeId: string, newParentId: string | null): Promise<boolean> {
	if (!newParentId) return false;
	
	let currentId: string | null = newParentId;
	const visited = new Set<string>();
	
	while (currentId && !visited.has(currentId)) {
		if (currentId === nodeId) {
			return true; // Circular reference found
		}
		
	visited.add(currentId);
	const node: any = await ctx.db.get(currentId as Id<'taxonomyNodes'>);
	currentId = node?.parentId || null;
	}
	
	return false;
}

// Helper function to add change history entry
function addChangeHistoryEntry(
	existingHistory: any[],
	updatedBy: string,
	changes: Record<string, any>,
	reason?: string
) {
	const newEntry = {
		timestamp: Date.now(),
		updatedBy,
		changes,
		reason
	};
	
	return [...existingHistory, newEntry];
}

// Generic create mutation with type-specific validation
export const create = mutation({
	// Omit server-managed fields so client does not need to supply them
	args: zodToConvex(TaxonomyNodePropsSchema.omit({ version: true, lastModified: true, changeHistory: true })),
	handler: async (ctx: MutationCtx, args: any) => {
		// Validate hierarchy rules
		await validateHierarchyRules(ctx, args.type, args.parentId);
		
		// Set audit fields
		const now = Date.now();
		const nodeData = {
			...args,
			lastModified: now,
			version: 1,
			changeHistory: [{
				timestamp: now,
				updatedBy: args.createdBy,
				changes: { created: true },
				reason: 'Initial creation'
			}]
		};
		
		return await ctx.db.insert('taxonomyNodes', nodeData);
	}
});

// Type-specific create mutations for better type safety
export const createPortfolio = mutation({
	// Portfolios are created server-side with version/changeHistory managed.
	args: zodToConvex(PortfolioPropsSchema.omit({ version: true, lastModified: true, changeHistory: true })),
	handler: async (ctx: MutationCtx, args: any) => {
		// Portfolios must always have null parentId (enforced by schema, but double-check)
		if (args.parentId !== null) {
			throw new Error('Portfolios cannot have parent nodes - they must be top-level');
		}
		
		const now = Date.now();
		const portfolioData = {
			...args,
			lastModified: now,
			version: 1,
			changeHistory: [{
				timestamp: now,
				updatedBy: args.createdBy,
				changes: { created: true },
				reason: 'Portfolio creation'
			}]
		};
		
		return await ctx.db.insert('taxonomyNodes', portfolioData);
	}
});

export const createLine = mutation({
	args: zodToConvex(LinePropsSchema.omit({ version: true, lastModified: true, changeHistory: true })),
	handler: async (ctx: MutationCtx, args: any) => {
		// Validate parent portfolio exists
	const parent: any = await ctx.db.get(args.parentId as Id<'taxonomyNodes'>);
	if (!parent || parent.type !== 'portfolio') {
			throw new Error('Product line must have a portfolio parent');
		}
		
		const now = Date.now();
		const lineData = {
			...args,
			lastModified: now,
			version: 1,
			changeHistory: [{
				timestamp: now,
				updatedBy: args.createdBy,
				changes: { created: true },
				reason: 'Product line creation'
			}]
		};
		
		return await ctx.db.insert('taxonomyNodes', lineData);
	}
});

export const createCategory = mutation({
	args: zodToConvex(CategoryPropsSchema.omit({ version: true, lastModified: true, changeHistory: true })),
	handler: async (ctx: MutationCtx, args: any) => {
		// Validate parent line exists
	const parent: any = await ctx.db.get(args.parentId as Id<'taxonomyNodes'>);
	if (!parent || parent.type !== 'line') {
			throw new Error('Category must have a product line parent');
		}
		
		const now = Date.now();
		const categoryData = {
			...args,
			lastModified: now,
			version: 1,
			changeHistory: [{
				timestamp: now,
				updatedBy: args.createdBy,
				changes: { created: true },
				reason: 'Category creation'
			}]
		};
		
		return await ctx.db.insert('taxonomyNodes', categoryData);
	}
});

// Update mutation with audit trail
export const update = mutation({
	args: {
	nodeId: v.id('taxonomyNodes'),
		updates: zodToConvex(TaxonomyNodePropsSchema.partial().omit({ 
			createdBy: true, 
			changeHistory: true,
			version: true 
		})),
		updatedBy: v.string(),
		reason: v.optional(v.string())
	},
	handler: async (ctx: MutationCtx, args: any) => {
		const { nodeId, updates, updatedBy, reason } = args;
		
	const existing: any = await ctx.db.get(nodeId as Id<'taxonomyNodes'>);
		if (!existing) {
			throw new Error('Node not found');
		}
		
		// If parent is being changed, validate hierarchy and circular references
		if (updates.parentId !== undefined) {
			if (updates.parentId !== existing.parentId) {
				// Check for circular references
				const hasCircular = await checkCircularReference(ctx, nodeId as Id<'taxonomyNodes'>, updates.parentId as Id<'taxonomyNodes'> | null);
				if (hasCircular) {
					throw new Error('Cannot create circular reference in hierarchy');
				}
				
				// Validate new hierarchy rules
				const nodeType = updates.type || existing.type;
				await validateHierarchyRules(ctx, nodeType, updates.parentId as Id<'taxonomyNodes'> | null);
			}
		}
		
		// Track changes for audit
		const changes: Record<string, any> = {};
		for (const key of Object.keys(updates) as Array<keyof typeof updates>) {
			if (updates[key] !== (existing as any)[key]) {
				changes[key as string] = { from: (existing as any)[key], to: updates[key] };
			}
		}
		
		if (Object.keys(changes).length === 0) {
			throw new Error('No changes detected');
		}
		
		// Update with audit trail
		const now = Date.now();
		const newChangeHistory = addChangeHistoryEntry(
			existing.changeHistory || [],
			updatedBy,
			changes,
			reason
		);
		
		await ctx.db.patch(nodeId as Id<'taxonomyNodes'>, {
			...updates,
			lastModified: now,
			version: (existing.version ?? 0) + 1,
			changeHistory: newChangeHistory
		});
		
		return { success: true, changes };
	}
});

// Move node (change parent) with validation
export const moveNode = mutation({
	args: {
	nodeId: v.id('taxonomyNodes'),
	newParentId: v.union(v.id('taxonomyNodes'), v.null()),
		updatedBy: v.string(),
		reason: v.optional(v.string())
	},
	handler: async (ctx: MutationCtx, args: any) => {
		const { nodeId, newParentId, updatedBy, reason } = args;
        
	const node: any = await ctx.db.get(nodeId as Id<'taxonomyNodes'>);
		if (!node) {
			throw new Error('Node not found');
		}
		
		// Portfolios cannot be moved - they must remain top-level
		if (node.type === 'portfolio') {
			throw new Error('Portfolios cannot be moved - they must remain top-level');
		}
		
		if (node.parentId === newParentId) {
			throw new Error('Node is already in the specified location');
		}
		
		// Check for circular references
		if (newParentId) {
			const hasCircular = await checkCircularReference(ctx, nodeId, newParentId);
			if (hasCircular) {
				throw new Error('Cannot create circular reference in hierarchy');
			}
		}
		
		// Validate hierarchy rules
		await validateHierarchyRules(ctx, node.type, newParentId);
		
		// Update with audit trail
		const now = Date.now();
		const changes = {
			parentId: { from: node.parentId, to: newParentId }
		};
		
		const newChangeHistory = addChangeHistoryEntry(
			node.changeHistory || [],
			updatedBy,
			changes,
			reason || 'Node moved in hierarchy'
		);
		
		await ctx.db.patch(nodeId as Id<'taxonomyNodes'>, {
			parentId: newParentId,
			lastModified: now,
			version: (node.version ?? 0) + 1,
			changeHistory: newChangeHistory
		});
		
		return { success: true, changes };
	}
});

// Soft delete (deactivate) with cascade options
export const deactivate = mutation({
	args: {
	nodeId: v.id('taxonomyNodes'),
		updatedBy: v.string(),
		cascadeToChildren: v.optional(v.boolean()),
		reason: v.optional(v.string())
	},
	handler: async (ctx: MutationCtx, args: any) => {
		const { nodeId, updatedBy, cascadeToChildren = false, reason } = args;
        
	const node: any = await ctx.db.get(nodeId as Id<'taxonomyNodes'>);
		if (!node) {
			throw new Error('Node not found');
		}
		
		if (!node.isActive) {
			throw new Error('Node is already inactive');
		}
		
		const now = Date.now();
		const changes = { isActive: { from: true, to: false } };
		
		// Deactivate the node
		const newChangeHistory = addChangeHistoryEntry(
			node.changeHistory || [],
			updatedBy,
			changes,
			reason || 'Node deactivated'
		);
		
		await ctx.db.patch(nodeId as Id<'taxonomyNodes'>, {
			isActive: false,
			lastModified: now,
			version: (node.version ?? 0) + 1,
			changeHistory: newChangeHistory
		});
		
		let deactivatedCount = 1;
		
		// Cascade to children if requested
		if (cascadeToChildren) {
			const children = await ctx.db
				.query('taxonomyNodes')
				.withIndex('by_parent', (q: any) => q.eq('parentId', nodeId))
					.filter((q: any) => q.eq(q.field('isActive'), true))
				.collect();
			
				for (const child of children) {
				const childChangeHistory = addChangeHistoryEntry(
					child.changeHistory || [],
					updatedBy,
					{ isActive: { from: true, to: false } },
					'Cascaded deactivation from parent'
				);
				
				await ctx.db.patch(child._id, {
					isActive: false,
					lastModified: now,
					version: (child.version ?? 0) + 1,
					changeHistory: childChangeHistory
				});
				
				deactivatedCount++;
			}
		}
		
		return { success: true, deactivatedCount };
	}
});

// Reactivate node
export const reactivate = mutation({
	args: {
	nodeId: v.id('taxonomyNodes'),
		updatedBy: v.string(),
		reason: v.optional(v.string())
	},
	handler: async (ctx: MutationCtx, args: any) => {
		const { nodeId, updatedBy, reason } = args;
        
	const node: any = await ctx.db.get(nodeId as Id<'taxonomyNodes'>);
		if (!node) {
			throw new Error('Node not found');
		}
		
		if (node.isActive) {
			throw new Error('Node is already active');
		}
		
		// Check if parent is active (if parent exists)
		if (node.parentId) {
			const parent: any = await ctx.db.get(node.parentId as Id<'taxonomyNodes'>);
			if (!parent || !parent.isActive) {
				throw new Error('Cannot reactivate node: parent is inactive');
			}
		}
		
		const now = Date.now();
		const changes = { isActive: { from: false, to: true } };
		
		const newChangeHistory = addChangeHistoryEntry(
			node.changeHistory || [],
			updatedBy,
			changes,
			reason || 'Node reactivated'
		);
		
		await ctx.db.patch(nodeId as Id<'taxonomyNodes'>, {
			isActive: true,
			lastModified: now,
			version: (node.version ?? 0) + 1,
			changeHistory: newChangeHistory
		});
		
		return { success: true };
	}
});

// Hard delete with safety checks
export const deleteNode = mutation({
	args: {
	nodeId: v.id('taxonomyNodes'),
		updatedBy: v.string(),
		forceDelete: v.optional(v.boolean())
	},
	handler: async (ctx: MutationCtx, args: any) => {
		const { nodeId, updatedBy, forceDelete = false } = args;
        
	const node: any = await ctx.db.get(nodeId as Id<'taxonomyNodes'>);
		if (!node) {
			throw new Error('Node not found');
		}
		
		// Check for children unless force delete is enabled
		if (!forceDelete) {
			const children = await ctx.db
				.query('taxonomyNodes')
				.withIndex('by_parent', (q) => q.eq('parentId', nodeId))
				.first();
			
			if (children) {
				throw new Error('Cannot delete node with children. Use forceDelete or move children first.');
			}
		} else {
			// Force delete: handle children based on hierarchy rules
			const children = await ctx.db
				.query('taxonomyNodes')
				.withIndex('by_parent', (q) => q.eq('parentId', nodeId))
				.collect();
			
			for (const child of children) {
				// All children must be deleted since:
				// - Lines and categories cannot exist without parents
				// - Portfolios cannot have parents (already top-level)
		await ctx.db.delete(child._id);
			}
		}
        
	await ctx.db.delete(nodeId as Id<'taxonomyNodes'>);
		return { success: true };
	}
});