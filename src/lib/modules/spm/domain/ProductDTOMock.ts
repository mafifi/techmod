import type { ProductProps, Product } from './ProductDTO';

/**
 * Mock data generator for ProductDTO testing
 * Follows the established pattern of {Entity}DTOMock.ts
 */
export class ProductDTOMock {
	private static counter = 1;

	/**
	 * Generate a valid ProductProps for testing
	 */
	static createProductProps(overrides: Partial<ProductProps> = {}): ProductProps {
		return {
			name: `Test Product ${this.counter++}`,
			description: 'A comprehensive test product for validation',
			price: 99.99,
			taxonomyNodeId: 'portfolio_test_default',
			...overrides
		};
	}

	/**
	 * Generate a complete Product with Convex metadata
	 */
	static createProduct(overrides: Partial<Product> = {}): Product {
		const props = this.createProductProps(overrides);
		return {
			_id: `product_${Date.now()}_${this.counter}`,
			_creationTime: Date.now(),
			...props,
			...overrides
		};
	}

	/**
	 * Generate multiple ProductProps for bulk testing
	 */
	static createProductPropsArray(
		count: number,
		overrides: Partial<ProductProps> = {}
	): ProductProps[] {
		return Array.from({ length: count }, () => this.createProductProps(overrides));
	}

	/**
	 * Generate multiple Products for bulk testing
	 */
	static createProductArray(count: number, overrides: Partial<Product> = {}): Product[] {
		return Array.from({ length: count }, () => this.createProduct(overrides));
	}

	/**
	 * Create invalid ProductProps for negative testing
	 */
	static createInvalidProductProps(): {
		nameEmpty: Partial<ProductProps>;
		nameTooLong: Partial<ProductProps>;
		negativePrice: Partial<ProductProps>;
		taxonomyNodeIdEmpty: Partial<ProductProps>;
		descriptionTooLong: Partial<ProductProps>;
	} {
		return {
			nameEmpty: {
				name: '',
				price: 99.99,
				taxonomyNodeId: 'portfolio_test_default'
			},
			nameTooLong: {
				name: 'A'.repeat(101),
				price: 99.99,
				taxonomyNodeId: 'portfolio_test_default'
			},
			negativePrice: {
				name: 'Valid Product',
				price: -10,
				taxonomyNodeId: 'portfolio_test_default'
			},
			taxonomyNodeIdEmpty: {
				name: 'Valid Product',
				price: 99.99,
				taxonomyNodeId: ''
			},
			descriptionTooLong: {
				name: 'Valid Product',
				description: 'A'.repeat(501),
				price: 99.99,
				taxonomyNodeId: 'portfolio_test_default'
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
	 * Create product with specific category for filtering tests
	 */
	static createProductByTaxonomyNode(
		taxonomyNodeId: string,
		overrides: Partial<ProductProps> = {}
	): ProductProps {
		return this.createProductProps({ taxonomyNodeId, ...overrides });
	}

	/**
	 * Create products for price range testing
	 */
	static createProductsWithPriceRange(): ProductProps[] {
		return [
			this.createProductProps({ name: 'Budget Product', price: 10.0 }),
			this.createProductProps({ name: 'Mid Range Product', price: 50.0 }),
			this.createProductProps({ name: 'Premium Product', price: 200.0 }),
			this.createProductProps({ name: 'Enterprise Product', price: 1000.0 })
		];
	}
}
