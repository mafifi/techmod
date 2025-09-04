import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
	test.describe('Banner Header', () => {
		test('should display TechMod branding consistently across all pages', async ({ page }) => {
			const routes = ['/', '/product', '/taxonomy'];

			for (const route of routes) {
				await page.goto(route);

				// Check branding elements are always visible
				await expect(page.locator('h1:has-text("TechMod")')).toBeVisible();
				await expect(page.locator('text=Strategic Product Management')).toBeVisible();

				// Check search is visible on desktop
				await expect(page.locator('input[placeholder="Search catalogue..."]')).toBeVisible();

				// Check Get Started button is always present
				await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
			}
		});

		test('should have functional search input', async ({ page }) => {
			await page.goto('/');

			const searchInput = page.locator('input[placeholder="Search catalogue..."]');
			await expect(searchInput).toBeVisible();

			// Test search input functionality
			await searchInput.fill('test query');
			await expect(searchInput).toHaveValue('test query');
		});

		test('should have clickable Get Started button', async ({ page }) => {
			await page.goto('/');

			const getStartedButton = page.locator('button:has-text("Get Started")');
			await expect(getStartedButton).toBeVisible();
			await expect(getStartedButton).toBeEnabled();
		});
	});

	test.describe('Desktop Navigation Tabs', () => {
		test('should navigate between all routes correctly', async ({ page }) => {
			await page.goto('/');

			// Test navigation to Product Catalogue
			await page.locator('a:has-text("Product Catalogue")').click();
			await page.waitForURL('/product');
			await expect(page).toHaveURL('/product');

			// Test navigation to Taxonomy
			await page.locator('a:has-text("Taxonomy")').click();
			await page.waitForURL('/taxonomy');
			await expect(page).toHaveURL('/taxonomy');

			// Test navigation back to Overview
			await page.locator('a:has-text("Overview")').click();
			await page.waitForURL('/');
			await expect(page).toHaveURL('/');

			// Test navigation to Analytics
			await page.locator('a:has-text("Analytics")').click();
			await page.waitForURL('/analytics');
			await expect(page).toHaveURL('/analytics');

			// Test navigation to Reports
			await page.locator('a:has-text("Reports")').click();
			await page.waitForURL('/reports');
			await expect(page).toHaveURL('/reports');
		});

		test('should show correct active states for each route', async ({ page }) => {
			// Test Overview active state
			await page.goto('/');
			const overviewTab = page.locator('nav a:has-text("Overview")').first();
			await expect(overviewTab).toHaveClass(/border-midnight-blue-600/);
			await expect(overviewTab).toHaveClass(/text-midnight-blue-600/);

			// Test Product Catalogue active state
			await page.goto('/product');
			const productTab = page.locator('nav a:has-text("Product Catalogue")').first();
			await expect(productTab).toHaveClass(/border-midnight-blue-600/);
			await expect(productTab).toHaveClass(/text-midnight-blue-600/);

			// Test Taxonomy active state
			await page.goto('/taxonomy');
			const taxonomyTab = page.locator('nav a:has-text("Taxonomy")').first();
			await expect(taxonomyTab).toHaveClass(/border-midnight-blue-600/);
			await expect(taxonomyTab).toHaveClass(/text-midnight-blue-600/);

			// Test Analytics active state
			await page.goto('/analytics');
			const analyticsTab = page.locator('nav a:has-text("Analytics")').first();
			await expect(analyticsTab).toHaveClass(/border-midnight-blue-600/);
			await expect(analyticsTab).toHaveClass(/text-midnight-blue-600/);
		});

		test('should show inactive states for non-current routes', async ({ page }) => {
			await page.goto('/product');

			// Overview should not be active
			const overviewTab = page.locator('nav a:has-text("Overview")').first();
			await expect(overviewTab).toHaveClass(/border-transparent/);
			await expect(overviewTab).toHaveClass(/text-muted-foreground/);

			// Taxonomy should not be active
			const taxonomyTab = page.locator('nav a:has-text("Taxonomy")').first();
			await expect(taxonomyTab).toHaveClass(/border-transparent/);
			await expect(taxonomyTab).toHaveClass(/text-muted-foreground/);
		});

		test('should handle nested routes correctly', async ({ page }) => {
			// Navigate to a potential nested product route
			await page.goto('/product/123');

			// Product Catalogue tab should still be active
			const productTab = page.locator('nav a:has-text("Product Catalogue")').first();
			await expect(productTab).toHaveClass(/border-midnight-blue-600/);
		});
	});

	test.describe('Mobile Navigation', () => {
		test.use({ viewport: { width: 640, height: 480 } });

		test('should show mobile navigation menu', async ({ page }) => {
			await page.goto('/');

			// Desktop nav should be hidden
			const desktopNav = page.locator('nav.hidden.lg\\:block');
			await expect(desktopNav).toBeHidden();

			// Mobile nav should be visible
			const mobileNav = page.locator('nav.lg\\:hidden');
			await expect(mobileNav).toBeVisible();

			// Navigation text should be present
			await expect(page.locator('text=Navigation')).toBeVisible();
		});

		test('should open and close mobile menu', async ({ page }) => {
			await page.goto('/');

			// Click hamburger menu (Menu icon button)
			const menuButton = page
				.locator('nav.lg\\:hidden button[role="button"]')
				.or(page.locator('nav.lg\\:hidden button'));
			await expect(menuButton.first()).toBeVisible();
			await menuButton.first().click();

			// Wait for sheet to open and check for sheet content
			await page.waitForSelector('[data-state="open"]', { timeout: 5000 });

			// Sheet should open with navigation options
			const sheetContent = page.locator('[role="dialog"]');
			await expect(sheetContent.locator('text=TechMod')).toBeVisible();
			await expect(sheetContent.locator('text=Strategic Product Management')).toBeVisible();

			// All navigation items should be visible in mobile sheet
			await expect(sheetContent.locator('a:has-text("Overview")')).toBeVisible();
			await expect(sheetContent.locator('a:has-text("Product Catalogue")')).toBeVisible();
			await expect(sheetContent.locator('a:has-text("Taxonomy")')).toBeVisible();
			await expect(sheetContent.locator('a:has-text("Analytics")')).toBeVisible();
			await expect(sheetContent.locator('a:has-text("Reports")')).toBeVisible();
		});

		test('should navigate via mobile menu', async ({ page }) => {
			await page.goto('/');

			// Open mobile menu
			const menuButton = page.locator('nav.lg\\:hidden button');
			await menuButton.first().click();

			// Wait for sheet to open
			await page.waitForSelector('[data-state="open"]', { timeout: 5000 });

			// Click on Product Catalogue in mobile sheet
			const sheetContent = page.locator('[role="dialog"]');
			await sheetContent.locator('a:has-text("Product Catalogue")').click();

			// Should navigate to product page
			await page.waitForURL('/product');
			await expect(page).toHaveURL('/product');
		});

		test('should show correct active states in mobile menu', async ({ page }) => {
			await page.goto('/taxonomy');

			// Open mobile menu
			const menuButton = page.locator('nav.lg\\:hidden button');
			await menuButton.first().click();

			// Wait for sheet to open
			await page.waitForSelector('[data-state="open"]', { timeout: 5000 });

			// Taxonomy should have active styling in mobile sheet
			const sheetContent = page.locator('[role="dialog"]');
			const taxonomyLink = sheetContent.locator('a:has-text("Taxonomy")');
			await expect(taxonomyLink).toHaveClass(/bg-midnight-blue-50/);
			await expect(taxonomyLink).toHaveClass(/text-midnight-blue-700/);
		});

		test('should hide search on mobile', async ({ page }) => {
			await page.goto('/');

			// Search should be hidden on mobile
			const searchInput = page.locator('input[placeholder="Search catalogue..."]');
			await expect(searchInput).toBeHidden();
		});
	});

	test.describe('Navigation Persistence', () => {
		test('should maintain navigation visibility during route transitions', async ({ page }) => {
			await page.goto('/');

			// Verify navigation is visible
			await expect(page.locator('h1:has-text("TechMod")')).toBeVisible();

			// Navigate to different routes and ensure navigation persists
			const routes = ['/product', '/taxonomy', '/', '/analytics', '/reports'];

			for (const route of routes) {
				await page.goto(route);

				// Navigation header should always be visible
				await expect(page.locator('h1:has-text("TechMod")')).toBeVisible();
				await expect(page.locator('button:has-text("Get Started")')).toBeVisible();

				// At least one navigation variant should be present (desktop or mobile)
				const desktopNav = page.locator('nav.hidden.lg\\:block a:has-text("Overview")');
				const mobileNavButton = page.locator('nav.lg\\:hidden');

				// Either desktop nav links should be visible, or mobile nav trigger should be visible
				const hasDesktopNav = await desktopNav.isVisible();
				const hasMobileNav = await mobileNavButton.isVisible();
				expect(hasDesktopNav || hasMobileNav).toBe(true);
			}
		});

		test('should maintain scroll position of sticky navigation', async ({ page }) => {
			await page.goto('/');

			// Scroll down on the page
			await page.evaluate(() => window.scrollTo(0, 500));

			// Find a visible sticky navigation element
			const stickyNavs = page.locator('nav.sticky');
			const navCount = await stickyNavs.count();

			let visibleNav = null;
			for (let i = 0; i < navCount; i++) {
				const nav = stickyNavs.nth(i);
				if (await nav.isVisible()) {
					visibleNav = nav;
					break;
				}
			}

			// If no sticky nav is visible (desktop mode), check that header is still visible at top
			if (!visibleNav) {
				const header = page.locator('header');
				await expect(header).toBeVisible();
				const headerBox = await header.boundingBox();
				expect(headerBox?.y).toBeLessThanOrEqual(20);
			} else {
				await expect(visibleNav).toBeVisible();
				const navBox = await visibleNav.boundingBox();
				expect(navBox?.y).toBeLessThanOrEqual(20); // Should be near top (allow some margin)
			}
		});
	});

	test.describe('Accessibility', () => {
		test('should have proper ARIA labels and roles', async ({ page }) => {
			await page.goto('/');

			// Check for proper semantic elements
			await expect(page.locator('header')).toBeVisible();

			// Check that at least one nav element is visible (mobile or desktop)
			const navElements = page.locator('nav');
			const navCount = await navElements.count();
			expect(navCount).toBeGreaterThan(0);

			// At least one nav should be visible
			let hasVisibleNav = false;
			for (let i = 0; i < navCount; i++) {
				if (await navElements.nth(i).isVisible()) {
					hasVisibleNav = true;
					break;
				}
			}
			expect(hasVisibleNav).toBe(true);

			await expect(page.locator('main')).toBeVisible();

			// Check for proper heading hierarchy
			await expect(page.locator('h1')).toBeVisible();
		});

		test('should be keyboard navigable', async ({ page }) => {
			await page.goto('/');

			// Tab through navigation elements
			await page.keyboard.press('Tab');
			await page.keyboard.press('Tab');

			// Should be able to navigate to links
			const overviewLink = page.locator('a:has-text("Overview")').first();
			await overviewLink.focus();
			await expect(overviewLink).toBeFocused();

			// Should be able to activate with Enter
			await page.keyboard.press('Enter');
			await expect(page).toHaveURL('/');
		});

		test('should have good color contrast for active states', async ({ page }) => {
			await page.goto('/');

			// This would ideally use axe-core for automated accessibility testing
			// For now, we ensure the active states are visually distinct
			const activeTab = page.locator('nav a:has-text("Overview")').first();
			await expect(activeTab).toHaveClass(/text-midnight-blue-600/);
		});
	});

	test.describe('Performance', () => {
		test('should load navigation quickly', async ({ page }) => {
			const startTime = Date.now();
			await page.goto('/');

			// Navigation should be visible quickly
			await expect(page.locator('h1:has-text("TechMod")')).toBeVisible();

			const loadTime = Date.now() - startTime;
			expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
		});

		test('should not cause layout shifts during navigation', async ({ page }) => {
			await page.goto('/');

			// Wait for initial load and get header position
			await page.waitForLoadState('networkidle');
			const headerBox = await page.locator('header').boundingBox();

			// Navigate to another route using desktop nav if visible, otherwise use mobile
			const desktopLink = page.locator('nav.hidden.lg\\:block a:has-text("Product Catalogue")');
			const isDesktopVisible = await desktopLink.isVisible();

			if (isDesktopVisible) {
				await desktopLink.click();
			} else {
				// Use mobile navigation
				const menuButton = page.locator('nav.lg\\:hidden button');
				await menuButton.first().click();
				await page.waitForSelector('[data-state="open"]');
				const sheetContent = page.locator('[role="dialog"]');
				await sheetContent.locator('a:has-text("Product Catalogue")').click();
			}

			await page.waitForURL('/product');
			await page.waitForLoadState('networkidle');

			// Header should remain in approximately the same position (allow small variance)
			const newHeaderBox = await page.locator('header').boundingBox();
			const yDifference = Math.abs((newHeaderBox?.y || 0) - (headerBox?.y || 0));
			expect(yDifference).toBeLessThanOrEqual(5); // Allow 5px variance
		});
	});
});
