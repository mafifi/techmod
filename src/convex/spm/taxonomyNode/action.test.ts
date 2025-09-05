import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../../_generated/api';
import schema from '../../schema';
import { modules } from '../../test.setup';

describe('TaxonomyNode AI Suggestions', () => {
	it('should return category suggestions for a product', async () => {
		const t = convexTest(schema, modules);

		// Create test taxonomy hierarchy
		const portfolioId = await t.mutation(api.spm.taxonomyNode.mutations.create, {
			name: 'Technology Portfolio',
			description: 'Technology products and services',
			type: 'portfolio' as const,
			parentId: null,
			createdBy: 'test-user',
			updatedBy: 'test-user',
			isActive: true
		});

		const lineId = await t.mutation(api.spm.taxonomyNode.mutations.create, {
			name: 'Software Development',
			description: 'Development tools and platforms',
			type: 'line' as const,
			parentId: portfolioId,
			createdBy: 'test-user',
			updatedBy: 'test-user',
			isActive: true
		});

		await t.mutation(api.spm.taxonomyNode.mutations.create, {
			name: 'Database Systems',
			description: 'Database management and analytics platforms',
			type: 'category' as const,
			parentId: lineId,
			createdBy: 'test-user',
			updatedBy: 'test-user',
			isActive: true
		});

		// Test AI suggestions
		const result = await t.action(api.spm.taxonomyNode.action.suggestCategory, {
			productName: 'PostgreSQL Database Manager',
			productDescription: 'Advanced database management tool for PostgreSQL databases'
		});

		// Verify suggestions were returned
		expect(result).toBeDefined();
		expect(result.suggestions).toBeDefined();
		expect(result.totalCategories).toBeGreaterThan(0);
		expect(result.processingTimeMs).toBeGreaterThan(0);

		// Verify suggestion structure if any found
		if (result.suggestions.length > 0) {
			const suggestion = result.suggestions[0];
			expect(suggestion.taxonomyNodeId).toBeDefined();
			expect(suggestion.portfolio).toBeDefined();
			expect(suggestion.line).toBeDefined();
			expect(suggestion.category).toBeDefined();
			expect(suggestion.confidence).toBeGreaterThan(0);
			expect(suggestion.confidence).toBeLessThanOrEqual(1);
			expect(suggestion.reasoning).toBeDefined();
			expect(suggestion.path).toContain(' > ');
		}
	});

	it('should return empty suggestions for non-matching product', async () => {
		const t = convexTest(schema, modules);

		const result = await t.action(api.spm.taxonomyNode.action.suggestCategory, {
			productName: 'XYZ Random Product That Does Not Match Any Category',
			productDescription: 'This product has nothing to do with any existing categories'
		});

		expect(result).toBeDefined();
		expect(result.suggestions).toBeDefined();
		expect(Array.isArray(result.suggestions)).toBe(true);
		// Suggestions may be empty or very low confidence
		if (result.suggestions.length > 0) {
			expect(result.suggestions[0].confidence).toBeLessThan(0.5);
		}
	});

	it('should handle products with only name (no description)', async () => {
		const t = convexTest(schema, modules);

		const result = await t.action(api.spm.taxonomyNode.action.suggestCategory, {
			productName: 'Database Tool'
		});

		expect(result).toBeDefined();
		expect(result.suggestions).toBeDefined();
		expect(typeof result.processingTimeMs).toBe('number');
	});
});
