import { defineTable } from 'convex/server';
import { zodOutputToConvex } from 'convex-helpers/server/zod';
import { TaxonomyNodePropsSchema } from '../../../lib/modules/spm/domain/TaxonomyNodeDTO';

// Export table to make it available in the generated API
export const taxonomyNodes = defineTable(zodOutputToConvex(TaxonomyNodePropsSchema))
	// Index for hierarchy queries
	.index('by_parent', ['parentId'])
	// Index for type-specific queries
	.index('by_type', ['type'])
	// Compound index for efficient parent-child queries by type
	.index('by_parent_and_type', ['parentId', 'type'])
	// Index for name searches
	.index('by_name', ['name'])
	// Index for active status filtering
	.index('by_active', ['isActive'])
	// Index for audit queries
	.index('by_created_by', ['createdBy'])
	.index('by_updated_by', ['updatedBy'])
	.index('by_last_modified', ['lastModified']);
