// (Type checking intentionally left enabled for tests)
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaxonomyNodeDTOMock } from '../../domain/TaxonomyNodeDTOMock';
import { TaxonomyViewModel } from './TaxonomyViewModel.svelte';
import { TaxonomyTestUtils } from './TaxonomyTestUtils';
import type { TaxonomyHierarchyNode } from '../../domain/TaxonomyNodeDTO';
import {
	mockTaxonomyNodeQueries,
	resetTaxonomyNodeQueryMocks
} from '../../../../../convex/spm/taxonomyNode/query.mock';
import {
	mockTaxonomyNodeMutations,
	resetTaxonomyNodeMutationMocks
} from '../../../../../convex/spm/taxonomyNode/mutations.mock';

// Mock Convex hooks
vi.mock('convex-svelte', () => ({
	useQuery: vi.fn(),
	useConvexClient: vi.fn()
}));

// Import the mocked functions after the mock
import { useQuery, useConvexClient } from 'convex-svelte';

// Mock API using our centralized mock objects
vi.mock('../../../../convex/_generated/api', () => ({
	api: {
		spm: {
			taxonomyNode: {
				query: mockTaxonomyNodeQueries,
				mutations: mockTaxonomyNodeMutations
			}
		}
	}
}));

describe('TaxonomyViewModel', () => {
	let viewModel: TaxonomyViewModel;
	let mockUseQuery: ReturnType<typeof vi.fn>;
	let mockUseConvexClient: ReturnType<typeof vi.fn>;
	let mockConvexClient: { mutation: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		mockUseQuery = vi.mocked(useQuery);
		mockUseConvexClient = vi.mocked(useConvexClient);

		// Setup mock Convex client
		mockConvexClient = TaxonomyTestUtils.createMockConvexClient();
		mockUseConvexClient.mockReturnValue(mockConvexClient);

		// Reset all mocks including our centralized mocks
		vi.clearAllMocks();
		resetTaxonomyNodeQueryMocks();
		resetTaxonomyNodeMutationMocks();

		// Reset mock data counter for predictable tests
		TaxonomyNodeDTOMock.resetCounter();
	});

	describe('MVVM Contract Compliance', () => {
		it('should expose exactly three derived values: isLoading, error, data', () => {
			// Mock successful state
			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: TaxonomyNodeDTOMock.createHierarchyWithChildren()
			});

			viewModel = new TaxonomyViewModel();

			// Check that all three required derived values exist
			expect(viewModel).toHaveProperty('isLoading');
			expect(viewModel).toHaveProperty('error');
			expect(viewModel).toHaveProperty('data');

			// Check that they are derived correctly
			expect(viewModel.isLoading).toBe(false);
			expect(viewModel.error).toBe(null);
			expect(viewModel.data).toHaveLength(2); // From createHierarchyWithChildren
		});

		it('should handle loading state correctly', () => {
			mockUseQuery.mockReturnValue({
				isLoading: true,
				error: null,
				data: undefined
			});

			viewModel = new TaxonomyViewModel();

			expect(viewModel.isLoading).toBe(true);
			expect(viewModel.error).toBe(null);
			expect(viewModel.data).toEqual([]);
		});

		it('should handle error state correctly', () => {
			const mockError = new Error('Query failed');
			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: mockError,
				data: undefined
			});

			viewModel = new TaxonomyViewModel();

			expect(viewModel.isLoading).toBe(false);
			expect(viewModel.error).toBe('Query failed');
			expect(viewModel.data).toEqual([]);
		});
	});

	describe('State Management', () => {
		beforeEach(() => {
			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: TaxonomyNodeDTOMock.createHierarchyWithChildren()
			});

			viewModel = new TaxonomyViewModel();
		});

		describe('searchTerm', () => {
			it('should initialize with empty search term', () => {
				expect(viewModel.searchTerm).toBe('');
			});

			it('should update search term', () => {
				viewModel.searchTerm = 'Digital';
				expect(viewModel.searchTerm).toBe('Digital');
			});

			it('should filter data based on search term', () => {
				// Use hierarchical search test data
				const searchData = TaxonomyNodeDTOMock.createNodesForSearchTesting().map((node) => ({
					...node,
					children: [] // Ensure hierarchical structure
				}));
				mockUseQuery.mockReturnValue({
					isLoading: false,
					error: null,
					data: searchData
				});
				viewModel = new TaxonomyViewModel();

				// Test name matching
				viewModel.searchTerm = 'Digital';
				const filteredData = viewModel.data;
				expect(filteredData).toBeDefined();
				expect(Array.isArray(filteredData)).toBe(true);

				// Test description matching
				viewModel.searchTerm = 'transformation';
				const descriptionFiltered = viewModel.data;
				expect(descriptionFiltered).toBeDefined();
				expect(Array.isArray(descriptionFiltered)).toBe(true);
			});
		});

		describe('selectedType', () => {
			it('should initialize with "all" type filter', () => {
				expect(viewModel.selectedType).toBe('all');
			});

			it('should update selected type', () => {
				viewModel.selectedType = 'portfolio';
				expect(viewModel.selectedType).toBe('portfolio');

				viewModel.selectedType = 'line';
				expect(viewModel.selectedType).toBe('line');

				viewModel.selectedType = 'category';
				expect(viewModel.selectedType).toBe('category');
			});

			it('should filter data based on selected type', () => {
				const mixedData = TaxonomyNodeDTOMock.createMixedTypeNodes();
				mockUseQuery.mockReturnValue({
					isLoading: false,
					error: null,
					data: [
						{
							...mixedData[0],
							children: [{ ...mixedData[1], children: [{ ...mixedData[2], children: [] }] }]
						}
					]
				});
				viewModel = new TaxonomyViewModel();

				// Filter by portfolio - should include portfolio with filtered children
				viewModel.selectedType = 'portfolio';
				let filteredData = viewModel.data;
				expect(filteredData).toHaveLength(1);
				expect(filteredData[0].type).toBe('portfolio');

				// Filter by line - should show hierarchy with line nodes
				viewModel.selectedType = 'line';
				filteredData = viewModel.data;
				expect(filteredData).toBeDefined();
				expect(Array.isArray(filteredData)).toBe(true);
				// In hierarchical filtering, parents may be included to show context
				const hasLineNode = (nodes: TaxonomyHierarchyNode[]): boolean => {
					return nodes.some(
						(node) => node.type === 'line' || (node.children && hasLineNode(node.children))
					);
				};
				expect(hasLineNode(filteredData)).toBe(true);
			});
		});

		describe('activeOnly', () => {
			it('should initialize with activeOnly true', () => {
				expect(viewModel.activeOnly).toBe(true);
			});

			it('should update activeOnly filter', () => {
				viewModel.activeOnly = false;
				expect(viewModel.activeOnly).toBe(false);
			});

			it('should trigger query update when activeOnly changes', () => {
				viewModel.activeOnly = false;
				// Check that useQuery was called (the function argument is tested separately)
				expect(mockUseQuery).toHaveBeenCalled();
				expect(viewModel.activeOnly).toBe(false);
			});
		});

		describe('expandedNodes', () => {
			it('should initialize with empty expanded nodes set', () => {
				expect(viewModel.expandedNodes.size).toBe(0);
			});

			it('should manage node expansion state', () => {
				const nodeId = 'test_node_1';

				// Initially collapsed
				expect(viewModel.isNodeExpanded(nodeId)).toBe(false);

				// Expand node
				viewModel.expandNode(nodeId);
				expect(viewModel.isNodeExpanded(nodeId)).toBe(true);
				expect(viewModel.expandedNodes.has(nodeId)).toBe(true);

				// Collapse node
				viewModel.collapseNode(nodeId);
				expect(viewModel.isNodeExpanded(nodeId)).toBe(false);
				expect(viewModel.expandedNodes.has(nodeId)).toBe(false);
			});

			it('should toggle node expansion', () => {
				const nodeId = 'test_node_1';

				// Toggle to expand
				viewModel.toggleNodeExpansion(nodeId);
				expect(viewModel.isNodeExpanded(nodeId)).toBe(true);

				// Toggle to collapse
				viewModel.toggleNodeExpansion(nodeId);
				expect(viewModel.isNodeExpanded(nodeId)).toBe(false);
			});

			it('should expand all nodes', () => {
				viewModel.expandAll();

				// Should expand all nodes in hierarchy
				const allNodeIds = viewModel.data.flatMap((node) => [
					node._id,
					...node.children.flatMap((child: TaxonomyHierarchyNode) => [
						child._id,
						...child.children.map((grandchild: TaxonomyHierarchyNode) => grandchild._id)
					])
				]);

				allNodeIds.forEach((nodeId) => {
					expect(viewModel.isNodeExpanded(nodeId)).toBe(true);
				});
			});

			it('should collapse all nodes', () => {
				// First expand some nodes
				viewModel.expandAll();

				// Then collapse all
				viewModel.collapseAll();
				expect(viewModel.expandedNodes.size).toBe(0);
			});
		});
	});

	describe('Helper Methods', () => {
		beforeEach(() => {
			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: TaxonomyNodeDTOMock.createHierarchyWithChildren()
			});

			viewModel = new TaxonomyViewModel();
		});

		describe('getValidParentOptions', () => {
			it('should return empty array for portfolio nodes', () => {
				const options = viewModel.getValidParentOptions('portfolio');
				expect(options).toEqual([]);
			});

			it('should return active portfolio nodes for line creation', () => {
				const options = viewModel.getValidParentOptions('line');
				// Should filter only portfolio type nodes that are active
				options.forEach((node) => {
					expect(node.type).toBe('portfolio');
					expect(node.isActive).toBe(true);
				});
			});

			it('should return active line nodes for category creation', () => {
				const options = viewModel.getValidParentOptions('category');
				// Should filter only line type nodes that are active
				options.forEach((node) => {
					expect(node.type).toBe('line');
					expect(node.isActive).toBe(true);
				});
			});

			it('should exclude specified node from options', () => {
				const excludeNodeId = viewModel.data[0]._id;
				const options = viewModel.getValidParentOptions('line', excludeNodeId);

				options.forEach((node) => {
					expect(node._id).not.toBe(excludeNodeId);
				});
			});
		});

		describe('getNodeById', () => {
			it('should find and return node by ID', () => {
				const expectedNode = viewModel.data[0];
				const foundNode = viewModel.getNodeById(expectedNode._id);

				expect(foundNode).not.toBeNull();
				expect(foundNode?._id).toBe(expectedNode._id);
			});

			it('should return null for non-existent node ID', () => {
				const foundNode = viewModel.getNodeById('non_existent_id');
				expect(foundNode).toBeNull();
			});

			it('should find deeply nested nodes', () => {
				const hierarchy = viewModel.data;
				const deepNode = hierarchy[0].children[0].children[0];

				const foundNode = viewModel.getNodeById(deepNode._id);
				expect(foundNode).not.toBeNull();
				expect(foundNode?._id).toBe(deepNode._id);
			});
		});

		describe('getBreadcrumbPath', () => {
			it('should return path from root to node', () => {
				const hierarchy = viewModel.data;
				const categoryNode = hierarchy[0].children[0].children[0];

				const path = viewModel.getBreadcrumbPath(categoryNode._id);

				expect(path).toHaveLength(3); // portfolio > line > category
				expect(path[0].type).toBe('portfolio');
				expect(path[1].type).toBe('line');
				expect(path[2].type).toBe('category');
				expect(path[2]._id).toBe(categoryNode._id);
			});

			it('should return single node for root portfolio', () => {
				const portfolioNode = viewModel.data[0];
				const path = viewModel.getBreadcrumbPath(portfolioNode._id);

				expect(path).toHaveLength(1);
				expect(path[0]._id).toBe(portfolioNode._id);
			});

			it('should return empty path for non-existent node', () => {
				const path = viewModel.getBreadcrumbPath('non_existent_id');
				expect(path).toEqual([]);
			});
		});
	});

	describe('Data Filtering and Search', () => {
		beforeEach(() => {
			// Use mixed test data for comprehensive filtering tests
			const searchData = TaxonomyNodeDTOMock.createNodesForSearchTesting();
			const hierarchy = [
				{ ...searchData[0], children: [] },
				{ ...searchData[1], children: [] },
				{ ...searchData[2], children: [] }
			];

			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: hierarchy
			});

			viewModel = new TaxonomyViewModel();
		});

		it('should filter by search term in name', () => {
			viewModel.searchTerm = 'Digital';
			const filtered = viewModel.data;

			expect(filtered.length).toBeGreaterThanOrEqual(1);
			// At least one result should contain 'Digital' in the name
			const hasDigitalInName = filtered.some((node) => node.name.includes('Digital'));
			expect(hasDigitalInName).toBe(true);
		});

		it('should filter by search term in description', () => {
			viewModel.searchTerm = 'transformation';
			const filtered = viewModel.data;

			expect(filtered).toHaveLength(1);
			expect(filtered[0].description).toContain('transformation');
		});

		it('should be case insensitive', () => {
			viewModel.searchTerm = 'DIGITAL';
			const filtered = viewModel.data;

			expect(filtered.length).toBeGreaterThanOrEqual(1);
			// Should find the same results as lowercase
			const hasDigitalMatch = filtered.some(
				(node) =>
					node.name.toLowerCase().includes('digital') ||
					node.description.toLowerCase().includes('digital')
			);
			expect(hasDigitalMatch).toBe(true);
		});

		it('should return empty array for no matches', () => {
			viewModel.searchTerm = 'nonexistent';
			const filtered = viewModel.data;

			expect(filtered).toEqual([]);
		});
	});

	describe('Error Handling', () => {
		it('should handle network errors gracefully', async () => {
			const error = new Error('Request timeout');
			mockConvexClient.mutation.mockRejectedValue(error);
			const nodeData = TaxonomyNodeDTOMock.createTaxonomyNodeProps();

			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: []
			});
			viewModel = new TaxonomyViewModel();

			await expect(viewModel.createNode(nodeData)).rejects.toThrow('Request timeout');
		});

		it('should handle permission errors', async () => {
			const error = new Error('Insufficient permissions');
			mockConvexClient.mutation.mockRejectedValue(error);
			const nodeData = TaxonomyNodeDTOMock.createTaxonomyNodeProps();

			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: []
			});
			viewModel = new TaxonomyViewModel();

			await expect(viewModel.createNode(nodeData)).rejects.toThrow('Insufficient permissions');
		});

		it('should handle database connection errors', async () => {
			const error = new Error('Database connection failed');
			mockConvexClient.mutation.mockRejectedValue(error);
			const nodeData = TaxonomyNodeDTOMock.createTaxonomyNodeProps();

			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: []
			});
			viewModel = new TaxonomyViewModel();

			await expect(viewModel.createNode(nodeData)).rejects.toThrow('Database connection failed');
		});
	});
});
