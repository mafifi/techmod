import { vi } from 'vitest';
import { TaxonomyNodeDTOMock } from '../../../lib/modules/spm/domain/TaxonomyNodeDTOMock';

/**
 * Mock implementations for taxonomy node queries
 * Used for testing without actual Convex backend calls
 */

// Mock query implementations
export const mockTaxonomyNodeQueries = {
	getAll: vi.fn(),
	getById: vi.fn(),
	getByType: vi.fn(),
	getByParentId: vi.fn(),
	getFullHierarchy: vi.fn(),
	getActiveNodes: vi.fn(),
	searchNodes: vi.fn(),
	getNodePath: vi.fn(),
	getNodeDescendants: vi.fn(),
	getValidParents: vi.fn()
};

/**
 * Reset all query mocks to their initial state
 */
export function resetTaxonomyNodeQueryMocks(): void {
	Object.values(mockTaxonomyNodeQueries).forEach(mock => {
		mock.mockClear();
	});

	// Set default return values
	mockTaxonomyNodeQueries.getAll.mockResolvedValue(TaxonomyNodeDTOMock.createTaxonomyNodeArray(3));
	mockTaxonomyNodeQueries.getById.mockResolvedValue(TaxonomyNodeDTOMock.createTaxonomyNode());
	mockTaxonomyNodeQueries.getByType.mockResolvedValue(TaxonomyNodeDTOMock.createTaxonomyNodeArray(2, 'portfolio'));
	mockTaxonomyNodeQueries.getByParentId.mockResolvedValue(TaxonomyNodeDTOMock.createTaxonomyNodeArray(2, 'line'));
	mockTaxonomyNodeQueries.getFullHierarchy.mockResolvedValue(TaxonomyNodeDTOMock.createHierarchyWithChildren());
	mockTaxonomyNodeQueries.getActiveNodes.mockResolvedValue(TaxonomyNodeDTOMock.createMixedActiveNodes().filter(node => node.isActive));
	mockTaxonomyNodeQueries.searchNodes.mockResolvedValue(TaxonomyNodeDTOMock.createNodesForSearchTesting());
	mockTaxonomyNodeQueries.getNodePath.mockResolvedValue([TaxonomyNodeDTOMock.createTaxonomyNode()]);
	mockTaxonomyNodeQueries.getNodeDescendants.mockResolvedValue(TaxonomyNodeDTOMock.createTaxonomyNodeArray(2));
	mockTaxonomyNodeQueries.getValidParents.mockResolvedValue(TaxonomyNodeDTOMock.createTaxonomyNodeArray(1, 'portfolio'));
}

/**
 * Set specific mock return values for testing scenarios
 */
export const mockTaxonomyNodeQueryScenarios = {
	/**
	 * Simulate empty database
	 */
	emptyDatabase: () => {
		mockTaxonomyNodeQueries.getAll.mockResolvedValue([]);
		mockTaxonomyNodeQueries.getFullHierarchy.mockResolvedValue([]);
		mockTaxonomyNodeQueries.getActiveNodes.mockResolvedValue([]);
	},

	/**
	 * Simulate loading state
	 */
	loading: () => {
		Object.values(mockTaxonomyNodeQueries).forEach(mock => {
			mock.mockImplementation(() => new Promise(resolve => {
				// Never resolve to simulate loading
			}));
		});
	},

	/**
	 * Simulate error state
	 */
	error: (errorMessage: string = 'Query failed') => {
		const error = new Error(errorMessage);
		Object.values(mockTaxonomyNodeQueries).forEach(mock => {
			mock.mockRejectedValue(error);
		});
	},

	/**
	 * Simulate successful hierarchical data
	 */
	successfulHierarchy: () => {
		const hierarchy = TaxonomyNodeDTOMock.createHierarchyWithChildren();
		mockTaxonomyNodeQueries.getFullHierarchy.mockResolvedValue(hierarchy);
		
		// Set up other queries to return consistent data
		const allNodes = hierarchy.flatMap(portfolio => [
			portfolio,
			...portfolio.children.flatMap(line => [
				line,
				...line.children
			])
		]);
		
		mockTaxonomyNodeQueries.getAll.mockResolvedValue(allNodes);
		mockTaxonomyNodeQueries.getByType.mockImplementation((type: string) => 
			Promise.resolve(allNodes.filter(node => node.type === type))
		);
	},

	/**
	 * Simulate search results
	 */
	searchResults: (searchTerm: string) => {
		const allNodes = TaxonomyNodeDTOMock.createNodesForSearchTesting();
		const filtered = allNodes.filter(node => 
			node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			node.description.toLowerCase().includes(searchTerm.toLowerCase())
		);
		mockTaxonomyNodeQueries.searchNodes.mockResolvedValue(filtered);
	},

	/**
	 * Simulate filtered results by type
	 */
	filteredByType: (type: string) => {
		const allNodes = TaxonomyNodeDTOMock.createMixedTypeNodes();
		const filtered = type === 'all' ? allNodes : allNodes.filter(node => node.type === type);
		mockTaxonomyNodeQueries.getByType.mockResolvedValue(filtered);
	},

	/**
	 * Simulate active/inactive filtering
	 */
	filteredByActive: (activeOnly: boolean) => {
		const allNodes = TaxonomyNodeDTOMock.createMixedActiveNodes();
		const filtered = activeOnly ? allNodes.filter(node => node.isActive) : allNodes;
		mockTaxonomyNodeQueries.getActiveNodes.mockResolvedValue(filtered);
	},

	/**
	 * Simulate node with specific ID found
	 */
	nodeFound: (nodeId: string) => {
		const node = TaxonomyNodeDTOMock.createTaxonomyNode({ _id: nodeId });
		mockTaxonomyNodeQueries.getById.mockResolvedValue(node);
		return node;
	},

	/**
	 * Simulate node with specific ID not found
	 */
	nodeNotFound: () => {
		mockTaxonomyNodeQueries.getById.mockResolvedValue(null);
	},

	/**
	 * Simulate valid parent options for node type
	 */
	validParents: (nodeType: string) => {
		switch (nodeType) {
			case 'portfolio':
				mockTaxonomyNodeQueries.getValidParents.mockResolvedValue([]);
				break;
			case 'line':
				mockTaxonomyNodeQueries.getValidParents.mockResolvedValue(
					TaxonomyNodeDTOMock.createTaxonomyNodeArray(2, 'portfolio')
				);
				break;
			case 'category':
				mockTaxonomyNodeQueries.getValidParents.mockResolvedValue(
					TaxonomyNodeDTOMock.createTaxonomyNodeArray(2, 'line')
				);
				break;
			default:
				mockTaxonomyNodeQueries.getValidParents.mockResolvedValue([]);
		}
	}
};

// Initialize with default values
resetTaxonomyNodeQueryMocks();