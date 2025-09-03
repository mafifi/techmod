<script lang="ts">
	import * as Dialog from '$lib/ui/components/dialog';
	import { Input } from '$lib/ui/components/input';
	import { Button } from '$lib/ui/components/button';
	import { Textarea } from '$lib/ui/components/textarea';
	import { Label } from '$lib/ui/components/label';
	import type { ProductViewModel } from './ProductViewModel.svelte';
	import type { ProductProps } from '../../domain/ProductDTO';

	let { viewModel }: { viewModel: ProductViewModel } = $props();

	// Dropdown options
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

	// Update form when selected product changes
	$effect(() => {
		if (viewModel.selectedProduct) {
			formData = {
				name: viewModel.selectedProduct.name || '',
				owningSuperDepartment: viewModel.selectedProduct.owningSuperDepartment || '',
				productOwner: viewModel.selectedProduct.productOwner || '',
				eonids: viewModel.selectedProduct.eonids || '',
				productOverview: viewModel.selectedProduct.productOverview || '',
				productRelatedLinks: viewModel.selectedProduct.productRelatedLinks || '',
				productType: viewModel.selectedProduct.productType || '',
				modernity: viewModel.selectedProduct.modernity || 'Continue',
				lifecycleStatus: viewModel.selectedProduct.lifecycleStatus || '',
				fleet: viewModel.selectedProduct.fleet || '',
				squad: viewModel.selectedProduct.squad || '',
				roadmapLink: viewModel.selectedProduct.roadmapLink || '',
				// Legacy optional fields
				description: viewModel.selectedProduct.description || '',
				price: viewModel.selectedProduct.price || 0,
				category: viewModel.selectedProduct.category || ''
			};
		}
	});

	// Form validation - more lenient for editing
	const isFormValid = $derived(
		formData.name.trim() !== '' &&
			formData.owningSuperDepartment.trim() !== '' &&
			formData.productOwner.trim() !== ''
		// Only require the most essential fields for editing
	);

	async function handleSubmit() {
		if (!viewModel.selectedProduct) {
			console.error('No product selected for editing');
			return;
		}

		// Clean the form data before validation
		const cleanedData = {
			name: formData.name.trim(),
			owningSuperDepartment: formData.owningSuperDepartment.trim(),
			productOwner: formData.productOwner.trim(),
			eonids: formData.eonids.trim(),
			productOverview: formData.productOverview.trim(),
			productRelatedLinks: formData.productRelatedLinks.trim(),
			productType: formData.productType.trim(),
			modernity: formData.modernity,
			lifecycleStatus: formData.lifecycleStatus.trim(),
			fleet: formData.fleet.trim(),
			squad: formData.squad.trim(),
			roadmapLink: formData.roadmapLink.trim(),
			// Legacy optional fields
			description: formData.description?.trim() || undefined,
			price: formData.price || undefined,
			category: formData.category?.trim() || undefined
		};

		// Basic validation
		if (!cleanedData.name || !cleanedData.owningSuperDepartment || !cleanedData.productOwner) {
			console.error('Form validation failed - missing required fields');
			alert('Please fill in all required fields');
			return;
		}

		isSubmitting = true;
		try {
			await viewModel.updateProduct(viewModel.selectedProduct._id, cleanedData);
			viewModel.editDialogOpen = false;
		} catch (error) {
			console.error('Failed to update product:', error);
			// Show user-friendly error message
			alert(
				`Unable to update product: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
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

		<div class="max-h-96 space-y-4 overflow-y-auto py-4">
			<!-- Core Product Information -->
			<div class="space-y-2">
				<Label for="edit-name">Product Name *</Label>
				<Input
					id="edit-name"
					bind:value={formData.name}
					placeholder="Enter product name"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="edit-owningSuperDepartment">Owning Super Department *</Label>
				<Input
					id="edit-owningSuperDepartment"
					bind:value={formData.owningSuperDepartment}
					placeholder="Enter owning super department"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="edit-productOwner">Product Owner *</Label>
				<Input
					id="edit-productOwner"
					bind:value={formData.productOwner}
					placeholder="Enter product owner name"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="edit-eonids">EON IDs *</Label>
				<Input id="edit-eonids" bind:value={formData.eonids} placeholder="Enter EON IDs" required />
			</div>

			<div class="space-y-2">
				<Label for="edit-productOverview">Product Overview *</Label>
				<Textarea
					id="edit-productOverview"
					bind:value={formData.productOverview}
					placeholder="Enter product overview"
					rows={3}
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="edit-productRelatedLinks">Product Related Links *</Label>
				<Textarea
					id="edit-productRelatedLinks"
					bind:value={formData.productRelatedLinks}
					placeholder="Enter related links (one per line)"
					rows={2}
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="edit-productType">Product Type *</Label>
				<select
					id="edit-productType"
					bind:value={formData.productType}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					required
				>
					<option value="">Select product type</option>
					{#each productTypeOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="space-y-2">
				<Label for="edit-modernity">Modernity *</Label>
				<select
					id="edit-modernity"
					bind:value={formData.modernity}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					required
				>
					{#each modernityOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="space-y-2">
				<Label for="edit-lifecycleStatus">Lifecycle Status *</Label>
				<select
					id="edit-lifecycleStatus"
					bind:value={formData.lifecycleStatus}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					required
				>
					<option value="">Select lifecycle status</option>
					{#each lifecycleStatusOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="space-y-2">
				<Label for="edit-fleet">Fleet *</Label>
				<Input id="edit-fleet" bind:value={formData.fleet} placeholder="Enter fleet" required />
			</div>

			<div class="space-y-2">
				<Label for="edit-squad">Squad *</Label>
				<Input id="edit-squad" bind:value={formData.squad} placeholder="Enter squad" required />
			</div>

			<div class="space-y-2">
				<Label for="edit-roadmapLink">Roadmap Link *</Label>
				<Input
					id="edit-roadmapLink"
					bind:value={formData.roadmapLink}
					placeholder="Enter roadmap link"
					required
				/>
			</div>

			<!-- Legacy Fields (Optional) -->
			<div class="border-t pt-4">
				<h4 class="mb-3 text-sm font-medium text-muted-foreground">Legacy Fields (Optional)</h4>

				<div class="space-y-2">
					<Label for="edit-description">Description</Label>
					<Textarea
						id="edit-description"
						bind:value={formData.description}
						placeholder="Enter product description"
						rows={2}
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
					/>
				</div>

				<div class="space-y-2">
					<Label for="edit-category">Category</Label>
					<Input id="edit-category" bind:value={formData.category} placeholder="Enter category" />
				</div>
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
			<Button onclick={handleSubmit} disabled={isSubmitting || !isFormValid}>
				{isSubmitting ? 'Saving...' : 'Save Changes'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
