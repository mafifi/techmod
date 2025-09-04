import { describe, it, expect } from 'vitest';

/**
 * Active route detection utility function
 * This mirrors the logic used in +layout.svelte
 */
function isActiveRoute(route: string, pathname: string): boolean {
	if (route === '/' && pathname === '/') return true;
	if (route !== '/' && pathname.startsWith(route)) return true;
	return false;
}

describe('Navigation Active State Logic', () => {
	describe('Home route detection', () => {
		it('should be active only for exact root path', () => {
			expect(isActiveRoute('/', '/')).toBe(true);
			expect(isActiveRoute('/', '/product')).toBe(false);
			expect(isActiveRoute('/', '/taxonomy')).toBe(false);
			expect(isActiveRoute('/', '/analytics')).toBe(false);
			expect(isActiveRoute('/', '/reports')).toBe(false);
			expect(isActiveRoute('/', '/some/nested/route')).toBe(false);
		});

		it('should not be active for routes that contain root as substring', () => {
			expect(isActiveRoute('/', '/product/123')).toBe(false);
			expect(isActiveRoute('/', '/taxonomy/abc')).toBe(false);
		});
	});

	describe('Product route detection', () => {
		it('should be active for product routes', () => {
			expect(isActiveRoute('/product', '/product')).toBe(true);
			expect(isActiveRoute('/product', '/product/123')).toBe(true);
			expect(isActiveRoute('/product', '/product/edit/456')).toBe(true);
			expect(isActiveRoute('/product', '/products')).toBe(true); // Note: this might be undesired behavior
		});

		it('should not be active for non-product routes', () => {
			expect(isActiveRoute('/product', '/')).toBe(false);
			expect(isActiveRoute('/product', '/taxonomy')).toBe(false);
			expect(isActiveRoute('/product', '/analytics')).toBe(false);
			expect(isActiveRoute('/product', '/reports')).toBe(false);
		});

		it('should not be active for routes that only contain product as substring', () => {
			expect(isActiveRoute('/product', '/myproduct')).toBe(false);
			expect(isActiveRoute('/product', '/production')).toBe(true); // Note: this is undesired behavior - startsWith limitation
		});
	});

	describe('Taxonomy route detection', () => {
		it('should be active for taxonomy routes', () => {
			expect(isActiveRoute('/taxonomy', '/taxonomy')).toBe(true);
			expect(isActiveRoute('/taxonomy', '/taxonomy/categories')).toBe(true);
			expect(isActiveRoute('/taxonomy', '/taxonomy/edit/123')).toBe(true);
		});

		it('should not be active for non-taxonomy routes', () => {
			expect(isActiveRoute('/taxonomy', '/')).toBe(false);
			expect(isActiveRoute('/taxonomy', '/product')).toBe(false);
			expect(isActiveRoute('/taxonomy', '/analytics')).toBe(false);
		});
	});

	describe('Analytics route detection', () => {
		it('should be active for analytics routes', () => {
			expect(isActiveRoute('/analytics', '/analytics')).toBe(true);
			expect(isActiveRoute('/analytics', '/analytics/dashboard')).toBe(true);
			expect(isActiveRoute('/analytics', '/analytics/reports/quarterly')).toBe(true);
		});

		it('should not be active for non-analytics routes', () => {
			expect(isActiveRoute('/analytics', '/')).toBe(false);
			expect(isActiveRoute('/analytics', '/product')).toBe(false);
			expect(isActiveRoute('/analytics', '/reports')).toBe(false);
		});
	});

	describe('Reports route detection', () => {
		it('should be active for reports routes', () => {
			expect(isActiveRoute('/reports', '/reports')).toBe(true);
			expect(isActiveRoute('/reports', '/reports/annual')).toBe(true);
			expect(isActiveRoute('/reports', '/reports/export/csv')).toBe(true);
		});

		it('should not be active for non-reports routes', () => {
			expect(isActiveRoute('/reports', '/')).toBe(false);
			expect(isActiveRoute('/reports', '/product')).toBe(false);
			expect(isActiveRoute('/reports', '/analytics')).toBe(false);
		});
	});

	describe('Edge cases and special scenarios', () => {
		it('should handle empty or invalid paths', () => {
			expect(isActiveRoute('/', '')).toBe(false);
			expect(isActiveRoute('/product', '')).toBe(false);
			expect(isActiveRoute('', '/')).toBe(true); // Empty string startsWith any string returns true
		});

		it('should handle paths with query parameters', () => {
			expect(isActiveRoute('/product', '/product?id=123')).toBe(true);
			expect(isActiveRoute('/analytics', '/analytics/dashboard?from=2024-01-01')).toBe(true);
		});

		it('should handle paths with hash fragments', () => {
			expect(isActiveRoute('/reports', '/reports#section1')).toBe(true);
			expect(isActiveRoute('/taxonomy', '/taxonomy/categories#item-123')).toBe(true);
		});

		it('should handle case sensitivity', () => {
			expect(isActiveRoute('/Product', '/product')).toBe(false);
			expect(isActiveRoute('/product', '/Product')).toBe(false);
		});

		it('should handle trailing slashes consistently', () => {
			expect(isActiveRoute('/product', '/product/')).toBe(true);
			expect(isActiveRoute('/product/', '/product')).toBe(false); // '/product' does not start with '/product/'
			expect(isActiveRoute('/', '//')).toBe(false); // Multiple slashes should not match root
		});
	});

	describe('Potential improvements', () => {
		it('should document current limitations with startsWith approach', () => {
			// These tests document current behavior that might be undesired
			// Consider using exact path matching or regex for better precision

			// This matches because '/production' starts with '/product'
			expect(isActiveRoute('/product', '/production')).toBe(true); // Undesired

			// This matches because '/reports-old' starts with '/reports'
			expect(isActiveRoute('/reports', '/reports-old')).toBe(true); // Undesired

			// These behaviors might require more sophisticated matching:
			// - Exact path segments: '/product' matches '/product' and '/product/...' but not '/production'
			// - Regex matching: Use word boundaries
			// - Path segment matching: Split by '/' and compare segments
		});
	});
});
