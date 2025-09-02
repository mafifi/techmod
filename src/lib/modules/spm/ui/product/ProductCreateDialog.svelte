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

	// Initialize with all required fields and optional field placeholders
	let formData = $state<
		ProductProps & {
			description?: string;
			pdr?: string;
			businessCriticality?: string;
			lifecycleStage?: string;
			lastAssessmentDate?: number;
			nextReviewDate?: number;
		}
	>({
		name: '',
		category: '',
		price: 0,
		productOwner: '',
		department: '',
		superDepartment: '',
		modernity: 'MODERN' as const,
		description: '',
		pdr: '',
		businessCriticality: undefined,
		lifecycleStage: undefined,
		lastAssessmentDate: undefined,
		nextReviewDate: undefined
	});

	let isSubmitting = $state(false);
	let validationErrors = $state<Record<string, string>>({});

	// Enum options for dropdowns
	const modernityOptions = [
		{ value: 'LEGACY', label: 'Legacy' },
		{ value: 'TRANSITIONAL', label: 'Transitional' },
		{ value: 'MODERN', label: 'Modern' },
		{ value: 'CUTTING_EDGE', label: 'Cutting Edge' }
	];

	const criticalityOptions = [
		{ value: 'LOW', label: 'Low' },
		{ value: 'MEDIUM', label: 'Medium' },
		{ value: 'HIGH', label: 'High' },
		{ value: 'CRITICAL', label: 'Critical' }
	];

	const lifecycleOptions = [
		{ value: 'PLAN', label: 'Plan' },
		{ value: 'BUILD', label: 'Build' },
		{ value: 'RUN', label: 'Run' },
		{ value: 'RETIRE', label: 'Retire' }
	];

	function resetForm() {
		formData = {
			name: '',
			category: '',
			price: 0,
			productOwner: '',
			department: '',
			superDepartment: '',
			modernity: 'MODERN' as const,
			description: '',
			pdr: '',
			businessCriticality: undefined,
			lifecycleStage: undefined,
			lastAssessmentDate: undefined,
			nextReviewDate: undefined
		};
		validationErrors = {};
	}

	function validateForm(): boolean {
		validationErrors = {};

		try {
			// Clean the form data before validation
			const cleanData = {
				name: formData.name.trim(),
				category: formData.category.trim(),
				price: Number(formData.price),
				productOwner: formData.productOwner.trim(),
				department: formData.department.trim(),
				superDepartment: formData.superDepartment.trim(),
				modernity: formData.modernity,
				description: formData.description?.trim() || undefined,
				pdr: formData.pdr?.trim() || undefined,
				businessCriticality: formData.businessCriticality || undefined,
				lifecycleStage: formData.lifecycleStage || undefined,
				lastAssessmentDate: formData.lastAssessmentDate || undefined,
				nextReviewDate: formData.nextReviewDate || undefined
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
			// Clean and validate the form data
			const cleanFormData: ProductProps = {
				name: formData.name.trim(),
				category: formData.category.trim(),
				price: Number(formData.price),
				productOwner: formData.productOwner.trim(),
				department: formData.department.trim(),
				superDepartment: formData.superDepartment.trim(),
				modernity: formData.modernity,
				description: formData.description?.trim() || undefined,
				pdr: formData.pdr?.trim() || undefined,
				businessCriticality: formData.businessCriticality || undefined,
				lifecycleStage: formData.lifecycleStage || undefined,
				lastAssessmentDate: formData.lastAssessmentDate || undefined,
				nextReviewDate: formData.nextReviewDate || undefined
			};

			await viewModel.createProduct(cleanFormData);
			resetForm();
			viewModel.createDialogOpen = false;
		} catch (error) {
			console.error('Failed to create product:', error);
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
			<!-- Basic Information -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Basic Information</h3>

				<div class="grid grid-cols-2 gap-4">
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
						<Label for="category">Category *</Label>
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
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="price">Price *</Label>
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
					<div class="space-y-2">
						<Label for="modernity">Modernity Level *</Label>
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

			<!-- Organizational Information -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Organizational Information</h3>

				<div class="grid grid-cols-2 gap-4">
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

					<div class="space-y-2">
						<Label for="department">Department *</Label>
						<Input
							id="department"
							bind:value={formData.department}
							placeholder="Enter department"
							class={validationErrors.department ? 'border-destructive' : ''}
						/>
						{#if validationErrors.department}
							<p class="text-sm text-destructive">{validationErrors.department}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="superDepartment">Super Department *</Label>
					<Input
						id="superDepartment"
						bind:value={formData.superDepartment}
						placeholder="Enter super department"
						class={validationErrors.superDepartment ? 'border-destructive' : ''}
					/>
					{#if validationErrors.superDepartment}
						<p class="text-sm text-destructive">{validationErrors.superDepartment}</p>
					{/if}
				</div>
			</div>

			<!-- Portfolio Management -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Portfolio Management</h3>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="businessCriticality">Business Criticality</Label>
						<select
							id="businessCriticality"
							bind:value={formData.businessCriticality}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
						>
							<option value="">Select criticality level</option>
							{#each criticalityOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label for="lifecycleStage">Lifecycle Stage</Label>
						<select
							id="lifecycleStage"
							bind:value={formData.lifecycleStage}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
						>
							<option value="">Select lifecycle stage</option>
							{#each lifecycleOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="pdr">Portfolio Decision Record (PDR)</Label>
					<Input
						id="pdr"
						type="url"
						bind:value={formData.pdr}
						placeholder="https://company.com/pdr/product-123"
						class={validationErrors.pdr ? 'border-destructive' : ''}
					/>
					{#if validationErrors.pdr}
						<p class="text-sm text-destructive">{validationErrors.pdr}</p>
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
			<Button type="submit" form="create-product-form" disabled={isSubmitting}>
				{isSubmitting ? 'Creating...' : 'Create Product'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
