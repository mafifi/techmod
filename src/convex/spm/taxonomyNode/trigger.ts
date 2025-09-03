import { internalMutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { MutationCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';

type TaxonomyNodeType = 'category' | 'portfolio' | 'line';

type HandlerContext = MutationCtx;

interface TaxonomyNode extends Doc<'taxonomyNodes'> {
    _id: Id<'taxonomyNodes'>;
    name: string;
    type: TaxonomyNodeType;
    parentId: Id<'taxonomyNodes'> | null;
    lastModified: number;
}

// Type for the audit event data
interface AuditEvent {
    eventType: string;
    nodeId: Id<'taxonomyNodes'>;
    userId: string;
    changes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    timestamp: number;
}

// Note: Convex triggers are defined as internal mutations that are scheduled
// These will be called by the Convex trigger system when data changes occur

// Trigger for handling hierarchy changes
export const onHierarchyChange = internalMutation({
	args: {
		nodeId: v.string(),
		changeType: v.union(v.literal('created'), v.literal('updated'), v.literal('deleted'), v.literal('moved')),
		oldParentId: v.optional(v.union(v.string(), v.null())),
		newParentId: v.optional(v.union(v.string(), v.null())),
		updatedBy: v.string()
	},
	handler: async (ctx: HandlerContext, args) => {
		const { nodeId, changeType, oldParentId, newParentId, updatedBy } = args;
		
		console.log(`Hierarchy change detected: ${changeType} for node ${nodeId}`);
		
		// Get the affected node
		const node = changeType !== 'deleted' ? await ctx.db.get(nodeId as Id<'taxonomyNodes'>) : null;
		
		// Fix null/undefined issues for optional arguments
		const safeOldParentId = oldParentId ?? null;
		const safeNewParentId = newParentId ?? null;

		switch (changeType) {
			case 'created':
				await handleNodeCreated(ctx, node as TaxonomyNode, updatedBy);
				break;
			case 'updated':
				await handleNodeUpdated(ctx, node as TaxonomyNode, updatedBy);
				break;
			case 'moved':
				await handleNodeMoved(ctx, node as TaxonomyNode, safeOldParentId, safeNewParentId, updatedBy);
				break;
			case 'deleted':
				await handleNodeDeleted(ctx, nodeId, safeOldParentId, updatedBy);
				break;
		}
	}
});

// Handle node creation events
async function handleNodeCreated(ctx: any, node: any, updatedBy: string) {
	// Update parent node's metadata if needed
	if (node.parentId) {
		const parent = await ctx.db.get(node.parentId);
		if (parent) {
			// Could update parent's child count, last modified, etc.
			await ctx.db.patch(node.parentId, {
				lastModified: Date.now()
			});
		}
	}
	
	// Log audit event
	await logAuditEvent(ctx, {
		eventType: 'node_created',
		nodeId: node._id,
		nodeName: node.name,
		nodeType: node.type,
		parentId: node.parentId,
		userId: updatedBy,
		timestamp: Date.now()
	});
}

// Handle node update events
async function handleNodeUpdated(ctx: any, node: any, updatedBy: string) {
	// Could trigger recalculations, notifications, etc.
	
	// Log audit event
	await logAuditEvent(ctx, {
		eventType: 'node_updated',
		nodeId: node._id,
		nodeName: node.name,
		nodeType: node.type,
		parentId: node.parentId,
		userId: updatedBy,
		timestamp: Date.now()
	});
}

// Handle node movement in hierarchy
async function handleNodeMoved(ctx: any, node: any, oldParentId: string | null, newParentId: string | null, updatedBy: string) {
	// Update old parent's last modified time
	if (oldParentId) {
		const oldParent = await ctx.db.get(oldParentId);
		if (oldParent) {
			await ctx.db.patch(oldParentId, {
				lastModified: Date.now()
			});
		}
	}
	
	// Update new parent's last modified time
	if (newParentId) {
		const newParent = await ctx.db.get(newParentId);
		if (newParent) {
			await ctx.db.patch(newParentId, {
				lastModified: Date.now()
			});
		}
	}
	
	// Log audit event
	await logAuditEvent(ctx, {
		eventType: 'node_moved',
		nodeId: node._id,
		nodeName: node.name,
		nodeType: node.type,
		parentId: newParentId,
		metadata: {
			oldParentId,
			newParentId
		},
		userId: updatedBy,
		timestamp: Date.now()
	});
}

// Handle node deletion events
async function handleNodeDeleted(ctx: any, nodeId: string, parentId: string | null, updatedBy: string) {
	// Update parent node's metadata if needed
	if (parentId) {
		const parent = await ctx.db.get(parentId);
		if (parent) {
			await ctx.db.patch(parentId, {
				lastModified: Date.now()
			});
		}
	}
	
	// Log audit event
	await logAuditEvent(ctx, {
		eventType: 'node_deleted',
		nodeId,
		parentId,
		userId: updatedBy,
		timestamp: Date.now()
	});
}

// Trigger for audit trail events
export const onAuditEvent = internalMutation({
	args: {
		eventType: v.string(),
		nodeId: v.string(),
		userId: v.string(),
		changes: v.optional(v.record(v.string(), v.any())),
		metadata: v.optional(v.record(v.string(), v.any()))
	},
	handler: async (ctx, args) => {
		const { eventType, nodeId, userId, changes, metadata } = args;
		
		// Store audit event in a dedicated audit log table (if implemented)
		// For now, we'll just log to console and could extend to external systems
		
		console.log('Audit event triggered:', {
			eventType,
			nodeId,
			userId,
			changes,
			metadata,
			timestamp: new Date().toISOString()
		});
		
		// Could trigger external audit systems, compliance reports, etc.
		await handleAuditCompliance(ctx, eventType, nodeId, userId, changes);
	}
});

// Handle compliance and audit requirements
async function handleAuditCompliance(ctx: any, eventType: string, nodeId: string, userId: string, changes?: Record<string, any>) {
	// Implement compliance-specific logic
	
	// Example: Check if certain changes require approval
	if (changes && Object.keys(changes).some(key => ['type', 'parentId'].includes(key))) {
		console.log(`High-impact change detected for node ${nodeId} by user ${userId}`);
		// Could trigger approval workflows, notifications, etc.
	}
	
	// Example: Archive old versions for compliance
	if (eventType === 'node_updated' && changes) {
		// Could store version snapshots for audit trail
		console.log(`Archiving version snapshot for node ${nodeId}`);
	}
}

// Trigger for data consistency checks
export const onDataConsistencyCheck = internalMutation({
	args: {
		checkType: v.union(
			v.literal('hierarchy_integrity'),
			v.literal('circular_reference'),
			v.literal('orphaned_nodes'),
			v.literal('type_validation')
		),
		triggeredBy: v.string(),
		scope: v.optional(v.string()) // nodeId or 'all'
	},
	handler: async (ctx, args) => {
		const { checkType, triggeredBy, scope = 'all' } = args;
		
		console.log(`Data consistency check triggered: ${checkType} by ${triggeredBy}`);
		
		switch (checkType) {
			case 'hierarchy_integrity':
				await checkHierarchyIntegrity(ctx, scope);
				break;
			case 'circular_reference':
				await checkCircularReferences(ctx, scope);
				break;
			case 'orphaned_nodes':
				await checkOrphanedNodes(ctx);
				break;
			case 'type_validation':
				await checkTypeValidation(ctx, scope);
				break;
		}
	}
});

// Check hierarchy integrity
async function checkHierarchyIntegrity(ctx: any, scope: string) {
	const issues = [];
	
	// Get nodes to check
	const nodes = scope === 'all' 
		? await ctx.db.query('taxonomyNodes').collect()
		: [await ctx.db.get(scope)].filter(Boolean);
	
	for (const node of nodes) {
		if (node.parentId) {
			const parent = await ctx.db.get(node.parentId);
			if (!parent) {
				issues.push({
					type: 'missing_parent',
					nodeId: node._id,
					nodeName: node.name,
					missingParentId: node.parentId
				});
			} else {
				// Check hierarchy rules
				const validParent = await validateParentChildRelationship(node.type, parent.type);
				if (!validParent) {
					issues.push({
						type: 'invalid_hierarchy',
						nodeId: node._id,
						nodeName: node.name,
						nodeType: node.type,
						parentType: parent.type
					});
				}
			}
		}
	}
	
	if (issues.length > 0) {
		console.log(`Hierarchy integrity issues found:`, issues);
		// Could trigger alerts, auto-fixes, etc.
	}
	
	return issues;
}

// Check for circular references
async function checkCircularReferences(ctx: any, scope: string) {
	const issues = [];
	
	const nodes = scope === 'all' 
		? await ctx.db.query('taxonomyNodes').collect()
		: [await ctx.db.get(scope)].filter(Boolean);
	
	for (const node of nodes) {
		if (await hasCircularReference(ctx, node._id, node.parentId, new Set())) {
			issues.push({
				type: 'circular_reference',
				nodeId: node._id,
				nodeName: node.name
			});
		}
	}
	
	if (issues.length > 0) {
		console.log(`Circular reference issues found:`, issues);
	}
	
	return issues;
}

// Check for orphaned nodes
async function checkOrphanedNodes(ctx: any) {
	const issues = [];
	
	const allNodes = await ctx.db.query('taxonomyNodes').collect();
		// Create a Set of all node IDs for quick lookup
	const nodeIds = new Set(allNodes.map((n: TaxonomyNode) => n._id));
	
	for (const node of allNodes) {
		if (node.parentId && !nodeIds.has(node.parentId)) {
			issues.push({
				type: 'orphaned_node',
				nodeId: node._id,
				nodeName: node.name,
				nodeType: node.type,
				missingParentId: node.parentId
			});
		}
	}
	
	if (issues.length > 0) {
		console.log(`Orphaned node issues found:`, issues);
	}
	
	return issues;
}

// Check type validation
async function checkTypeValidation(ctx: any, scope: string) {
	const issues = [];
	
	const nodes = scope === 'all' 
		? await ctx.db.query('taxonomyNodes').collect()
		: [await ctx.db.get(scope)].filter(Boolean);
	
	for (const node of nodes) {
		// Check if type is valid
		if (!['portfolio', 'line', 'category'].includes(node.type)) {
			issues.push({
				type: 'invalid_node_type',
				nodeId: node._id,
				nodeName: node.name,
				invalidType: node.type
			});
		}
		
		// Check parent relationship rules for type
		if (node.parentId) {
			const parent = await ctx.db.get(node.parentId);
			if (parent) {
				const validRelation = await validateParentChildRelationship(node.type, parent.type);
				if (!validRelation) {
					issues.push({
						type: 'invalid_parent_child_type',
						nodeId: node._id,
						nodeName: node.name,
						nodeType: node.type,
						parentType: parent.type
					});
				}
			}
		}
	}
	
	if (issues.length > 0) {
		console.log(`Type validation issues found:`, issues);
	}
	
	return issues;
}

// Helper functions
async function hasCircularReference(ctx: any, nodeId: string, parentId: string | null, visited: Set<string>): Promise<boolean> {
	if (!parentId) return false;
	
	if (parentId === nodeId) return true;
	
	if (visited.has(parentId)) return true; // Infinite loop detected
	
	visited.add(parentId);
	
	const parent = await ctx.db.get(parentId);
	if (!parent) return false;
	
	return await hasCircularReference(ctx, nodeId, parent.parentId, visited);
}

async function validateParentChildRelationship(childType: string, parentType: string): Promise<boolean> {
	switch (childType) {
		case 'portfolio':
			// Portfolios cannot have parents - this should not occur
			return false;
		case 'line':
			return parentType === 'portfolio';
		case 'category':
			return parentType === 'line';
		default:
			return false;
	}
}

// Helper function to log audit events
async function logAuditEvent(ctx: any, event: {
	eventType: string;
	nodeId: string;
	nodeName?: string;
	nodeType?: string;
	parentId?: string | null;
	userId: string;
	timestamp: number;
	metadata?: Record<string, any>;
}) {
	// For now, we'll log to console
	// In a production system, this would write to an audit log table
	console.log('Audit Event:', JSON.stringify(event, null, 2));
	
	// Could also trigger external audit systems
	// await sendToExternalAuditSystem(event);
}

// Notification trigger for important events
export const onNotificationTrigger = internalMutation({
	args: {
		eventType: v.string(),
		nodeId: v.string(),
		userId: v.string(),
		notificationType: v.union(
			v.literal('hierarchy_change'),
			v.literal('approval_required'),
			v.literal('data_inconsistency'),
			v.literal('bulk_operation')
		),
		recipients: v.array(v.string()),
		message: v.string()
	},
	handler: async (ctx, args) => {
		const { eventType, nodeId, userId, notificationType, recipients, message } = args;
		
		console.log(`Notification trigger: ${notificationType} for node ${nodeId}`);
		
		// TODO: Implement actual notification delivery
		// This could integrate with email systems, Slack, Teams, etc.
		
		const notification = {
			id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			type: notificationType,
			eventType,
			nodeId,
			userId,
			recipients,
			message,
			timestamp: Date.now(),
			status: 'pending'
		};
		
		console.log('Notification queued:', notification);
		
		// In a real implementation, this would:
		// 1. Store notification in a notifications table
		// 2. Queue for delivery via appropriate channels
		// 3. Track delivery status and retries
		
		return notification;
	}
});