import { useQuery, useConvexClient } from 'convex-svelte';
import { api } from '../../../../../convex/_generated/api';
import type { Product, ProductProps } from '../../domain/ProductDTO';

/**
 * ProductViewModel - Business logic for Product management
 * Follows MVVM pattern with exactly three derived values: isLoading, error, data
 * Calls Convex functions for all business operations
 */
export class ProductViewModel {
	// Convex client for mutations
	private client = useConvexClient();

	// Reactive query for all products
	private allProductsQuery = useQuery(api.spm.product.query.getAll, {});

	// MVVM Contract: Exactly three derived values
	readonly isLoading = $derived(this.allProductsQuery.isLoading);
	readonly error = $derived(this.allProductsQuery.error);
	readonly data = $derived(this.allProductsQuery.data ?? []);

	// Business actions - Use ConvexClient for mutations
	async createProduct(productData: ProductProps): Promise<void> {
		try {
			await this.client.mutation(api.spm.product.mutations.create, productData);
		} catch (error) {
			console.error('Failed to create product:', error);
			throw error;
		}
	}

	async updateProduct(id: string, productData: ProductProps): Promise<void> {
		try {
			await this.client.mutation(api.spm.product.mutations.updateById, {
				id: id as string & { __tableName: 'products' },
				updates: productData
			});
		} catch (error) {
			console.error('Failed to update product:', error);
			throw error;
		}
	}

	async deleteProduct(id: string): Promise<void> {
		try {
			await this.client.mutation(api.spm.product.mutations.deleteById, {
				id: id as string & { __tableName: 'products' }
			});
		} catch (error) {
			console.error('Failed to delete product:', error);
			throw error;
		}
	}

	// Business logic helpers
	getProductsByCategory(category: string): Product[] {
		return this.data.filter((product) => product.category === category);
	}

	getProductsInPriceRange(minPrice: number, maxPrice: number): Product[] {
		return this.data.filter((product) => product.price >= minPrice && product.price <= maxPrice);
	}

	getTotalValue(): number {
		return this.data.reduce((total, product) => total + product.price, 0);
	}
}
