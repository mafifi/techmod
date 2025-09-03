<script lang="ts">
	import * as Dialog from '$lib/ui/components/dialog';
	import { Input } from '$lib/ui/components/input';
	import { Button } from '$lib/ui/components/button';
	import { Textarea } from '$lib/ui/components/textarea';
	import { Label } from '$lib/ui/components/label';
	import type { ProductViewModel } from './ProductViewModel.svelte';
	import { ProductPropsSchema, type ProductProps } from '../../domain/ProductDTO';
	import { toast } from 'svelte-sonner';

	let { viewModel }: { viewModel: ProductViewModel } = $props();

	// Initialize with all required fields
	let formData = $state<ProductProps>({
		name: '',
		owningSuperDepartment: '',
		productOwner: '',
		eonids: '',
		productOverview: '',
		productRelatedLinks: '',
		productType: '',
		modernity: 'Continue',
		lifecycleStatus: '',
		fleet: '',
		squad: '',
		roadmapLink: '',
		// Legacy optional fields
		description: '',
		price: 0,
		category: ''
	});

	let isSubmitting = $state(false);
	let validationErrors = $state<Record<string, string>>({});

	// Enum options for dropdowns
	const modernityOptions = [
		{ value: 'Migrate', label: 'Migrate' },
		{ value: 'Hold', label: 'Hold' },
		{ value: 'Continue', label: 'Continue' },
		{ value: 'Adopt', label: 'Adopt' },
		{ value: 'Assess', label: 'Assess' }
	];

	const productTypeOptions = [
		{ value: 'Application', label: 'Application' },
		{ value: 'Platform', label: 'Platform' },
		{ value: 'Service', label: 'Service' },
		{ value: 'Infrastructure', label: 'Infrastructure' },
		{ value: 'Data Product', label: 'Data Product' },
		{ value: 'API', label: 'API' }
	];

	const lifecycleStatusOptions = [
		{ value: 'Active', label: 'Active' },
		{ value: 'Development', label: 'Development' },
		{ value: 'Deprecated', label: 'Deprecated' },
		{ value: 'Sunset', label: 'Sunset' },
		{ value: 'Planned', label: 'Planned' }
	];

	// Form validation
	const isFormValid = $derived(
		formData.name.trim() !== '' &&
			formData.owningSuperDepartment.trim() !== '' &&
			formData.productOwner.trim() !== '' &&
			formData.eonids.trim() !== '' &&
			formData.productOverview.trim() !== '' &&
			formData.productRelatedLinks.trim() !== '' &&
			formData.productType.trim() !== '' &&
			formData.modernity.trim() !== '' &&
			formData.lifecycleStatus.trim() !== '' &&
			formData.fleet.trim() !== '' &&
			formData.squad.trim() !== '' &&
			formData.roadmapLink.trim() !== ''
	);
	function resetForm() {
		formData = {
			name: '',
			owningSuperDepartment: '',
			productOwner: '',
			eonids: '',
			productOverview: '',
			productRelatedLinks: '',
			productType: '',
			modernity: 'Continue',
			lifecycleStatus: '',
			fleet: '',
			squad: '',
			roadmapLink: '',
			// Legacy optional fields
			description: '',
			price: 0,
			category: ''
		};
		validationErrors = {};
	}

	function validateForm(): boolean {
		validationErrors = {};

		try {
			// Clean the form data before validation - safely handle undefined values
			const cleanData: ProductProps = {
				name: (formData.name || '').trim(),
				owningSuperDepartment: (formData.owningSuperDepartment || '').trim(),
				productOwner: (formData.productOwner || '').trim(),
				eonids: (formData.eonids || '').trim(),
				productOverview: (formData.productOverview || '').trim(),
				productRelatedLinks: (formData.productRelatedLinks || '').trim(),
				productType: (formData.productType || '').trim(),
				modernity: formData.modernity,
				lifecycleStatus: (formData.lifecycleStatus || '').trim(),
				fleet: (formData.fleet || '').trim(),
				squad: (formData.squad || '').trim(),
				roadmapLink: (formData.roadmapLink || '').trim(),
				// Legacy optional fields
				description: formData.description?.trim() || undefined,
				price: formData.price ? Number(formData.price) : undefined,
				category: formData.category?.trim() || undefined
			};

			// Use Zod schema validation
			ProductPropsSchema.parse(cleanData);
			return true;
		} catch (error: unknown) {
			if (error && typeof error === 'object' && 'errors' in error) {
				const zodError = error as { errors: Array<{ path: string[]; message: string }> };
				zodError.errors.forEach((err) => {
					const field = err.path[0];
					validationErrors[field] = err.message;
				});
			}
			return false;
		}
	}

	async function handleSubmit() {
		if (!validateForm()) {
			toast.error('Please fix validation errors');
			return;
		}

		isSubmitting = true;
		try {
			// Clean the form data using the same logic as validation
			const cleanFormData: ProductProps = {
				name: (formData.name || '').trim(),
				owningSuperDepartment: (formData.owningSuperDepartment || '').trim(),
				productOwner: (formData.productOwner || '').trim(),
				eonids: (formData.eonids || '').trim(),
				productOverview: (formData.productOverview || '').trim(),
				productRelatedLinks: (formData.productRelatedLinks || '').trim(),
				productType: (formData.productType || '').trim(),
				modernity: formData.modernity,
				lifecycleStatus: (formData.lifecycleStatus || '').trim(),
				fleet: (formData.fleet || '').trim(),
				squad: (formData.squad || '').trim(),
				roadmapLink: (formData.roadmapLink || '').trim(),
				// Legacy optional fields
				description: formData.description?.trim() || undefined,
				price: formData.price ? Number(formData.price) : undefined,
				category: formData.category?.trim() || undefined
			};

			await viewModel.createProduct(cleanFormData);
			resetForm();
			viewModel.createDialogOpen = false;
			toast.success('Product created successfully!');
		} catch (error) {
			console.error('Failed to create product:', error);
			toast.error('Failed to create product. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open={viewModel.createDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Add New Product</Dialog.Title>
			<Dialog.Description>
				Enter the details for the new product. Fields marked with * are required.
			</Dialog.Description>
		</Dialog.Header>

		<form id="create-product-form" onsubmit={handleSubmit} class="space-y-6 py-4">
			<!-- Core Product Information -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Core Product Information</h3>

				<div class="space-y-2">
					<Label for="name">Product Name *</Label>
					<Input
						id="name"
						bind:value={formData.name}
						placeholder="Enter product name"
						class={validationErrors.name ? 'border-destructive' : ''}
					/>
					{#if validationErrors.name}
						<p class="text-sm text-destructive">{validationErrors.name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="productOverview">Product Overview *</Label>
					<Textarea
						id="productOverview"
						bind:value={formData.productOverview}
						placeholder="Describe the purpose, scope, and business value of this product"
						rows={4}
						class={validationErrors.productOverview ? 'border-destructive' : ''}
					/>
					{#if validationErrors.productOverview}
						<p class="text-sm text-destructive">{validationErrors.productOverview}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="productType">Product Type *</Label>
						<select
							id="productType"
							bind:value={formData.productType}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
						>
							<option value="">Select product type</option>
							{#each productTypeOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						{#if validationErrors.productType}
							<p class="text-sm text-destructive">{validationErrors.productType}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="eonids">EONIDs *</Label>
						<Input
							id="eonids"
							bind:value={formData.eonids}
							placeholder="e.g., EON-1234-567"
							class={validationErrors.eonids ? 'border-destructive' : ''}
						/>
						{#if validationErrors.eonids}
							<p class="text-sm text-destructive">{validationErrors.eonids}</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Organizational Information -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Organizational Information</h3>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="owningSuperDepartment">Owning Super Department *</Label>
						<Input
							id="owningSuperDepartment"
							bind:value={formData.owningSuperDepartment}
							placeholder="e.g., Technology, Business, Operations"
							class={validationErrors.owningSuperDepartment ? 'border-destructive' : ''}
						/>
						{#if validationErrors.owningSuperDepartment}
							<p class="text-sm text-destructive">{validationErrors.owningSuperDepartment}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="productOwner">Product Owner *</Label>
						<Input
							id="productOwner"
							bind:value={formData.productOwner}
							placeholder="Enter product owner name"
							class={validationErrors.productOwner ? 'border-destructive' : ''}
						/>
						{#if validationErrors.productOwner}
							<p class="text-sm text-destructive">{validationErrors.productOwner}</p>
						{/if}
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="fleet">Fleet *</Label>
						<Input
							id="fleet"
							bind:value={formData.fleet}
							placeholder="e.g., Web Services, Mobile Apps"
							class={validationErrors.fleet ? 'border-destructive' : ''}
						/>
						{#if validationErrors.fleet}
							<p class="text-sm text-destructive">{validationErrors.fleet}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="squad">Squad *</Label>
						<Input
							id="squad"
							bind:value={formData.squad}
							placeholder="e.g., Alpha Squad, Beta Squad"
							class={validationErrors.squad ? 'border-destructive' : ''}
						/>
						{#if validationErrors.squad}
							<p class="text-sm text-destructive">{validationErrors.squad}</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Product Management -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Product Management</h3>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="modernity">Modernity *</Label>
						<select
							id="modernity"
							bind:value={formData.modernity}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
						>
							{#each modernityOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						{#if validationErrors.modernity}
							<p class="text-sm text-destructive">{validationErrors.modernity}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="lifecycleStatus">Lifecycle Status *</Label>
						<select
							id="lifecycleStatus"
							bind:value={formData.lifecycleStatus}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
						>
							<option value="">Select lifecycle status</option>
							{#each lifecycleStatusOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						{#if validationErrors.lifecycleStatus}
							<p class="text-sm text-destructive">{validationErrors.lifecycleStatus}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="roadmapLink">Roadmap Link *</Label>
					<Input
						id="roadmapLink"
						type="url"
						bind:value={formData.roadmapLink}
						placeholder="https://roadmap.company.com/product/123"
						class={validationErrors.roadmapLink ? 'border-destructive' : ''}
					/>
					{#if validationErrors.roadmapLink}
						<p class="text-sm text-destructive">{validationErrors.roadmapLink}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="productRelatedLinks">Product Related Links *</Label>
					<Textarea
						id="productRelatedLinks"
						bind:value={formData.productRelatedLinks}
						placeholder="Enter comma-separated links: Confluence docs, JIRA projects, etc."
						rows={2}
						class={validationErrors.productRelatedLinks ? 'border-destructive' : ''}
					/>
					{#if validationErrors.productRelatedLinks}
						<p class="text-sm text-destructive">{validationErrors.productRelatedLinks}</p>
					{/if}
				</div>
			</div>

			<!-- Legacy Fields (Optional) -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Legacy Information (Optional)</h3>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="category">Category</Label>
						<Input
							id="category"
							bind:value={formData.category}
							placeholder="Enter category"
							class={validationErrors.category ? 'border-destructive' : ''}
						/>
						{#if validationErrors.category}
							<p class="text-sm text-destructive">{validationErrors.category}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="price">Price</Label>
						<Input
							id="price"
							type="number"
							step="0.01"
							min="0"
							bind:value={formData.price}
							placeholder="0.00"
							class={validationErrors.price ? 'border-destructive' : ''}
						/>
						{#if validationErrors.price}
							<p class="text-sm text-destructive">{validationErrors.price}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						bind:value={formData.description}
						placeholder="Enter product description"
						rows={3}
						class={validationErrors.description ? 'border-destructive' : ''}
					/>
					{#if validationErrors.description}
						<p class="text-sm text-destructive">{validationErrors.description}</p>
					{/if}
				</div>
			</div>
		</form>

		<Dialog.Footer>
			<Button
				type="button"
				variant="outline"
				onclick={() => {
					resetForm();
					viewModel.createDialogOpen = false;
				}}
				disabled={isSubmitting}
			>
				Cancel
			</Button>
			<Button type="submit" form="create-product-form" disabled={isSubmitting || !isFormValid}>
				{isSubmitting ? 'Creating...' : 'Create Product'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
