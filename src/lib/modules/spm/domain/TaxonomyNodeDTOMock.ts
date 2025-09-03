import type { 
	TaxonomyNodeProps, 
	TaxonomyNode, 
	TaxonomyNodeType,
	PortfolioProps,
	LineProps,
	CategoryProps,
	ChangeHistoryEntry
} from './TaxonomyNodeDTO';

/**
 * Mock data generator for TaxonomyNodeDTO testing
 * Follows the established pattern of {Entity}DTOMock.ts
 */
export class TaxonomyNodeDTOMock {
	private static counter = 1;

	/**
	 * Generate a valid TaxonomyNodeProps for testing
	 */
	static createTaxonomyNodeProps(overrides: Partial<TaxonomyNodeProps> = {}): TaxonomyNodeProps {
		const timestamp = Date.now();
		return {
			name: `Test Node ${this.counter++}`,
			description: 'A comprehensive test taxonomy node for validation purposes',
			type: 'portfolio' as TaxonomyNodeType,
			strategy: 'Strategic direction for test node implementation and management',
			parentId: null,
			createdBy: 'test_user',
			updatedBy: 'test_user',
			lastModified: timestamp,
			changeHistory: [],
			isActive: true,
			version: 1,
			...overrides
		};
	}

	/**
	 * Generate a complete TaxonomyNode with Convex metadata
	 */
	static createTaxonomyNode(overrides: Partial<TaxonomyNode> = {}): TaxonomyNode {
		const props = this.createTaxonomyNodeProps(overrides);
		return {
			_id: `taxonomy_${Date.now()}_${this.counter}`,
			_creationTime: Date.now(),
			...props,
			...overrides
		};
	}

	/**
	 * Generate a Portfolio node (top-level, parentId = null)
	 */
	static createPortfolioProps(overrides: Partial<PortfolioProps> = {}): PortfolioProps {
		return this.createTaxonomyNodeProps({
			type: 'portfolio',
			parentId: null,
			name: `Test Portfolio ${this.counter}`,
			description: 'A test portfolio for strategic product management',
			...overrides
		}) as PortfolioProps;
	}

	/**
	 * Generate a Line node (child of portfolio)
	 */
	static createLineProps(parentPortfolioId: string, overrides: Partial<LineProps> = {}): LineProps {
		return this.createTaxonomyNodeProps({
			type: 'line',
			parentId: parentPortfolioId,
			name: `Test Product Line ${this.counter}`,
			description: 'A test product line within a portfolio',
			...overrides
		}) as LineProps;
	}

	/**
	 * Generate a Category node (child of line)
	 */
	static createCategoryProps(parentLineId: string, overrides: Partial<CategoryProps> = {}): CategoryProps {
		return this.createTaxonomyNodeProps({
			type: 'category',
			parentId: parentLineId,
			name: `Test Category ${this.counter}`,
			description: 'A test category within a product line',
			...overrides
		}) as CategoryProps;
	}

	/**
	 * Create a hierarchical structure: Portfolio -> Line -> Category
	 */
	static createHierarchicalStructure(): {
		portfolio: TaxonomyNode;
		line: TaxonomyNode;
		category: TaxonomyNode;
	} {
		const portfolio = this.createTaxonomyNode(this.createPortfolioProps());
		const line = this.createTaxonomyNode(this.createLineProps(portfolio._id));
		const category = this.createTaxonomyNode(this.createCategoryProps(line._id));

		return { portfolio, line, category };
	}

	/**
	 * Create multiple hierarchical nodes with children arrays for tree testing
	 */
	static createHierarchyWithChildren() {
		const portfolio1 = this.createTaxonomyNode(this.createPortfolioProps({ name: 'Core Portfolio' }));
		const portfolio2 = this.createTaxonomyNode(this.createPortfolioProps({ name: 'Innovation Portfolio' }));

		const line1 = this.createTaxonomyNode(this.createLineProps(portfolio1._id, { name: 'Enterprise Line' }));
		const line2 = this.createTaxonomyNode(this.createLineProps(portfolio1._id, { name: 'Consumer Line' }));
		const line3 = this.createTaxonomyNode(this.createLineProps(portfolio2._id, { name: 'Research Line' }));

		const category1 = this.createTaxonomyNode(this.createCategoryProps(line1._id, { name: 'Security Category' }));
		const category2 = this.createTaxonomyNode(this.createCategoryProps(line1._id, { name: 'Analytics Category' }));
		const category3 = this.createTaxonomyNode(this.createCategoryProps(line2._id, { name: 'Mobile Category' }));

		// Structure with children arrays for tree rendering
		return [
			{
				...portfolio1,
				children: [
					{
						...line1,
						children: [
							{ ...category1, children: [] },
							{ ...category2, children: [] }
						]
					},
					{
						...line2,
						children: [
							{ ...category3, children: [] }
						]
					}
				]
			},
			{
				...portfolio2,
				children: [
					{
						...line3,
						children: []
					}
				]
			}
		];
	}

	/**
	 * Generate multiple TaxonomyNodeProps for bulk testing
	 */
	static createTaxonomyNodePropsArray(
		count: number,
		type: TaxonomyNodeType = 'portfolio',
		overrides: Partial<TaxonomyNodeProps> = {}
	): TaxonomyNodeProps[] {
		return Array.from({ length: count }, () => 
			this.createTaxonomyNodeProps({ type, ...overrides })
		);
	}

	/**
	 * Generate multiple TaxonomyNodes for bulk testing
	 */
	static createTaxonomyNodeArray(
		count: number,
		type: TaxonomyNodeType = 'portfolio',
		overrides: Partial<TaxonomyNode> = {}
	): TaxonomyNode[] {
		return Array.from({ length: count }, () => 
			this.createTaxonomyNode({ type, ...overrides })
		);
	}

	/**
	 * Create nodes for testing different active/inactive states
	 */
	static createMixedActiveNodes(): TaxonomyNode[] {
		return [
			this.createTaxonomyNode(this.createPortfolioProps({ name: 'Active Portfolio', isActive: true })),
			this.createTaxonomyNode(this.createPortfolioProps({ name: 'Inactive Portfolio', isActive: false })),
			this.createTaxonomyNode(this.createPortfolioProps({ name: 'Active Portfolio 2', isActive: true }))
		];
	}

	/**
	 * Create change history entries for audit testing
	 */
	static createChangeHistoryEntry(overrides: Partial<ChangeHistoryEntry> = {}): ChangeHistoryEntry {
		return {
			timestamp: Date.now(),
			updatedBy: 'test_user',
			changes: { name: 'Updated Name', description: 'Updated Description' },
			reason: 'Test update',
			...overrides
		};
	}

	/**
	 * Create node with change history for audit trail testing
	 */
	static createNodeWithHistory(): TaxonomyNode {
		const changeHistory = [
			this.createChangeHistoryEntry({ reason: 'Initial creation' }),
			this.createChangeHistoryEntry({ reason: 'Name update' }),
			this.createChangeHistoryEntry({ reason: 'Description update' })
		];

		return this.createTaxonomyNode({
			changeHistory,
			version: changeHistory.length + 1
		});
	}

	/**
	 * Create invalid TaxonomyNodeProps for negative testing
	 */
	static createInvalidTaxonomyNodeProps(): {
		nameEmpty: Partial<TaxonomyNodeProps>;
		nameTooLong: Partial<TaxonomyNodeProps>;
		descriptionTooShort: Partial<TaxonomyNodeProps>;
		descriptionTooLong: Partial<TaxonomyNodeProps>;
		strategyTooShort: Partial<TaxonomyNodeProps>;
		strategyTooLong: Partial<TaxonomyNodeProps>;
		invalidParentForPortfolio: Partial<TaxonomyNodeProps>;
		nullParentForLine: Partial<TaxonomyNodeProps>;
		nullParentForCategory: Partial<TaxonomyNodeProps>;
	} {
		return {
			nameEmpty: {
				name: '',
				description: 'Valid description for testing',
				type: 'portfolio',
				createdBy: 'test_user',
				updatedBy: 'test_user',
				lastModified: Date.now()
			},
			nameTooLong: {
				name: 'A'.repeat(101),
				description: 'Valid description for testing',
				type: 'portfolio',
				createdBy: 'test_user',
				updatedBy: 'test_user',
				lastModified: Date.now()
			},
			descriptionTooShort: {
				name: 'Valid Name',
				description: 'Short',
				type: 'portfolio',
				createdBy: 'test_user',
				updatedBy: 'test_user',
				lastModified: Date.now()
			},
			descriptionTooLong: {
				name: 'Valid Name',
				description: 'A'.repeat(1001),
				type: 'portfolio',
				createdBy: 'test_user',
				updatedBy: 'test_user',
				lastModified: Date.now()
			},
			strategyTooShort: {
				name: 'Valid Name',
				description: 'Valid description for testing',
				type: 'portfolio',
				strategy: 'Too',
				createdBy: 'test_user',
				updatedBy: 'test_user',
				lastModified: Date.now()
			},
			strategyTooLong: {
				name: 'Valid Name',
				description: 'Valid description for testing',
				type: 'portfolio',
				strategy: 'A'.repeat(2001),
				createdBy: 'test_user',
				updatedBy: 'test_user',
				lastModified: Date.now()
			},
			invalidParentForPortfolio: {
				name: 'Valid Portfolio',
				description: 'Valid description for testing',
				type: 'portfolio',
				parentId: 'some_parent_id', // Portfolios should have null parent
				createdBy: 'test_user',
				updatedBy: 'test_user',
				lastModified: Date.now()
			},
			nullParentForLine: {
				name: 'Valid Line',
				description: 'Valid description for testing',
				type: 'line',
				parentId: null, // Lines must have a portfolio parent
				createdBy: 'test_user',
				updatedBy: 'test_user',
				lastModified: Date.now()
			},
			nullParentForCategory: {
				name: 'Valid Category',
				description: 'Valid description for testing',
				type: 'category',
				parentId: null, // Categories must have a line parent
				createdBy: 'test_user',
				updatedBy: 'test_user',
				lastModified: Date.now()
			}
		};
	}

	/**
	 * Reset counter for predictable test data
	 */
	static resetCounter(): void {
		this.counter = 1;
	}

	/**
	 * Create nodes for search filtering tests
	 */
	static createNodesForSearchTesting(): TaxonomyNode[] {
		return [
			this.createTaxonomyNode(this.createPortfolioProps({ 
				name: 'Digital Portfolio', 
				description: 'Portfolio focused on digital transformation initiatives'
			})),
			this.createTaxonomyNode(this.createPortfolioProps({ 
				name: 'Legacy Systems', 
				description: 'Portfolio managing legacy system maintenance'
			})),
			this.createTaxonomyNode(this.createPortfolioProps({ 
				name: 'Innovation Hub', 
				description: 'Hub for innovative digital solutions'
			}))
		];
	}

	/**
	 * Create nodes for type filtering tests
	 */
	static createMixedTypeNodes(): TaxonomyNode[] {
		const portfolio = this.createTaxonomyNode(this.createPortfolioProps({ name: 'Test Portfolio' }));
		const line = this.createTaxonomyNode(this.createLineProps(portfolio._id, { name: 'Test Line' }));
		const category = this.createTaxonomyNode(this.createCategoryProps(line._id, { name: 'Test Category' }));

		return [portfolio, line, category];
	}
}