<script lang="ts">
	import * as Dialog from '$lib/ui/components/dialog';
	import { Input } from '$lib/ui/components/input';
	import { Button } from '$lib/ui/components/button';
	import { Textarea } from '$lib/ui/components/textarea';
	import { Label } from '$lib/ui/components/label';
	import type { ProductViewModel } from './ProductViewModel.svelte';
	import type { ProductProps } from '../../domain/ProductDTO';
	import { getProductDefaults, ProductPropsSchema } from '../../domain/ProductDTO';

	let { viewModel }: { viewModel: ProductViewModel } = $props();

	let formData = $state<ProductProps>(getProductDefaults());
	let validationErrors = $state<Record<string, string>>({});
	let isSubmitting = $state(false);

	// Update form when selected product changes
	$effect(() => {
		if (viewModel.selectedProduct) {
			formData = {
				name: viewModel.selectedProduct.name,
				category: viewModel.selectedProduct.category,
				price: viewModel.selectedProduct.price,
				description: viewModel.selectedProduct.description || '',
				productPortfolioId: viewModel.selectedProduct.productPortfolioId
			};
			// Clear validation errors when loading new data
			validationErrors = {};
		}
	});

	// Validate form data
	function validateForm(): boolean {
		const result = ProductPropsSchema.safeParse(formData);

		if (!result.success) {
			const errors: Record<string, string> = {};
			result.error.errors.forEach((error) => {
				const fieldName = error.path[0] as string;
				errors[fieldName] = error.message;
			});
			validationErrors = errors;
			return false;
		}

		validationErrors = {};
		return true;
	}

	// Validate individual fields on change
	function validateField(fieldName: keyof ProductProps) {
		const fieldSchema = ProductPropsSchema.shape[fieldName];
		const result = fieldSchema.safeParse(formData[fieldName]);

		if (!result.success) {
			validationErrors = {
				...validationErrors,
				[fieldName]: result.error.errors[0]?.message || 'Invalid value'
			};
		} else {
			// Remove the field from validation errors if validation passes
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { [fieldName]: _, ...rest } = validationErrors;
			validationErrors = rest;
		}
	}

	async function handleSubmit() {
		if (!validateForm() || !viewModel.selectedProduct) {
			return;
		}

		isSubmitting = true;
		try {
			await viewModel.updateProduct(viewModel.selectedProduct._id, formData);
			viewModel.editDialogOpen = false;
		} catch (error) {
			console.error('Failed to update product:', error);
		} finally {
			isSubmitting = false;
		}
	}

	// Check if form can be submitted
	const canSubmit = $derived(() => {
		return (
			Object.keys(validationErrors).length === 0 &&
			formData.name &&
			formData.category &&
			formData.productPortfolioId
		);
	});
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
					onblur={() => validateField('name')}
					placeholder="Enter product name"
					required
					class={validationErrors.name ? 'border-destructive' : ''}
				/>
				{#if validationErrors.name}
					<p class="text-sm text-destructive" role="alert">
						{validationErrors.name}
					</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="edit-category">Category</Label>
				<Input
					id="edit-category"
					bind:value={formData.category}
					onblur={() => validateField('category')}
					placeholder="Enter category"
					required
					class={validationErrors.category ? 'border-destructive' : ''}
				/>
				{#if validationErrors.category}
					<p class="text-sm text-destructive" role="alert">
						{validationErrors.category}
					</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="edit-price">Price</Label>
				<Input
					id="edit-price"
					type="number"
					step="0.01"
					min="0"
					bind:value={formData.price}
					onblur={() => validateField('price')}
					placeholder="0.00"
					required
					class={validationErrors.price ? 'border-destructive' : ''}
				/>
				{#if validationErrors.price}
					<p class="text-sm text-destructive" role="alert">
						{validationErrors.price}
					</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="edit-productPortfolioId">Product Portfolio ID</Label>
				<Input
					id="edit-productPortfolioId"
					bind:value={formData.productPortfolioId}
					onblur={() => validateField('productPortfolioId')}
					placeholder="Enter product portfolio ID"
					required
					class={validationErrors.productPortfolioId ? 'border-destructive' : ''}
				/>
				{#if validationErrors.productPortfolioId}
					<p class="text-sm text-destructive" role="alert">
						{validationErrors.productPortfolioId}
					</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="edit-description">Description (Optional)</Label>
				<Textarea
					id="edit-description"
					bind:value={formData.description}
					onblur={() => validateField('description')}
					placeholder="Enter product description"
					rows={3}
					class={validationErrors.description ? 'border-destructive' : ''}
				/>
				{#if validationErrors.description}
					<p class="text-sm text-destructive" role="alert">
						{validationErrors.description}
					</p>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button
				type="button"
				variant="outline"
				onclick={() => (viewModel.editDialogOpen = false)}
				disabled={isSubmitting}
			>
				Cancel
			</Button>
			<Button type="button" onclick={handleSubmit} disabled={isSubmitting || !canSubmit()}>
				{isSubmitting ? 'Saving...' : 'Save Changes'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
