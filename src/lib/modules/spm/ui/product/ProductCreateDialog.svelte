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
		taxonomyNodeId: '' // Required field for taxonomy reference
	});

	let isSubmitting = $state(false);

	function resetForm() {
		formData = {
			name: '',
			category: '',
			price: 0,
			description: '',
			taxonomyNodeId: ''
		};
	}

	async function handleSubmit() {
		if (!formData.name || !formData.category || formData.price < 0) {
			return;
		}

		isSubmitting = true;
		try {
			// Clean the form data - ensure description is properly handled
			const cleanFormData = {
				name: formData.name.trim(),
				category: formData.category.trim(),
				price: Number(formData.price),
				taxonomyNodeId: 'default_category_id', // TODO: Replace with actual taxonomy node selection
				description: formData.description?.trim() || undefined
			};

			console.log('Creating product with data:', cleanFormData);
			await viewModel.createProduct(cleanFormData);
			console.log('Product created successfully');
			resetForm();
			viewModel.createDialogOpen = false;
		} catch (error) {
			console.error('Failed to create product:', error);
			// You might want to show this error to the user in the UI
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open={viewModel.createDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add New Product</Dialog.Title>
			<Dialog.Description>
				Enter the details for the new product. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>

		<form
			id="create-product-form"
			onsubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				handleSubmit();
			}}
			class="space-y-4 py-4"
		>
			<div class="space-y-2">
				<Label for="create-name">Product Name</Label>
				<Input
					id="create-name"
					bind:value={formData.name}
					placeholder="Enter product name"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="create-category">Category</Label>
				<Input
					id="create-category"
					bind:value={formData.category}
					placeholder="Enter category"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="create-price">Price</Label>
				<Input
					id="create-price"
					type="number"
					step="0.01"
					min="0"
					bind:value={formData.price}
					placeholder="0.00"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="create-taxonomyNodeId">Taxonomy Node ID</Label>
				<Input
					id="create-taxonomyNodeId"
					bind:value={formData.taxonomyNodeId}
					placeholder="Enter taxonomy node ID"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="create-description">Description (Optional)</Label>
				<Textarea
					id="create-description"
					bind:value={formData.description}
					placeholder="Enter product description"
					rows={3}
				/>
			</div>
		</form>

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (viewModel.createDialogOpen = false)}>
				Cancel
			</Button>
			<Button
				type="submit"
				form="create-product-form"
				disabled={isSubmitting || !formData.name || !formData.category || !formData.taxonomyNodeId}
			>
				{isSubmitting ? 'Creating...' : 'Create Product'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
