import { describe, it, expect } from 'vitest';
import {
	ProductPropsSchema,
	ProductSchema,
	ModernityEnum,
	type ProductProps,
	type Product
} from './ProductDTO';

describe('ProductDTO', () => {
	describe('ProductPropsSchema', () => {
		it('should validate valid product props', () => {
			const validProduct: ProductProps = {
				name: 'Test Product',
				owningSuperDepartment: 'Technology',
				productOwner: 'John Smith',
				eonids: 'EON-1234-567',
				productOverview: 'A comprehensive product overview describing the purpose and value.',
				productRelatedLinks: 'https://confluence.example.com/docs',
				productType: 'Application',
				modernity: 'Continue',
				lifecycleStatus: 'Active',
				fleet: 'Web Services',
				squad: 'Alpha Squad',
				roadmapLink: 'https://roadmap.example.com/product/123',
				// Legacy optional fields
				description: 'A test product description',
				price: 99.99,
				category: 'Software'
			};

			const result = ProductPropsSchema.safeParse(validProduct);
			expect(result.success).toBe(true);
		});

		it('should reject product with invalid name (too short)', () => {
			const invalidProduct = {
				name: 'A', // Too short (min 2)
				owningSuperDepartment: 'Technology',
				productOwner: 'John Smith',
				eonids: 'EON-1234-567',
				productOverview: 'A comprehensive product overview.',
				productRelatedLinks: 'https://confluence.example.com/docs',
				productType: 'Application',
				modernity: 'Continue' as const,
				lifecycleStatus: 'Active',
				fleet: 'Web Services',
				squad: 'Alpha Squad',
				roadmapLink: 'https://roadmap.example.com/product/123'
			};

			const result = ProductPropsSchema.safeParse(invalidProduct);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['name']);
			}
		});

		it('should reject product with invalid modernity value', () => {
			const invalidProduct = {
				name: 'Valid Product Name',
				owningSuperDepartment: 'Technology',
				productOwner: 'John Smith',
				eonids: 'EON-1234-567',
				productOverview: 'A comprehensive product overview.',
				productRelatedLinks: 'https://confluence.example.com/docs',
				productType: 'Application',
				modernity: 'InvalidValue', // Invalid modernity value
				lifecycleStatus: 'Active',
				fleet: 'Web Services',
				squad: 'Alpha Squad',
				roadmapLink: 'https://roadmap.example.com/product/123'
			};

			const result = ProductPropsSchema.safeParse(invalidProduct);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['modernity']);
			}
		});

		it('should allow all valid modernity values', () => {
			const modernityValues = ['Migrate', 'Hold', 'Continue', 'Adopt', 'Assess'] as const;

			modernityValues.forEach((modernity) => {
				const validProduct = {
					name: 'Valid Product Name',
					owningSuperDepartment: 'Technology',
					productOwner: 'John Smith',
					eonids: 'EON-1234-567',
					productOverview: 'A comprehensive product overview.',
					productRelatedLinks: 'https://confluence.example.com/docs',
					productType: 'Application',
					modernity,
					lifecycleStatus: 'Active',
					fleet: 'Web Services',
					squad: 'Alpha Squad',
					roadmapLink: 'https://roadmap.example.com/product/123'
				};

				const result = ProductPropsSchema.safeParse(validProduct);
				expect(result.success).toBe(true);
			});
		});

		it('should validate with minimal required fields only', () => {
			const minimalProduct = {
				name: 'Minimal Product',
				owningSuperDepartment: 'Technology',
				productOwner: 'John Smith',
				eonids: 'EON-1234-567',
				productOverview: 'A minimal product overview.',
				productRelatedLinks: 'https://confluence.example.com/docs',
				productType: 'Application',
				modernity: 'Continue' as const,
				lifecycleStatus: 'Active',
				fleet: 'Web Services',
				squad: 'Alpha Squad',
				roadmapLink: 'https://roadmap.example.com/product/123'
			};

			const result = ProductPropsSchema.safeParse(minimalProduct);
			expect(result.success).toBe(true);
		});
	});

	describe('ProductSchema', () => {
		it('should validate Product with Convex metadata', () => {
			const validProduct: Product = {
				_id: 'product_123',
				_creationTime: Date.now(),
				name: 'Test Product',
				owningSuperDepartment: 'Technology',
				productOwner: 'John Smith',
				eonids: 'EON-1234-567',
				productOverview: 'A comprehensive product overview.',
				productRelatedLinks: 'https://confluence.example.com/docs',
				productType: 'Application',
				modernity: 'Adopt',
				lifecycleStatus: 'Active',
				fleet: 'Web Services',
				squad: 'Alpha Squad',
				roadmapLink: 'https://roadmap.example.com/product/123'
			};

			const result = ProductSchema.safeParse(validProduct);
			expect(result.success).toBe(true);
		});
	});

	describe('ModernityEnum', () => {
		it('should validate all modernity enum values', () => {
			const validValues = ['Migrate', 'Hold', 'Continue', 'Adopt', 'Assess'];

			validValues.forEach((value) => {
				const result = ModernityEnum.safeParse(value);
				expect(result.success).toBe(true);
			});
		});

		it('should reject invalid modernity values', () => {
			const invalidValues = ['Legacy', 'Modern', 'Invalid', 'CONTINUE'];

			invalidValues.forEach((value) => {
				const result = ModernityEnum.safeParse(value);
				expect(result.success).toBe(false);
			});
		});
	});
});
