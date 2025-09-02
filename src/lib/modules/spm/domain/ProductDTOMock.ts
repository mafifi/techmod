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
		const departments = ['Engineering', 'Marketing', 'Sales', 'Operations'];
		const superDepartments = ['Technology', 'Business', 'Support'];
		const owners = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Wilson'];
		const modernityLevels = ['LEGACY', 'TRANSITIONAL', 'MODERN', 'CUTTING_EDGE'] as const;
		const criticalityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
		const lifecycleStages = ['PLAN', 'BUILD', 'RUN', 'RETIRE'] as const;

		return {
			name: `Test Product ${this.counter++}`,
			description: 'A comprehensive test product for validation',
			price: 99.99,
			category: 'Software',
			productOwner: owners[Math.floor(Math.random() * owners.length)],
			department: departments[Math.floor(Math.random() * departments.length)],
			superDepartment: superDepartments[Math.floor(Math.random() * superDepartments.length)],
			modernity: modernityLevels[Math.floor(Math.random() * modernityLevels.length)],
			pdr: Math.random() > 0.5 ? `https://example.com/pdr/${this.counter}` : undefined,
			businessCriticality: criticalityLevels[Math.floor(Math.random() * criticalityLevels.length)],
			lifecycleStage: lifecycleStages[Math.floor(Math.random() * lifecycleStages.length)],
			lastAssessmentDate: Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
			nextReviewDate: Date.now() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
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
		categoryTooShort: Partial<ProductProps>;
		descriptionTooLong: Partial<ProductProps>;
	} {
		return {
			nameEmpty: { name: '', price: 99.99, category: 'Software' },
			nameTooLong: { name: 'A'.repeat(101), price: 99.99, category: 'Software' },
			negativePrice: { name: 'Valid Product', price: -10, category: 'Software' },
			categoryTooShort: { name: 'Valid Product', price: 99.99, category: 'A' },
			descriptionTooLong: {
				name: 'Valid Product',
				description: 'A'.repeat(501),
				price: 99.99,
				category: 'Software'
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
	static createProductByCategory(
		category: string,
		overrides: Partial<ProductProps> = {}
	): ProductProps {
		return this.createProductProps({ category, ...overrides });
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
