<script lang="ts">
	import * as Dialog from '$lib/ui/components/dialog';
	import { Input } from '$lib/ui/components/input';
	import { Button } from '$lib/ui/components/button';
	import { Textarea } from '$lib/ui/components/textarea';
	import { Label } from '$lib/ui/components/label';
	import { createForm } from '@tanstack/svelte-form';
	import type { ProductViewModel } from './ProductViewModel.svelte';
	import { ProductPropsSchema, getProductDefaults } from '../../domain/ProductDTO';

	let { viewModel }: { viewModel: ProductViewModel } = $props();

	const form = createForm(() => ({
		defaultValues: getProductDefaults(),
		validators: {
			onChange: ProductPropsSchema
		},
		onSubmit: async ({ value }) => {
			try {
				console.log('Creating product with data:', value);
				await viewModel.createProduct(value);
				console.log('Product created successfully');
				form.reset();
				viewModel.createDialogOpen = false;
			} catch (error) {
				console.error('Failed to create product:', error);
			}
		}
	}));
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
				form.handleSubmit();
			}}
			class="space-y-4 py-4"
		>
			<form.Field name="name" validators={{ onChange: ProductPropsSchema.shape.name }}>
				{#snippet children(field)}
					<div class="space-y-2">
						<Label for={field.name}>Product Name</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange((e.target as HTMLInputElement).value)}
							placeholder="Enter product name"
							class={field.state.meta.errors.length ? 'border-red-500' : ''}
						/>
						{#if field.state.meta.errors.length}
							<p class="text-sm text-red-500" role="alert">{field.state.meta.errors.join(', ')}</p>
						{/if}
					</div>
				{/snippet}
			</form.Field>

			<form.Field name="category" validators={{ onChange: ProductPropsSchema.shape.category }}>
				{#snippet children(field)}
					<div class="space-y-2">
						<Label for={field.name}>Category</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange((e.target as HTMLInputElement).value)}
							placeholder="Enter category"
							class={field.state.meta.errors.length ? 'border-red-500' : ''}
						/>
						{#if field.state.meta.errors.length}
							<p class="text-sm text-red-500" role="alert">{field.state.meta.errors.join(', ')}</p>
						{/if}
					</div>
				{/snippet}
			</form.Field>

			<form.Field name="price" validators={{ onChange: ProductPropsSchema.shape.price }}>
				{#snippet children(field)}
					<div class="space-y-2">
						<Label for={field.name}>Price</Label>
						<Input
							id={field.name}
							name={field.name}
							type="number"
							step="0.01"
							min="0"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(Number((e.target as HTMLInputElement).value))}
							placeholder="0.00"
							class={field.state.meta.errors.length ? 'border-red-500' : ''}
						/>
						{#if field.state.meta.errors.length}
							<p class="text-sm text-red-500" role="alert">{field.state.meta.errors.join(', ')}</p>
						{/if}
					</div>
				{/snippet}
			</form.Field>

			<form.Field
				name="productPortfolioId"
				validators={{ onChange: ProductPropsSchema.shape.productPortfolioId }}
			>
				{#snippet children(field)}
					<div class="space-y-2">
						<Label for={field.name}>Product Portfolio ID</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange((e.target as HTMLInputElement).value)}
							placeholder="Enter product portfolio ID"
							class={field.state.meta.errors.length ? 'border-red-500' : ''}
						/>
						{#if field.state.meta.errors.length}
							<p class="text-sm text-red-500" role="alert">{field.state.meta.errors.join(', ')}</p>
						{/if}
					</div>
				{/snippet}
			</form.Field>

			<form.Field
				name="description"
				validators={{ onChange: ProductPropsSchema.shape.description }}
			>
				{#snippet children(field)}
					<div class="space-y-2">
						<Label for={field.name}>Description (Optional)</Label>
						<Textarea
							id={field.name}
							name={field.name}
							value={field.state.value || ''}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange((e.target as HTMLInputElement).value)}
							placeholder="Enter product description"
							rows={3}
							class={field.state.meta.errors.length ? 'border-red-500' : ''}
						/>
						{#if field.state.meta.errors.length}
							<p class="text-sm text-red-500" role="alert">{field.state.meta.errors.join(', ')}</p>
						{/if}
					</div>
				{/snippet}
			</form.Field>
		</form>

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (viewModel.createDialogOpen = false)}>
				Cancel
			</Button>
			<form.Subscribe
				selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
			>
				{#snippet children(state)}
					<Button
						type="submit"
						form="create-product-form"
						disabled={!state.canSubmit || state.isSubmitting}
					>
						{state.isSubmitting ? 'Creating...' : 'Create Product'}
					</Button>
				{/snippet}
			</form.Subscribe>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
