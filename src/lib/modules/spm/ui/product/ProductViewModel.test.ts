import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductDTOMock } from '../../domain/ProductDTOMock';
import { ProductViewModel } from './ProductViewModel.svelte';

// Mock Convex hooks
vi.mock('convex-svelte', () => ({
	useQuery: vi.fn(),
	useConvexClient: vi.fn()
}));

// Mock API objects
const mockQueryGetAll = { mock: 'query_getAll' };
const mockMutationCreate = { mock: 'mutation_create' };
const mockMutationUpdateById = { mock: 'mutation_updateById' };
const mockMutationDeleteById = { mock: 'mutation_deleteById' };

vi.mock('../../../../convex/_generated/api', () => ({
	api: {
		spm: {
			product: {
				query: { getAll: mockQueryGetAll },
				mutations: { 
					create: mockMutationCreate,
					updateById: mockMutationUpdateById,
					deleteById: mockMutationDeleteById
				}
			}
		}
	}
}));

describe('ProductViewModel', () => {
	let viewModel: ProductViewModel;
	let mockUseQuery: any;
	let mockUseConvexClient: any;
	let mockConvexClient: any;

	beforeEach(async () => {
		const { useQuery, useConvexClient } = await import('convex-svelte');
		mockUseQuery = useQuery as any;
		mockUseConvexClient = useConvexClient as any;

		// Setup mock Convex client
		mockConvexClient = {
			mutation: vi.fn()
		};

		mockUseConvexClient.mockReturnValue(mockConvexClient);

		// Reset all mocks
		vi.clearAllMocks();
		
		// Clear any previous $derived calls
		vi.clearAllMocks();
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

				await expect(viewModel.updateProduct(productId, updateData)).rejects.toThrow('Update failed');
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
				...ProductDTOMock.createProductArray(2, { category: 'Software', price: 100 }),
				...ProductDTOMock.createProductArray(2, { category: 'Hardware', price: 200 }),
			];

			mockUseQuery.mockReturnValue({
				isLoading: false,
				error: null,
				data: mockData
			});

			viewModel = new ProductViewModel();
		});

		describe('getProductsByCategory', () => {
			it('should filter products by category', () => {
				const softwareProducts = viewModel.getProductsByCategory('Software');
				const hardwareProducts = viewModel.getProductsByCategory('Hardware');

				expect(softwareProducts).toHaveLength(2);
				expect(hardwareProducts).toHaveLength(2);
				
				softwareProducts.forEach(product => {
					expect(product.category).toBe('Software');
				});
			});

			it('should return empty array for non-existent category', () => {
				const result = viewModel.getProductsByCategory('NonExistent');
				expect(result).toEqual([]);
			});
		});

		describe('getProductsInPriceRange', () => {
			it('should filter products within price range', () => {
				const results = viewModel.getProductsInPriceRange(150, 250);
				
				expect(results).toHaveLength(2);
				results.forEach(product => {
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