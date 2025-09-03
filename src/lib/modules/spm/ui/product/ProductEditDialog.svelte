<script lang="ts">
	import * as Dialog from '$lib/ui/components/dialog';
	import { Input } from '$lib/ui/components/input';
	import { Button } from '$lib/ui/components/button';
	import { Textarea } from '$lib/ui/components/textarea';
	import { Label } from '$lib/ui/components/label';
	import type { ProductViewModel } from './ProductViewModel.svelte';
	import type { ProductProps } from '../../domain/ProductDTO';

	let { viewModel }: { viewModel: ProductViewModel } = $props();

	let formData = $state<ProductProps>({
		name: '',
		category: '',
		price: 0,
		description: '',
		taxonomyNodeId: ''
	});

	let isSubmitting = $state(false);

	// Update form when selected product changes
	$effect(() => {
		if (viewModel.selectedProduct) {
			formData = {
				name: viewModel.selectedProduct.name,
				category: viewModel.selectedProduct.category,
				price: viewModel.selectedProduct.price,
				description: viewModel.selectedProduct.description || '',
				taxonomyNodeId: viewModel.selectedProduct.taxonomyNodeId
			};
		}
	});

	async function handleSubmit() {
		if (!formData.name || !formData.category || formData.price < 0 || !viewModel.selectedProduct) {
			return;
		}

		isSubmitting = true;
		try {
			// Add taxonomyNodeId to the update data
			const updateData = {
				...formData,
				taxonomyNodeId: viewModel.selectedProduct.taxonomyNodeId || 'default_category_id'
			};
			await viewModel.updateProduct(viewModel.selectedProduct._id, updateData);
			viewModel.editDialogOpen = false;
		} catch (error) {
			console.error('Failed to update product:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open={viewModel.editDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit Product</Dialog.Title>
			<Dialog.Description>
				Update the product details. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="edit-name">Product Name</Label>
				<Input
					id="edit-name"
					bind:value={formData.name}
					placeholder="Enter product name"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="edit-category">Category</Label>
				<Input
					id="edit-category"
					bind:value={formData.category}
					placeholder="Enter category"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="edit-price">Price</Label>
				<Input
					id="edit-price"
					type="number"
					step="0.01"
					min="0"
					bind:value={formData.price}
					placeholder="0.00"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="edit-description">Description (Optional)</Label>
				<Textarea
					id="edit-description"
					bind:value={formData.description}
					placeholder="Enter product description"
					rows={3}
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => (viewModel.editDialogOpen = false)}
				disabled={isSubmitting}
			>
				Cancel
			</Button>
			<Button
				onclick={handleSubmit}
				disabled={isSubmitting || !formData.name || !formData.category}
			>
				{isSubmitting ? 'Saving...' : 'Save Changes'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
