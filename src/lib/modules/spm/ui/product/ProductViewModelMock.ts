import { vi, type MockedFunction } from 'vitest';
import type { Product, ProductProps } from '../../domain/ProductDTO';
import { ProductDTOMock } from '../../domain/ProductDTOMock';

/**
 * Mock ProductViewModel for testing Views in isolation
 * Follows the established {Component}ViewModelMock.ts pattern
 */
export class ProductViewModelMock {
	// Mock the three derived values that MVVM contract requires
	public isLoading = $state(false);
	public error = $state<Error | null>(null);
	public data = $state<Product[]>(ProductDTOMock.createProductArray(3));

	// Mock business action methods
	public createProduct: MockedFunction<(productData: ProductProps) => Promise<void>>;
	public updateProduct: MockedFunction<(id: string, productData: ProductProps) => Promise<void>>;
	public deleteProduct: MockedFunction<(id: string) => Promise<void>>;
	public getProductsByCategory: MockedFunction<(category: string) => Product[]>;
	public getProductsInPriceRange: MockedFunction<(minPrice: number, maxPrice: number) => Product[]>;
	public getTotalValue: MockedFunction<() => number>;

	constructor(initialData?: Product[], initialLoading?: boolean, initialError?: Error | null) {
		// Initialize state
		if (initialData !== undefined) this.data = initialData;
		if (initialLoading !== undefined) this.isLoading = initialLoading;
		if (initialError !== undefined) this.error = initialError;

		// Setup method mocks
		this.createProduct = vi.fn().mockResolvedValue(undefined);
		this.updateProduct = vi.fn().mockResolvedValue(undefined);
		this.deleteProduct = vi.fn().mockResolvedValue(undefined);
		
		this.getProductsByCategory = vi.fn().mockImplementation((category: string) => {
			return this.data.filter(product => product.category === category);
		});
		
		this.getProductsInPriceRange = vi.fn().mockImplementation((minPrice: number, maxPrice: number) => {
			return this.data.filter(product => 
				product.price >= minPrice && product.price <= maxPrice
			);
		});
		
		this.getTotalValue = vi.fn().mockImplementation(() => {
			return this.data.reduce((total, product) => total + product.price, 0);
		});
	}

	// Utility methods for test control
	setLoading(loading: boolean): void {
		this.isLoading = loading;
	}

	setError(error: Error | null): void {
		this.error = error;
	}

	setData(data: Product[]): void {
		this.data = data;
	}

	// Simulate different states for testing
	simulateLoading(): void {
		this.setLoading(true);
		this.setError(null);
		this.setData([]);
	}

	simulateError(error: Error): void {
		this.setLoading(false);
		this.setError(error);
		this.setData([]);
	}

	simulateSuccess(data?: Product[]): void {
		this.setLoading(false);
		this.setError(null);
		this.setData(data || ProductDTOMock.createProductArray(3));
	}

	simulateEmpty(): void {
		this.setLoading(false);
		this.setError(null);
		this.setData([]);
	}

	// Make methods fail for testing error handling
	makeCreateProductFail(error: Error): void {
		this.createProduct.mockRejectedValue(error);
	}

	makeUpdateProductFail(error: Error): void {
		this.updateProduct.mockRejectedValue(error);
	}

	makeDeleteProductFail(error: Error): void {
		this.deleteProduct.mockRejectedValue(error);
	}

	// Reset all mocks
	resetAllMocks(): void {
		vi.clearAllMocks();
		this.createProduct.mockResolvedValue(undefined);
		this.updateProduct.mockResolvedValue(undefined);
		this.deleteProduct.mockResolvedValue(undefined);
		
		this.getProductsByCategory.mockImplementation((category: string) => {
			return this.data.filter(product => product.category === category);
		});
		
		this.getProductsInPriceRange.mockImplementation((minPrice: number, maxPrice: number) => {
			return this.data.filter(product => 
				product.price >= minPrice && product.price <= maxPrice
			);
		});
		
		this.getTotalValue.mockImplementation(() => {
			return this.data.reduce((total, product) => total + product.price, 0);
		});
	}
}