import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConvexMock } from '../../testing/ConvexMock';
import { ProductDTOMock } from '../../lib/modules/spm/domain/ProductDTOMock';
import { create, updateById, deleteById, updatePrice, bulkUpdateCategory } from '../../convex/spm/product/commands.mutations';

describe('Product Command Mutations', () => {
	let mockCtx: ReturnType<typeof ConvexMock.createMockMutationCtx>;
	const mockProducts = ProductDTOMock.createProductArray(5);

	beforeEach(() => {
		ConvexMock.resetAllMocks();
		mockCtx = ConvexMock.createMockMutationCtx({
			tableData: { 
				products: mockProducts 
			}
		});
	});

	describe('create', () => {
		it('should create new product with valid data', async () => {
			const newProduct = ProductDTOMock.createProductProps();
			const mockId = ConvexMock.createMockId('product');
			
			mockCtx.db.insert.mockResolvedValue(mockId);

			// Call the handler function directly since we can't call the registered mutation
			const result = await mutations.create.handler(mockCtx, newProduct);

			expect(mockCtx.db.insert).toHaveBeenCalledWith('products', newProduct);
			expect(result).toBe(mockId);
		});

		it('should handle Zod validation errors for invalid data', async () => {
			const invalidProduct = ProductDTOMock.createInvalidProductProps().negativePrice;

			// The Zod validation should happen before the handler is called
			// In actual usage, this would be caught by Convex's arg validation
			await expect(async () => {
				await create(mockCtx, invalidProduct as any);
			}).rejects.toThrow();
		});
	});

	describe('updateById', () => {
		it('should update product by ID', async () => {
			const existingProduct = mockProducts[0];
			const updates = ProductDTOMock.createProductProps({ name: 'Updated Product' });
			const updateArgs = { id: existingProduct._id as any, ...updates };

			await updateById(mockCtx, updateArgs);

			expect(mockCtx.db.patch).toHaveBeenCalledWith(existingProduct._id, updates);
		});

		it('should handle partial updates', async () => {
			const existingProduct = mockProducts[0];
			const partialUpdate = { id: existingProduct._id as any, price: 199.99 };

			await updateById(mockCtx, partialUpdate as any);

			expect(mockCtx.db.patch).toHaveBeenCalledWith(existingProduct._id, { price: 199.99 });
		});
	});

	describe('deleteById', () => {
		it('should delete product by ID', async () => {
			const productToDelete = mockProducts[0];

			await deleteById(mockCtx, { id: productToDelete._id as any });

			expect(mockCtx.db.delete).toHaveBeenCalledWith(productToDelete._id);
		});

		it('should handle deletion of non-existent product', async () => {
			const nonExistentId = 'non_existent_id';

			await deleteById(mockCtx, { id: nonExistentId as any });

			expect(mockCtx.db.delete).toHaveBeenCalledWith(nonExistentId);
		});
	});

	describe('updatePrice', () => {
		it('should update product price with valid positive value', async () => {
			const productId = mockProducts[0]._id as any;
			const newPrice = 149.99;

			await updatePrice(mockCtx, { id: productId, price: newPrice });

			expect(mockCtx.db.patch).toHaveBeenCalledWith(productId, { price: newPrice });
		});

		it('should allow zero price', async () => {
			const productId = mockProducts[0]._id as any;
			const newPrice = 0;

			await updatePrice(mockCtx, { id: productId, price: newPrice });

			expect(mockCtx.db.patch).toHaveBeenCalledWith(productId, { price: newPrice });
		});

		it('should reject negative price', async () => {
			const productId = mockProducts[0]._id as any;
			const negativePrice = -10;

			await expect(
				updatePrice(mockCtx, { id: productId, price: negativePrice })
			).rejects.toThrow('Price must be non-negative');

			expect(mockCtx.db.patch).not.toHaveBeenCalled();
		});
	});

	describe('bulkUpdateCategory', () => {
		it('should update all products from old category to new category', async () => {
			const oldCategory = 'Software';
			const newCategory = 'Enterprise Software';
			const softwareProducts = mockProducts.filter(p => p.category === oldCategory);

			// Mock the query to return software products
			const mockQueryBuilder = {
				filter: vi.fn().mockReturnThis(),
				collect: vi.fn().mockResolvedValue(softwareProducts)
			};
			mockCtx.db.query.mockReturnValue(mockQueryBuilder);

			await bulkUpdateCategory(mockCtx, { oldCategory, newCategory });

			expect(mockCtx.db.query).toHaveBeenCalledWith('products');
			expect(mockQueryBuilder.filter).toHaveBeenCalled();
			
			// Expect patch to be called for each software product
			softwareProducts.forEach(product => {
				expect(mockCtx.db.patch).toHaveBeenCalledWith(product._id, { category: newCategory });
			});
		});

		it('should handle category update when no products match', async () => {
			const oldCategory = 'NonExistentCategory';
			const newCategory = 'NewCategory';

			const mockQueryBuilder = {
				filter: vi.fn().mockReturnThis(),
				collect: vi.fn().mockResolvedValue([])
			};
			mockCtx.db.query.mockReturnValue(mockQueryBuilder);

			const result = await bulkUpdateCategory(mockCtx, { oldCategory, newCategory });

			expect(result).toEqual([]);
			expect(mockCtx.db.patch).not.toHaveBeenCalled();
		});

		it('should handle Promise.all resolution for multiple updates', async () => {
			const oldCategory = 'Software';
			const newCategory = 'Enterprise Software';
			const softwareProducts = mockProducts.slice(0, 3); // Take 3 products

			const mockQueryBuilder = {
				filter: vi.fn().mockReturnThis(),
				collect: vi.fn().mockResolvedValue(softwareProducts)
			};
			mockCtx.db.query.mockReturnValue(mockQueryBuilder);

			// Mock patch to return promises
			mockCtx.db.patch.mockResolvedValue(undefined);

			const result = await bulkUpdateCategory(mockCtx, { oldCategory, newCategory });

			expect(result).toHaveLength(3);
			expect(mockCtx.db.patch).toHaveBeenCalledTimes(3);
		});
	});
});