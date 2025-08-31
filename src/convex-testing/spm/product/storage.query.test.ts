import { describe, it, expect, beforeEach } from 'vitest';
import { ConvexMock } from '../../testing/ConvexMock';
import { ProductDTOMock } from '../../lib/modules/spm/domain/ProductDTOMock';
import { getAll, getById, getByCategory, getInPriceRange } from '../../convex/spm/product/storage.query';

describe('Product Storage Queries', () => {
	let mockCtx: ReturnType<typeof ConvexMock.createMockQueryCtx>;
	const mockProducts = ProductDTOMock.createProductArray(5);

	beforeEach(() => {
		ConvexMock.resetAllMocks();
		mockCtx = ConvexMock.createMockQueryCtx({
			tableData: { 
				products: mockProducts 
			}
		});
	});

	describe('getAll', () => {
		it('should return all products from database', async () => {
			const result = await getAll(mockCtx, {});

			expect(mockCtx.db.query).toHaveBeenCalledWith('products');
			expect(result).toEqual(mockProducts);
		});

		it('should return empty array when no products exist', async () => {
			const emptyCtx = ConvexMock.createMockQueryCtx({
				tableData: { products: [] }
			});

			const result = await getAll(emptyCtx, {});

			expect(result).toEqual([]);
		});
	});

	describe('getById', () => {
		it('should return product by ID', async () => {
			const mockProduct = mockProducts[0];
			mockCtx.db.get.mockResolvedValue(mockProduct);

			const result = await getById(mockCtx, { id: mockProduct._id as any });

			expect(mockCtx.db.get).toHaveBeenCalledWith(mockProduct._id);
			expect(result).toEqual(mockProduct);
		});

		it('should return null for non-existent ID', async () => {
			mockCtx.db.get.mockResolvedValue(null);

			const result = await getById(mockCtx, { id: 'non_existent_id' as any });

			expect(mockCtx.db.get).toHaveBeenCalledWith('non_existent_id');
			expect(result).toBeNull();
		});
	});

	describe('getByCategory', () => {
		it('should return products filtered by category', async () => {
			const category = 'Software';
			const softwareProducts = mockProducts.filter(p => p.category === category);

			// Mock the query builder chain
			const mockQueryBuilder = {
				filter: vi.fn().mockReturnThis(),
				collect: vi.fn().mockResolvedValue(softwareProducts)
			};
			mockCtx.db.query.mockReturnValue(mockQueryBuilder);

			const result = await getByCategory(mockCtx, { category });

			expect(mockCtx.db.query).toHaveBeenCalledWith('products');
			expect(mockQueryBuilder.filter).toHaveBeenCalled();
			expect(result).toEqual(softwareProducts);
		});

		it('should return empty array for category with no products', async () => {
			const mockQueryBuilder = {
				filter: vi.fn().mockReturnThis(),
				collect: vi.fn().mockResolvedValue([])
			};
			mockCtx.db.query.mockReturnValue(mockQueryBuilder);

			const result = await getByCategory(mockCtx, { category: 'NonExistentCategory' });

			expect(result).toEqual([]);
		});
	});

	describe('getInPriceRange', () => {
		it('should return products within price range', async () => {
			const minPrice = 50;
			const maxPrice = 150;
			const productsInRange = mockProducts.filter(
				p => p.price >= minPrice && p.price <= maxPrice
			);

			const mockQueryBuilder = {
				filter: vi.fn().mockReturnThis(),
				collect: vi.fn().mockResolvedValue(productsInRange)
			};
			mockCtx.db.query.mockReturnValue(mockQueryBuilder);

			const result = await getInPriceRange(mockCtx, { minPrice, maxPrice });

			expect(mockCtx.db.query).toHaveBeenCalledWith('products');
			expect(mockQueryBuilder.filter).toHaveBeenCalled();
			expect(result).toEqual(productsInRange);
		});

		it('should return empty array when no products in range', async () => {
			const mockQueryBuilder = {
				filter: vi.fn().mockReturnThis(),
				collect: vi.fn().mockResolvedValue([])
			};
			mockCtx.db.query.mockReturnValue(mockQueryBuilder);

			const result = await getInPriceRange(mockCtx, { 
				minPrice: 10000, 
				maxPrice: 20000 
			});

			expect(result).toEqual([]);
		});

		it('should handle edge case where minPrice equals maxPrice', async () => {
			const exactPrice = 99.99;
			const exactProducts = mockProducts.filter(p => p.price === exactPrice);

			const mockQueryBuilder = {
				filter: vi.fn().mockReturnThis(),
				collect: vi.fn().mockResolvedValue(exactProducts)
			};
			mockCtx.db.query.mockReturnValue(mockQueryBuilder);

			const result = await getInPriceRange(mockCtx, { 
				minPrice: exactPrice, 
				maxPrice: exactPrice 
			});

			expect(result).toEqual(exactProducts);
		});
	});
});