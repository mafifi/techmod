/// <reference types="vite/client" />
import { convexTest } from 'convex-test';
import { expect, test, describe } from 'vitest';
import { api } from '../../_generated/api';
import schema from '../../schema';
import { modules } from '../../test.setup';
import { ProductDTOMock } from '../../../lib/modules/spm/domain/ProductDTOMock';

describe('Product Queries', () => {
	test('getAll returns all products', async () => {
		// Since convex.json has custom functions path "src/convex/", provide module map
		const t = convexTest(schema, modules);

		// Insert test products using mock data
		const product1 = ProductDTOMock.createProductProps({
			name: 'Product 1',
			category: 'Software',
			price: 100
		});
		const product2 = ProductDTOMock.createProductProps({
			name: 'Product 2',
			category: 'Hardware',
			price: 200
		});

		await t.mutation(api.spm.product.mutations.create, product1);
		await t.mutation(api.spm.product.mutations.create, product2);

		// Test getAll query
		const products = await t.query(api.spm.product.query.getAll);

		expect(products).toHaveLength(2);
		expect(products).toMatchObject([
			{ name: 'Product 1', category: 'Software', price: 100 },
			{ name: 'Product 2', category: 'Hardware', price: 200 }
		]);
	});

	test('getByCategory filters products correctly', async () => {
		const t = convexTest(schema, modules);

		// Insert test products
		const softwareProduct = ProductDTOMock.createProductProps({ category: 'Software', price: 100 });
		const hardwareProduct = ProductDTOMock.createProductProps({ category: 'Hardware', price: 200 });

		await t.mutation(api.spm.product.mutations.create, softwareProduct);
		await t.mutation(api.spm.product.mutations.create, hardwareProduct);

		// Test category filtering
		const softwareProducts = await t.query(api.spm.product.query.getByCategory, {
			category: 'Software'
		});
		const hardwareProducts = await t.query(api.spm.product.query.getByCategory, {
			category: 'Hardware'
		});

		expect(softwareProducts).toHaveLength(1);
		expect(hardwareProducts).toHaveLength(1);
		expect(softwareProducts[0].category).toBe('Software');
		expect(hardwareProducts[0].category).toBe('Hardware');
	});

	test('getInPriceRange filters by price correctly', async () => {
		const t = convexTest(schema, modules);

		// Insert test products with different prices
		await t.mutation(
			api.spm.product.mutations.create,
			ProductDTOMock.createProductProps({ price: 50 })
		);
		await t.mutation(
			api.spm.product.mutations.create,
			ProductDTOMock.createProductProps({ price: 150 })
		);
		await t.mutation(
			api.spm.product.mutations.create,
			ProductDTOMock.createProductProps({ price: 250 })
		);

		// Test price range filtering
		const productsInRange = await t.query(api.spm.product.query.getInPriceRange, {
			minPrice: 100,
			maxPrice: 200
		});

		expect(productsInRange).toHaveLength(1);
		expect(productsInRange[0].price).toBe(150);
	});

	test('getInPriceRange throws error when minPrice > maxPrice', async () => {
		const t = convexTest(schema, modules);

		// Test validation error
		await expect(
			t.query(api.spm.product.query.getInPriceRange, { minPrice: 200, maxPrice: 100 })
		).rejects.toThrow('Minimum price cannot be greater than maximum price');
	});

	test('search finds products by name, description, or category', async () => {
		const t = convexTest(schema, modules);

		// Insert test products
		await t.mutation(
			api.spm.product.mutations.create,
			ProductDTOMock.createProductProps({
				name: 'Test Product',
				category: 'Software'
			})
		);
		await t.mutation(
			api.spm.product.mutations.create,
			ProductDTOMock.createProductProps({
				name: 'Another Item',
				category: 'Hardware'
			})
		);

		// Test search by category
		const softwareResults = await t.query(api.spm.product.query.search, { searchTerm: 'Software' });
		const hardwareResults = await t.query(api.spm.product.query.search, { searchTerm: 'Hardware' });

		expect(softwareResults).toHaveLength(1);
		expect(hardwareResults).toHaveLength(1);
		expect(softwareResults[0].name).toBe('Test Product');
		expect(hardwareResults[0].name).toBe('Another Item');
	});
});
