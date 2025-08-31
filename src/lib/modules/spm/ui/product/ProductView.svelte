<script lang="ts">
	import type { ProductViewModel } from './ProductViewModel.svelte';
	
	interface Props {
		viewModel: ProductViewModel;
	}
	
	let { viewModel }: Props = $props();
</script>

<!-- Product Management View - Dumb presentation component -->
<div class="product-view">
	<h1>Products</h1>
	
	{#if viewModel.isLoading}
		<div class="loading">Loading products...</div>
	{:else if viewModel.error}
		<div class="error">Error: {viewModel.error.message}</div>
	{:else if viewModel.data.length === 0}
		<div class="empty">No products found</div>
	{:else}
		<div class="products-grid">
			{#each viewModel.data as product (product._id)}
				<div class="product-card">
					<h3>{product.name}</h3>
					<p class="category">{product.category}</p>
					<p class="price">${product.price.toFixed(2)}</p>
					{#if product.description}
						<p class="description">{product.description}</p>
					{/if}
					<div class="actions">
						<button
							type="button"
							onclick={() => viewModel.deleteProduct(product._id)}
							class="delete-button"
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
		
		<div class="summary">
			<p>Total Products: {viewModel.data.length}</p>
			<p>Total Value: ${viewModel.getTotalValue().toFixed(2)}</p>
		</div>
	{/if}
</div>

<style>
	.product-view {
		padding: 1rem;
	}
	
	.loading,
	.error,
	.empty {
		padding: 2rem;
		text-align: center;
	}
	
	.error {
		color: red;
	}
	
	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}
	
	.product-card {
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 1rem;
	}
	
	.product-card h3 {
		margin: 0 0 0.5rem 0;
	}
	
	.category {
		color: #666;
		font-size: 0.9rem;
		margin: 0.25rem 0;
	}
	
	.price {
		font-weight: bold;
		font-size: 1.1rem;
		color: #2d5a2d;
		margin: 0.25rem 0;
	}
	
	.description {
		font-size: 0.9rem;
		margin: 0.5rem 0;
	}
	
	.actions {
		margin-top: 1rem;
	}
	
	.delete-button {
		background-color: #dc3545;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}
	
	.delete-button:hover {
		background-color: #c82333;
	}
	
	.summary {
		border-top: 1px solid #ccc;
		padding-top: 1rem;
		display: flex;
		gap: 2rem;
	}
	
	.summary p {
		margin: 0;
		font-weight: bold;
	}
</style>