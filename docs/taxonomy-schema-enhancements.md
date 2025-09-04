# Taxonomy Schema Enhancements

## Overview

This document outlines the unified schema design for modeling the 3 hierarchical levels of the Taxonomy using a single table approach with type discrimination.

## Hierarchical Structure

The taxonomy consists of three hierarchical levels stored in a single `taxonomyNodes` table with type discrimination:

| Hierarchy Level  | Type Value  | TBM Mapping | Parent Type | Children Types |
| ---------------- | ----------- | ----------- | ----------- | -------------- |
| Level 1 (Top)    | "portfolio" | Type        | null        | "line"         |
| Level 2 (Middle) | "line"      | Category    | "portfolio" | "category"     |
| Level 3 (Bottom) | "category"  | Name        | "line"      | none (leaf)    |

## Unified Schema Design

### Single Table Approach: TaxonomyNode

The taxonomy is implemented as a single table with type discrimination, providing a unified approach to managing the three hierarchical levels.

#### TaxonomyNode Schema

```typescript
type TaxonomyNode = {
	name: string; // Node name (2-100 characters)
	description: string; // Node description (10-1000 characters)
	type: 'portfolio' | 'line' | 'category'; // Node type discriminator
	strategy?: string; // Optional strategic approach (5-2000 characters)
	parentId: string | null; // Reference to parent node (null for top-level)
	isActive: boolean; // Active status (default: true)

	// Audit Trail
	createdBy: string; // User who created the node
	updatedBy: string; // User who last updated the node
	lastModified: number; // Timestamp of last modification
	changeHistory: ChangeRecord[]; // Array of detailed change records
	version: number; // Version number (incremented on updates)
};
```

### Hierarchical Level Definitions

#### Level 1: Portfolio (type: "portfolio")

- **Purpose**: Highest level grouping of related products
- **TBM Mapping**: Type
- **Parent**: null (top-level)
- **Children**: Product Lines (type: "line")

#### Level 2: Line (type: "line")

- **Purpose**: Mid-level grouping within a Product Portfolio
- **TBM Mapping**: Category
- **Parent**: Portfolio (type: "portfolio")
- **Children**: Product Categories (type: "category")

#### Level 3: Category (type: "category")

- **Purpose**: Specific product groupings at the most granular level
- **TBM Mapping**: Name
- **Parent**: Product Line (type: "line")
- **Children**: None (leaf nodes)

## Implementation Considerations

### 1. Schema Design Benefits

- **Unified Operations**: Single set of CRUD mutations for all node types
- **Consistent Audit Trail**: Identical change tracking across all levels
- **Simplified Queries**: Easy hierarchy traversal and tree operations
- **Flexible Strategy**: Optional strategy field available at all levels

### 2. Validation Rules

- **Type-Parent Validation**: Enforce valid parent-child type relationships
  - Portfolio: parent must be null
  - Line: parent must be a portfolio
  - Category: parent must be a line
- **Circular Reference Prevention**: Ensure no node can be its own ancestor
- **Active State Consistency**: Consider impact of deactivating nodes on children

### 3. Query Patterns

- **Type Filtering**: `WHERE type = "portfolio"` for level-specific queries
- **Hierarchy Traversal**: Recursive CTEs for tree operations
- **Breadcrumb Generation**: Single query to build full paths
- **Subtree Operations**: Efficient queries for node families

### 4. Migration Strategy

- **Existing Data**: Consolidate current ProductPortfolio and ProductLine tables
- **Reference Updates**: Update foreign keys to point to unified table
- **Type Assignment**: Set appropriate type values during migration

### 5. Performance Considerations

- **Indexing**: Composite indexes on (type, parentId, isActive)
- **Query Optimization**: Leverage type discrimination for efficient filtering
- **Tree Operations**: Consider materialized path or nested set patterns if needed

### 6. Future Extensibility

- **New Node Types**: Easy to add new taxonomy levels via type enum
- **Custom Attributes**: Type-specific fields can be added as optional JSON
- **Multi-Tenant**: Straightforward to add tenant isolation if needed
