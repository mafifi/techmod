import { vi } from 'vitest';
import { TaxonomyNodeDTOMock } from '../../domain/TaxonomyNodeDTOMock';
import type { TaxonomyNode, TaxonomyNodeProps, TaxonomyNodeType } from '../../domain/TaxonomyNodeDTO';
import type { Id } from '../../../../../convex/_generated/dataModel';

/**
 * Shared testing utilities for taxonomy components
 * Provides mocks, helpers, and common test patterns
 */
export class TaxonomyTestUtils {
	/**
	 * Create a mock Convex useQuery return value
	 */
	static createMockQueryReturn(overrides: {
		isLoading?: boolean;
		error?: Error | null;
		data?: any;
	} = {}) {
		return {
			isLoading: false,
			error: null,
			data: undefined,
			...overrides
		};
	}

	/**
	 * Create a mock Convex client for mutations
	 */
	static createMockConvexClient() {
		return {
			mutation: vi.fn()
		};
	}

	/**
	 * Create mock hierarchy query data for TaxonomyViewModel
	 */
	static createMockHierarchyData() {
		return TaxonomyNodeDTOMock.createHierarchyWithChildren();
	}

	/**
	 * Create a mock TaxonomyViewModel for component testing
	 */
	static createMockTaxonomyViewModel(overrides: Partial<TaxonomyViewModel> = {}) {
		const defaultViewModel = {
			// MVVM contract properties
			isLoading: false,
			error: null,
			data: TaxonomyNodeDTOMock.createHierarchyWithChildren(),

			// State properties
			searchTerm: '',
			selectedType: 'all' as TaxonomyNodeType | 'all',
			activeOnly: true,
			expandedNodes: new Set<string>(),

			// Methods
			toggleNodeExpansion: vi.fn(),
			expandNode: vi.fn(),
			collapseNode: vi.fn(),
			expandAll: vi.fn(),
			collapseAll: vi.fn(),
			isNodeExpanded: vi.fn().mockReturnValue(false),

			// CRUD methods
			createNode: vi.fn().mockResolvedValue('new_node_id'),
			updateNode: vi.fn().mockResolvedValue(true),
			deleteNode: vi.fn().mockResolvedValue(true),
			deactivateNode: vi.fn().mockResolvedValue(true),
			reactivateNode: vi.fn().mockResolvedValue(true),
			moveNode: vi.fn().mockResolvedValue(true),

			// Helper methods
			getValidParentOptions: vi.fn().mockReturnValue([]),
			getNodeById: vi.fn(),
			getBreadcrumbPath: vi.fn().mockReturnValue([]),

			...overrides
		};

		return defaultViewModel;
	}

	/**
	 * Mock user interactions for testing
	 */
	static createMockUserInteractions() {
		return {
			currentUserId: 'test_user_123',
			onCreateChild: vi.fn(),
			onEdit: vi.fn(),
			onDelete: vi.fn(),
			onMove: vi.fn(),
			onSubmit: vi.fn(),
			onCancel: vi.fn()
		};
	}

	/**
	 * Mock toast notifications for testing
	 */
	static mockToast() {
		return {
			success: vi.fn(),
			error: vi.fn(),
			info: vi.fn(),
			warning: vi.fn()
		};
	}

	/**
	 * Helper to simulate async operations with delays
	 */
	static async simulateAsyncOperation(
		duration: number = 100,
		shouldSucceed: boolean = true
	): Promise<any> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (shouldSucceed) {
					resolve('success');
				} else {
					reject(new Error('Simulated failure'));
				}
			}, duration);
		});
	}

	/**
	 * Create mock form data for dialog testing
	 */
	static createMockFormData(nodeType: TaxonomyNodeType) {
		switch (nodeType) {
			case 'portfolio':
				return TaxonomyNodeDTOMock.createPortfolioProps({
					name: 'Test Portfolio',
					description: 'Test portfolio description'
				});
			case 'line':
				return TaxonomyNodeDTOMock.createLineProps('parent_portfolio_id', {
					name: 'Test Line',
					description: 'Test line description'
				});
			case 'category':
				return TaxonomyNodeDTOMock.createCategoryProps('parent_line_id', {
					name: 'Test Category',
					description: 'Test category description'
				});
			default:
				return TaxonomyNodeDTOMock.createTaxonomyNodeProps();
		}
	}

	/**
	 * Create mock validation errors for form testing
	 */
	static createMockValidationErrors() {
		return {
			nameRequired: { name: 'Name is required' },
			nameTooLong: { name: 'Name must be 100 characters or less' },
			descriptionRequired: { description: 'Description is required' },
			descriptionTooShort: { description: 'Description must be at least 10 characters' },
			descriptionTooLong: { description: 'Description must be 1000 characters or less' },
			strategyTooShort: { strategy: 'Strategy must be at least 5 characters' },
			strategyTooLong: { strategy: 'Strategy must be 2000 characters or less' },
			parentRequired: { parentId: 'Parent is required for this node type' },
			invalidParent: { parentId: 'Invalid parent selection for this node type' }
		};
	}

	/**
	 * Mock window.confirm for delete dialog testing
	 */
	static mockWindowConfirm(returnValue: boolean = true) {
		Object.defineProperty(window, 'confirm', {
			value: vi.fn().mockReturnValue(returnValue),
			writable: true
		});
	}

	/**
	 * Create test data for tree drag and drop operations
	 */
	static createDragDropTestData() {
		const hierarchy = TaxonomyNodeDTOMock.createHierarchyWithChildren();
		const sourceNode = hierarchy[0].children[0]; // First line
		const targetNode = hierarchy[1]; // Second portfolio
		
		return {
			sourceNode,
			targetNode,
			dragEvent: {
				dataTransfer: {
					getData: vi.fn().mockReturnValue(JSON.stringify({
						nodeId: sourceNode._id,
						nodeType: sourceNode.type
					})),
					setData: vi.fn()
				},
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			},
			dropEvent: {
				dataTransfer: {
					getData: vi.fn().mockReturnValue(JSON.stringify({
						nodeId: sourceNode._id,
						nodeType: sourceNode.type
					}))
				},
				preventDefault: vi.fn(),
				stopPropagation: vi.fn(),
				currentTarget: {
					dataset: {
						nodeId: targetNode._id,
						nodeType: targetNode.type
					}
				}
			}
		};
	}

	/**
	 * Helper to simulate search functionality
	 */
	static createSearchTestScenarios() {
		const nodes = TaxonomyNodeDTOMock.createNodesForSearchTesting();
		
		return {
			nodes,
			scenarios: [
				{
					searchTerm: 'Digital',
					expectedMatches: ['Digital Portfolio'],
					description: 'Should match by name'
				},
				{
					searchTerm: 'transformation',
					expectedMatches: ['Digital Portfolio'],
					description: 'Should match by description'
				},
				{
					searchTerm: 'legacy',
					expectedMatches: ['Legacy Systems'],
					description: 'Should match case-insensitive'
				},
				{
					searchTerm: 'innovation',
					expectedMatches: ['Innovation Hub'],
					description: 'Should match in name and description'
				},
				{
					searchTerm: 'nonexistent',
					expectedMatches: [],
					description: 'Should return no matches'
				}
			]
		};
	}

	/**
	 * Helper to simulate filtering functionality
	 */
	static createFilterTestScenarios() {
		const mixedNodes = TaxonomyNodeDTOMock.createMixedTypeNodes();
		const activeNodes = TaxonomyNodeDTOMock.createMixedActiveNodes();
		
		return {
			mixedNodes,
			activeNodes,
			typeFilters: [
				{
					filter: 'portfolio',
					expectedCount: 1,
					description: 'Should show only portfolios'
				},
				{
					filter: 'line',
					expectedCount: 1,
					description: 'Should show only lines'
				},
				{
					filter: 'category',
					expectedCount: 1,
					description: 'Should show only categories'
				},
				{
					filter: 'all',
					expectedCount: 3,
					description: 'Should show all types'
				}
			],
			activeFilters: [
				{
					activeOnly: true,
					expectedCount: 2,
					description: 'Should show only active nodes'
				},
				{
					activeOnly: false,
					expectedCount: 3,
					description: 'Should show all nodes regardless of status'
				}
			]
		};
	}

	/**
	 * Mock browser APIs that might be used in components
	 */
	static mockBrowserAPIs() {
		// Mock localStorage
		const localStorageMock = (() => {
			let store: { [key: string]: string } = {};
			return {
				getItem: vi.fn((key: string) => store[key] || null),
				setItem: vi.fn((key: string, value: string) => {
					store[key] = String(value);
				}),
				removeItem: vi.fn((key: string) => {
					delete store[key];
				}),
				clear: vi.fn(() => {
					store = {};
				})
			};
		})();

		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock
		});

		// Mock ResizeObserver
		(globalThis as any).ResizeObserver = vi.fn().mockImplementation(() => ({
			observe: vi.fn(),
			unobserve: vi.fn(),
			disconnect: vi.fn()
		}));

		// Mock IntersectionObserver
		(globalThis as any).IntersectionObserver = vi.fn().mockImplementation(() => ({
			observe: vi.fn(),
			unobserve: vi.fn(),
			disconnect: vi.fn()
		}));
	}

	/**
	 * Assert helpers for common test patterns
	 */
	static assertions = {
		/**
		 * Assert that a node matches expected properties
		 */
		nodeMatches: (actual: TaxonomyNode, expected: Partial<TaxonomyNode>) => {
			Object.entries(expected).forEach(([key, value]) => {
				expect(actual[key as keyof TaxonomyNode]).toEqual(value);
			});
		},

		/**
		 * Assert that an array contains nodes with specific names
		 */
		nodesContainNames: (nodes: TaxonomyNode[], expectedNames: string[]) => {
			const actualNames = nodes.map(node => node.name);
			expectedNames.forEach(name => {
				expect(actualNames).toContain(name);
			});
		},

		/**
		 * Assert that all nodes in array match a condition
		 */
		allNodesMatch: (nodes: TaxonomyNode[], condition: (node: TaxonomyNode) => boolean) => {
			nodes.forEach(node => {
				expect(condition(node)).toBe(true);
			});
		},

		/**
		 * Assert that hierarchy structure is correct
		 */
		hierarchyIsValid: (hierarchy: any[]) => {
			hierarchy.forEach(portfolio => {
				expect(portfolio.type).toBe('portfolio');
				expect(portfolio.parentId).toBeNull();
				expect(Array.isArray(portfolio.children)).toBe(true);
				
				portfolio.children.forEach((line: any) => {
					expect(line.type).toBe('line');
					expect(line.parentId).toBe(portfolio._id);
					expect(Array.isArray(line.children)).toBe(true);
					
					line.children.forEach((category: any) => {
						expect(category.type).toBe('category');
						expect(category.parentId).toBe(line._id);
						expect(Array.isArray(category.children)).toBe(true);
					});
				});
			});
		}
	};
}

// Type definition for mock TaxonomyViewModel (for TypeScript inference)
interface TaxonomyViewModel {
	isLoading: boolean;
	error: string | null;
	data: any[];
	searchTerm: string;
	selectedType: TaxonomyNodeType | 'all';
	activeOnly: boolean;
	expandedNodes: Set<string>;
	toggleNodeExpansion: (nodeId: string) => void;
	expandNode: (nodeId: string) => void;
	collapseNode: (nodeId: string) => void;
	expandAll: () => void;
	collapseAll: () => void;
	isNodeExpanded: (nodeId: string) => boolean;
	createNode: (nodeData: TaxonomyNodeProps) => Promise<Id<'taxonomyNodes'> | null>;
	updateNode: (nodeId: Id<'taxonomyNodes'>, updates: Partial<TaxonomyNodeProps>, updatedBy: string, reason?: string) => Promise<boolean>;
	deleteNode: (nodeId: Id<'taxonomyNodes'>, updatedBy: string, forceDelete?: boolean) => Promise<boolean>;
	deactivateNode: (nodeId: Id<'taxonomyNodes'>, updatedBy: string, cascadeToChildren?: boolean, reason?: string) => Promise<boolean>;
	reactivateNode: (nodeId: Id<'taxonomyNodes'>, updatedBy: string, reason?: string) => Promise<boolean>;
	moveNode: (nodeId: Id<'taxonomyNodes'>, newParentId: Id<'taxonomyNodes'> | null, updatedBy: string, reason?: string) => Promise<boolean>;
	getValidParentOptions: (nodeType: TaxonomyNodeType, excludeNodeId?: string) => any[];
	getNodeById: (nodeId: string) => any | null;
	getBreadcrumbPath: (nodeId: string) => any[];
}