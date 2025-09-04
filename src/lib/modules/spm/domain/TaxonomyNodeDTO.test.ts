import { describe, it, expect } from 'vitest';
import {
	TaxonomyNodePropsSchema,
	TaxonomyNodeSchema,
	PortfolioPropsSchema,
	LinePropsSchema,
	CategoryPropsSchema,
	type TaxonomyNodeProps
} from './TaxonomyNodeDTO';

describe('TaxonomyNodeDTO', () => {
	const baseValidProps: TaxonomyNodeProps = {
		name: 'Digital Portfolio',
		description: 'Portfolio for digital transformation initiatives',
		type: 'portfolio' as const,
		parentId: null,
		isActive: true,
		createdBy: 'test-user',
		updatedBy: 'test-user',
		lastModified: Date.now(),
		changeHistory: [],
		version: 1
	};

	describe('TaxonomyNodePropsSchema', () => {
		it('should validate valid taxonomy node props', () => {
			const result = TaxonomyNodePropsSchema.safeParse(baseValidProps);
			expect(result.success).toBe(true);
		});

		it('should reject node with invalid name (too short)', () => {
			const invalidNode = { ...baseValidProps, name: 'A' };
			const result = TaxonomyNodePropsSchema.safeParse(invalidNode);
			expect(result.success).toBe(false);
		});

		it('should reject node with invalid name (too long)', () => {
			const invalidNode = { ...baseValidProps, name: 'A'.repeat(101) };
			const result = TaxonomyNodePropsSchema.safeParse(invalidNode);
			expect(result.success).toBe(false);
		});

		it('should reject node with invalid description (too short)', () => {
			const invalidNode = { ...baseValidProps, description: 'Short' };
			const result = TaxonomyNodePropsSchema.safeParse(invalidNode);
			expect(result.success).toBe(false);
		});

		it('should reject node with invalid description (too long)', () => {
			const invalidNode = { ...baseValidProps, description: 'A'.repeat(1001) };
			const result = TaxonomyNodePropsSchema.safeParse(invalidNode);
			expect(result.success).toBe(false);
		});

		it('should reject node with invalid type', () => {
			const invalidNode = { ...baseValidProps, type: 'invalid_type' };
			const result = TaxonomyNodePropsSchema.safeParse(invalidNode);
			expect(result.success).toBe(false);
		});

		it('should validate all taxonomy node types', () => {
			const types = ['portfolio', 'line', 'category'] as const;
			types.forEach((type) => {
				const validNode = { ...baseValidProps, type };
				const result = TaxonomyNodePropsSchema.safeParse(validNode);
				expect(result.success).toBe(true);
			});
		});

		it('should handle optional strategy field', () => {
			const withStrategy = { ...baseValidProps, strategy: 'Strategic initiative' };
			const withoutStrategy = { ...baseValidProps };

			expect(TaxonomyNodePropsSchema.safeParse(withStrategy).success).toBe(true);
			expect(TaxonomyNodePropsSchema.safeParse(withoutStrategy).success).toBe(true);
		});

		it('should reject invalid strategy (too short)', () => {
			const invalidNode = { ...baseValidProps, strategy: '1234' }; // Too short (min 5)
			const result = TaxonomyNodePropsSchema.safeParse(invalidNode);
			expect(result.success).toBe(false);
		});
	});

	describe('TaxonomyNodeSchema', () => {
		const baseCompleteNode = {
			...baseValidProps,
			_id: 'taxonomy_123',
			_creationTime: Date.now()
		};

		it('should validate complete taxonomy node with Convex fields', () => {
			const result = TaxonomyNodeSchema.safeParse(baseCompleteNode);
			expect(result.success).toBe(true);
		});

		it('should accept node without _creationTime (optional)', () => {
			const nodeWithoutTime = {
				...baseValidProps,
				_id: 'taxonomy_123'
				// intentionally omit _creationTime
			};
			const result = TaxonomyNodeSchema.safeParse(nodeWithoutTime);
			expect(result.success).toBe(true);
		});

		it('should reject node without _id', () => {
			const nodeWithoutId = {
				...baseValidProps,
				_creationTime: Date.now()
				// intentionally omit _id
			};
			const result = TaxonomyNodeSchema.safeParse(nodeWithoutId);
			expect(result.success).toBe(false);
		});
	});

	describe('Type-specific schemas', () => {
		describe('PortfolioPropsSchema', () => {
			it('should validate portfolio with null parent', () => {
				const portfolioProps = {
					...baseValidProps,
					type: 'portfolio' as const,
					parentId: null
				};
				const result = PortfolioPropsSchema.safeParse(portfolioProps);
				expect(result.success).toBe(true);
			});

			it('should reject portfolio with non-null parent', () => {
				const invalidPortfolio = {
					...baseValidProps,
					type: 'portfolio' as const,
					parentId: 'some-parent'
				};
				const result = PortfolioPropsSchema.safeParse(invalidPortfolio);
				expect(result.success).toBe(false);
			});
		});

		describe('LinePropsSchema', () => {
			it('should validate line with string parent', () => {
				const lineProps = {
					...baseValidProps,
					type: 'line' as const,
					parentId: 'portfolio_123'
				};
				const result = LinePropsSchema.safeParse(lineProps);
				expect(result.success).toBe(true);
			});

			it('should reject line with null parent', () => {
				const invalidLine = {
					...baseValidProps,
					type: 'line' as const,
					parentId: null
				};
				const result = LinePropsSchema.safeParse(invalidLine);
				expect(result.success).toBe(false);
			});
		});

		describe('CategoryPropsSchema', () => {
			it('should validate category with string parent', () => {
				const categoryProps = {
					...baseValidProps,
					type: 'category' as const,
					parentId: 'line_123'
				};
				const result = CategoryPropsSchema.safeParse(categoryProps);
				expect(result.success).toBe(true);
			});

			it('should reject category with null parent', () => {
				const invalidCategory = {
					...baseValidProps,
					type: 'category' as const,
					parentId: null
				};
				const result = CategoryPropsSchema.safeParse(invalidCategory);
				expect(result.success).toBe(false);
			});
		});
	});
});
