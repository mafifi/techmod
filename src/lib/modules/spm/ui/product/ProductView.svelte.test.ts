import { page } from '@vitest/browser/context';
import { describe, expect, it, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProductView from './ProductView.svelte';
import { ProductViewModelMock } from './ProductViewModelMock';
import { ProductDTOMock } from '../../domain/ProductDTOMock';

describe('ProductView.svelte', () => {
	let mockViewModel: ProductViewModelMock;

	beforeEach(() => {
		mockViewModel = new ProductViewModelMock();
	});

	describe('Loading State', () => {
		it('should display loading message when isLoading is true', async () => {
			mockViewModel.simulateLoading();

			render(ProductView, { props: { viewModel: mockViewModel } });

			const loadingElement = page.getByText('Loading products...');
			await expect.element(loadingElement).toBeInTheDocument();
		});

		it('should not display products grid when loading', async () => {
			mockViewModel.simulateLoading();

			render(ProductView, { props: { viewModel: mockViewModel } });

			const productsGrid = page.locator('.products-grid');
			await expect.element(productsGrid).not.toBeInTheDocument();
		});
	});

	describe('Error State', () => {
		it('should display error message when error exists', async () => {
			const errorMessage = 'Failed to load products';
			mockViewModel.simulateError(new Error(errorMessage));

			render(ProductView, { props: { viewModel: mockViewModel } });

			const errorElement = page.getByText(`Error: ${errorMessage}`);
			await expect.element(errorElement).toBeInTheDocument();
		});

		it('should not display products when there is an error', async () => {
			mockViewModel.simulateError(new Error('Test error'));

			render(ProductView, { props: { viewModel: mockViewModel } });

			const productsGrid = page.locator('.products-grid');
			await expect.element(productsGrid).not.toBeInTheDocument();
		});
	});

	describe('Empty State', () => {
		it('should display empty message when no products exist', async () => {
			mockViewModel.simulateEmpty();

			render(ProductView, { props: { viewModel: mockViewModel } });

			const emptyElement = page.getByText('No products found');
			await expect.element(emptyElement).toBeInTheDocument();
		});

		it('should not display products grid when empty', async () => {
			mockViewModel.simulateEmpty();

			render(ProductView, { props: { viewModel: mockViewModel } });

			const productsGrid = page.locator('.products-grid');
			await expect.element(productsGrid).not.toBeInTheDocument();
		});
	});

	describe('Success State with Data', () => {
		beforeEach(() => {
			const mockProducts = ProductDTOMock.createProductArray(3, { price: 100 });
			mockViewModel.simulateSuccess(mockProducts);
		});

		it('should display products heading', async () => {
			render(ProductView, { props: { viewModel: mockViewModel } });

			const heading = page.getByRole('heading', { level: 1, name: 'Products' });
			await expect.element(heading).toBeInTheDocument();
		});

		it('should display all products in grid', async () => {
			render(ProductView, { props: { viewModel: mockViewModel } });

			const productsGrid = page.locator('.products-grid');
			await expect.element(productsGrid).toBeInTheDocument();

			const productCards = page.locator('.product-card');
			await expect.element(productCards).toHaveLength(3);
		});

		it('should display product details correctly', async () => {
			const mockProducts = [
				ProductDTOMock.createProduct({
					name: 'Test Product',
					category: 'Software',
					price: 99.99,
					description: 'Test description'
				})
			];
			mockViewModel.simulateSuccess(mockProducts);

			render(ProductView, { props: { viewModel: mockViewModel } });

			// Check product name
			const productName = page.getByText('Test Product');
			await expect.element(productName).toBeInTheDocument();

			// Check category
			const category = page.getByText('Software');
			await expect.element(category).toBeInTheDocument();

			// Check price
			const price = page.getByText('$99.99');
			await expect.element(price).toBeInTheDocument();

			// Check description
			const description = page.getByText('Test description');
			await expect.element(description).toBeInTheDocument();
		});

		it('should handle products without description', async () => {
			const mockProducts = [
				ProductDTOMock.createProduct({
					name: 'No Description Product',
					category: 'Software',
					price: 50.00
					// description omitted
				})
			];
			mockViewModel.simulateSuccess(mockProducts);

			render(ProductView, { props: { viewModel: mockViewModel } });

			const productName = page.getByText('No Description Product');
			await expect.element(productName).toBeInTheDocument();
		});

		it('should display summary information', async () => {
			render(ProductView, { props: { viewModel: mockViewModel } });

			// Total products count
			const totalProducts = page.getByText('Total Products: 3');
			await expect.element(totalProducts).toBeInTheDocument();

			// Total value (3 products × $100 = $300)
			const totalValue = page.getByText('Total Value: $300.00');
			await expect.element(totalValue).toBeInTheDocument();
		});
	});

	describe('User Interactions', () => {
		it('should call deleteProduct when delete button is clicked', async () => {
			const mockProducts = ProductDTOMock.createProductArray(1);
			mockViewModel.simulateSuccess(mockProducts);

			render(ProductView, { props: { viewModel: mockViewModel } });

			const deleteButton = page.getByRole('button', { name: 'Delete' });
			await deleteButton.click();

			expect(mockViewModel.deleteProduct).toHaveBeenCalledWith(mockProducts[0]._id);
		});

		it('should call deleteProduct for correct product ID', async () => {
			const mockProducts = [
				ProductDTOMock.createProduct({ _id: 'product_1', name: 'Product 1' }),
				ProductDTOMock.createProduct({ _id: 'product_2', name: 'Product 2' })
			];
			mockViewModel.simulateSuccess(mockProducts);

			render(ProductView, { props: { viewModel: mockViewModel } });

			// Get all delete buttons and click the second one
			const deleteButtons = page.locator('.delete-button');
			await deleteButtons.nth(1).click();

			expect(mockViewModel.deleteProduct).toHaveBeenCalledWith('product_2');
		});
	});

	describe('Business Logic Integration', () => {
		it('should call getTotalValue from viewModel for summary', async () => {
			const mockProducts = ProductDTOMock.createProductArray(2, { price: 150 });
			mockViewModel.simulateSuccess(mockProducts);

			render(ProductView, { props: { viewModel: mockViewModel } });

			// Verify getTotalValue was called
			expect(mockViewModel.getTotalValue).toHaveBeenCalled();

			// Check that the UI displays the result
			const totalValue = page.getByText('Total Value: $300.00');
			await expect.element(totalValue).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper heading structure', async () => {
			mockViewModel.simulateSuccess(ProductDTOMock.createProductArray(1));

			render(ProductView, { props: { viewModel: mockViewModel } });

			const mainHeading = page.getByRole('heading', { level: 1 });
			await expect.element(mainHeading).toBeInTheDocument();

			const productHeadings = page.getByRole('heading', { level: 3 });
			await expect.element(productHeadings).toHaveLength(1);
		});

		it('should have accessible buttons', async () => {
			mockViewModel.simulateSuccess(ProductDTOMock.createProductArray(2));

			render(ProductView, { props: { viewModel: mockViewModel } });

			const deleteButtons = page.getByRole('button', { name: 'Delete' });
			await expect.element(deleteButtons).toHaveLength(2);
		});
	});
});