import { describe, it, expect } from 'vitest';
import { ProductPropsSchema, ProductSchema, type ProductProps, type Product } from './ProductDTO';

describe('ProductDTO', () => {
	describe('ProductPropsSchema', () => {
		it('should validate valid product props', () => {
			const validProduct: ProductProps = {
				name: 'Test Product',
				description: 'A test product description',
				price: 99.99,
				category: 'Software',
				taxonomyNodeId: 'portfolio_test_1'
			};

			const result = ProductPropsSchema.safeParse(validProduct);
			expect(result.success).toBe(true);
		});

		it('should reject product with invalid name (too short)', () => {
			const invalidProduct = {
				name: 'A', // Too short (min 2)
				description: 'Valid description',
				price: 99.99,
				category: 'Software',
				taxonomyNodeId: 'portfolio_test_1'
			};

			const result = ProductPropsSchema.safeParse(invalidProduct);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['name']);
			}
		});

		it('should reject product with invalid name (too long)', () => {
			const invalidProduct = {
				name: 'A'.repeat(101), // Too long (max 100)
				description: 'Valid description',
				price: 99.99,
				category: 'Software',
				taxonomyNodeId: 'portfolio_test_1'
			};

			const result = ProductPropsSchema.safeParse(invalidProduct);
			expect(result.success).toBe(false);
		});

		it('should reject product with negative price', () => {
			const invalidProduct = {
				name: 'Valid Product',
				description: 'Valid description',
				price: -10, // Invalid negative price
				category: 'Software',
				taxonomyNodeId: 'portfolio_test_1'
			};

			const result = ProductPropsSchema.safeParse(invalidProduct);
			expect(result.success).toBe(false);
		});

		it('should reject product with invalid category (too short)', () => {
			const invalidProduct = {
				name: 'Valid Product',
				description: 'Valid description',
				price: 99.99,
				category: 'A', // Too short (min 2)
				taxonomyNodeId: 'portfolio_test_1'
			};

			const result = ProductPropsSchema.safeParse(invalidProduct);
			expect(result.success).toBe(false);
		});

		it('should accept product without description (optional field)', () => {
			const validProduct = {
				name: 'Valid Product',
				price: 99.99,
				category: 'Software',
				taxonomyNodeId: 'portfolio_test_1'
				// description omitted
			};

			const result = ProductPropsSchema.safeParse(validProduct);
			expect(result.success).toBe(true);
		});

		it('should reject product with description too long', () => {
			const invalidProduct = {
				name: 'Valid Product',
				description: 'A'.repeat(501), // Too long (max 500)
				price: 99.99,
				category: 'Software',
				taxonomyNodeId: 'portfolio_test_1'
			};

			const result = ProductPropsSchema.safeParse(invalidProduct);
			expect(result.success).toBe(false);
		});
	});

	describe('ProductSchema', () => {
		it('should validate complete product with Convex fields', () => {
			const validProduct: Product = {
				_id: 'product_123',
				_creationTime: 1640995200000,
				name: 'Test Product',
				description: 'A test product description',
				price: 99.99,
				category: 'Software',
				taxonomyNodeId: 'portfolio_test_1'
			};

			const result = ProductSchema.safeParse(validProduct);
			expect(result.success).toBe(true);
		});

		it('should accept product without _creationTime (optional)', () => {
			const validProduct = {
				_id: 'product_123',
				name: 'Test Product',
				description: 'A test product description',
				price: 99.99,
				category: 'Software',
				taxonomyNodeId: 'portfolio_test_1'
				// _creationTime omitted
			};

			const result = ProductSchema.safeParse(validProduct);
			expect(result.success).toBe(true);
		});

		it('should reject product without _id', () => {
			const invalidProduct = {
				// _id omitted
				name: 'Test Product',
				description: 'A test product description',
				price: 99.99,
				category: 'Software',
				taxonomyNodeId: 'portfolio_test_1'
			};

			const result = ProductSchema.safeParse(invalidProduct);
			expect(result.success).toBe(false);
		});
	});
});
