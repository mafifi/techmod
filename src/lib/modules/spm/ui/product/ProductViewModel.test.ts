import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductDTOMock } from '../../domain/ProductDTOMock';
import { ProductViewModel } from './ProductViewModel.svelte';
import {
	mockProductQueries,
	resetProductQueryMocks
} from '../../../../../convex/spm/product/query.mock';
import {
	mockProductMutations,
	resetProductMutationMocks
} from '../../../../../convex/spm/product/mutations.mock';

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
			product: {
				query: mockProductQueries,
				mutations: mockProductMutations
			}
		}
	}
}));

describe('ProductViewModel', () => {
	let viewModel: ProductViewModel;
	let mockUseQuery: ReturnType<typeof vi.fn>;
	let mockUseConvexClient: ReturnType<typeof vi.fn>;
	let mockConvexClient: { mutation: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		mockUseQuery = vi.mocked(useQuery);
		mockUseConvexClient = vi.mocked(useConvexClient);

		// Setup mock Convex client
		mockConvexClient = {
			mutation: vi.fn()
		};

		mockUseConvexClient.mockReturnValue(mockConvexClient);

		// Reset all mocks including our centralized mocks
		vi.clearAllMocks();
		resetProductQueryMocks();
		resetProductMutationMocks();
	});

	describe('MVVM Contract Compliance', () => {
		it('should expose exactly three derived values: isLoading, error, data', () => {
			// Mock successful state
			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: ProductDTOMock.createProductArray(3)
			});

			viewModel = new ProductViewModel();

			// Check that all three required derived values exist
			expect(viewModel).toHaveProperty('isLoading');
			expect(viewModel).toHaveProperty('error');
			expect(viewModel).toHaveProperty('data');

			// Check that they are derived correctly
			expect(viewModel.isLoading).toBe(false);
			expect(viewModel.error).toBe(null);
			expect(viewModel.data).toHaveLength(3);
		});

		it('should handle loading state correctly', () => {
			mockUseQuery.mockReturnValue({
				isLoading: true,
				error: null,
				data: undefined
			});

			viewModel = new ProductViewModel();

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

			viewModel = new ProductViewModel();

			expect(viewModel.isLoading).toBe(false);
			expect(viewModel.error).toBe(mockError);
			expect(viewModel.data).toEqual([]);
		});
	});

	describe('Business Actions', () => {
		beforeEach(() => {
			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: ProductDTOMock.createProductArray(3)
			});

			viewModel = new ProductViewModel();
		});

		describe('createProduct', () => {
			it('should call create mutation with product data', async () => {
				const newProduct = ProductDTOMock.createProductProps();
				mockConvexClient.mutation.mockResolvedValue('new_product_id');

				await viewModel.createProduct(newProduct);

				expect(mockConvexClient.mutation).toHaveBeenCalledTimes(1);
			});

			it('should handle create mutation errors', async () => {
				const error = new Error('Create failed');
				mockConvexClient.mutation.mockRejectedValue(error);
				const newProduct = ProductDTOMock.createProductProps();

				await expect(viewModel.createProduct(newProduct)).rejects.toThrow('Create failed');
			});
		});

		describe('updateProduct', () => {
			it('should call update mutation with ID and product data', async () => {
				const productId = 'product_123';
				const updateData = ProductDTOMock.createProductProps();
				mockConvexClient.mutation.mockResolvedValue(undefined);

				await viewModel.updateProduct(productId, updateData);

				expect(mockConvexClient.mutation).toHaveBeenCalledTimes(1);
			});

			it('should handle update mutation errors', async () => {
				const error = new Error('Update failed');
				mockConvexClient.mutation.mockRejectedValue(error);
				const productId = 'product_123';
				const updateData = ProductDTOMock.createProductProps();

				await expect(viewModel.updateProduct(productId, updateData)).rejects.toThrow(
					'Update failed'
				);
			});
		});

		describe('deleteProduct', () => {
			it('should call delete mutation with product ID', async () => {
				const productId = 'product_123';
				mockConvexClient.mutation.mockResolvedValue(undefined);

				await viewModel.deleteProduct(productId);

				expect(mockConvexClient.mutation).toHaveBeenCalledTimes(1);
			});

			it('should handle delete mutation errors', async () => {
				const error = new Error('Delete failed');
				mockConvexClient.mutation.mockRejectedValue(error);
				const productId = 'product_123';

				await expect(viewModel.deleteProduct(productId)).rejects.toThrow('Delete failed');
			});
		});
	});

	describe('Business Logic Helpers', () => {
		beforeEach(() => {
			const mockData = [
				...ProductDTOMock.createProductArray(2, { taxonomyNodeId: 'taxonomy_node_1', price: 100 }),
				...ProductDTOMock.createProductArray(2, { taxonomyNodeId: 'taxonomy_node_2', price: 200 })
			];

			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: mockData
			});

			viewModel = new ProductViewModel();
		});

		describe('getProductsByTaxonomyNode', () => {
			it('should filter products by taxonomy node', () => {
				const node1Products = viewModel.getProductsByTaxonomyNode('taxonomy_node_1');
				const node2Products = viewModel.getProductsByTaxonomyNode('taxonomy_node_2');

				expect(node1Products).toHaveLength(2);
				expect(node2Products).toHaveLength(2);

				node1Products.forEach((product) => {
					expect(product.taxonomyNodeId).toBe('taxonomy_node_1');
				});
			});

			it('should return empty array for non-existent taxonomy node', () => {
				const result = viewModel.getProductsByTaxonomyNode('NonExistent');
				expect(result).toEqual([]);
			});
		});

		describe('getProductsInPriceRange', () => {
			it('should filter products within price range', () => {
				const results = viewModel.getProductsInPriceRange(150, 250);

				expect(results).toHaveLength(2);
				results.forEach((product) => {
					expect(product.price).toBeGreaterThanOrEqual(150);
					expect(product.price).toBeLessThanOrEqual(250);
				});
			});

			it('should return empty array when no products in range', () => {
				const results = viewModel.getProductsInPriceRange(1000, 2000);
				expect(results).toEqual([]);
			});
		});

		describe('getTotalValue', () => {
			it('should calculate total value of all products', () => {
				const total = viewModel.getTotalValue();
				// 2 products at 100 + 2 products at 200 = 600
				expect(total).toBe(600);
			});

			it('should return 0 for empty product list', () => {
				mockUseQuery.mockReturnValue({
					isLoading: false,
					error: null,
					data: []
				});

				viewModel = new ProductViewModel();
				const total = viewModel.getTotalValue();
				expect(total).toBe(0);
			});
		});
	});
});
