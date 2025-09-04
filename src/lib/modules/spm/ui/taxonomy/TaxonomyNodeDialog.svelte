<script lang="ts">
	import { Button } from '$lib/ui/components/button';
	import { Input } from '$lib/ui/components/input';
	import { Textarea } from '$lib/ui/components/textarea';
	import { Label } from '$lib/ui/components/label';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/ui/components/select';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/ui/components/dialog';
	import { Badge } from '$lib/ui/components/badge';
	import { Alert, AlertDescription } from '$lib/ui/components/alert';
	import { Separator } from '$lib/ui/components/separator';
	import {
		TaxonomyNodePropsSchema,
		PortfolioPropsSchema,
		LinePropsSchema,
		CategoryPropsSchema,
		type TaxonomyNode,
		type TaxonomyNodeType
	} from '../../domain/TaxonomyNodeDTO';
	import type { Id } from '../../../../../convex/_generated/dataModel';
	import { Folder, Package, Tag, AlertCircle } from '@lucide/svelte';
	import { z } from 'zod';

	// Props
	interface TaxonomyHierarchyNode extends TaxonomyNode {
		children: TaxonomyHierarchyNode[];
	}

	interface Props {
		mode: 'create' | 'edit';
		node?: TaxonomyNode;
		nodeType: TaxonomyNodeType;
		parentId?: Id<'taxonomyNodes'> | null;
		validParentOptions: TaxonomyHierarchyNode[];
		// Data submitted from the dialog — keep narrow to avoid `any`
		onSubmit: (data: SubmitData) => Promise<void>;
		onCancel: () => void;
	}

	// Shape of the payload we submit from this dialog
	type SubmitData = {
		name: string;
		description: string;
		strategy?: string;
		parentId: Id<'taxonomyNodes'> | null;
		isActive: boolean;
		type: TaxonomyNodeType;
	};

	let {
		mode,
		node,
		nodeType,
		parentId = null,
		validParentOptions,
		onSubmit,
		onCancel
	}: Props = $props();

	// Type information
	const typeInfo = {
		portfolio: {
			icon: Folder,
			color: 'bg-blue-100 text-blue-800 border-blue-200',
			darkColor: 'dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
			label: 'Portfolio',
			description: 'A high-level grouping of related product lines',
			canHaveParent: false
		},
		line: {
			icon: Package,
			color: 'bg-green-100 text-green-800 border-green-200',
			darkColor: 'dark:bg-green-900 dark:text-green-200 dark:border-green-800',
			label: 'Product Line',
			description: 'A collection of related products or services',
			canHaveParent: true,
			parentType: 'portfolio'
		},
		category: {
			icon: Tag,
			color: 'bg-purple-100 text-purple-800 border-purple-200',
			darkColor: 'dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800',
			label: 'Category',
			description: 'A specific classification within a product line',
			canHaveParent: true,
			parentType: 'line'
		}
	};

	// Form state
	let formData = $state({
		name: node?.name ?? '',
		description: node?.description ?? '',
		strategy: node?.strategy ?? '',
		parentId: node?.parentId ?? parentId ?? null,
		isActive: node?.isActive ?? true
	});

	// Local string-backed select value to avoid passing boolean directly into Select primitive
	// eslint-disable-next-line svelte/prefer-writable-derived
	let selectIsActive = $state<string>(formData.isActive ? 'true' : 'false');
	// eslint-disable-next-line svelte/prefer-writable-derived
	let selectParentId = $state<string>(formData.parentId || '');

	// Keep form data in sync with select values using effects
	$effect(() => {
		selectIsActive = formData.isActive ? 'true' : 'false';
	});

	$effect(() => {
		selectParentId = formData.parentId || '';
	});

	let errors = $state<Record<string, string>>({});
	let isSubmitting = $state(false);

	// Get appropriate schema for validation
	function getValidationSchema() {
		switch (nodeType) {
			case 'portfolio':
				return PortfolioPropsSchema.omit({
					createdBy: true,
					updatedBy: true,
					lastModified: true,
					changeHistory: true,
					version: true
				});
			case 'line':
				return LinePropsSchema.omit({
					createdBy: true,
					updatedBy: true,
					lastModified: true,
					changeHistory: true,
					version: true
				});
			case 'category':
				return CategoryPropsSchema.omit({
					createdBy: true,
					updatedBy: true,
					lastModified: true,
					changeHistory: true,
					version: true
				});
			default:
				return TaxonomyNodePropsSchema.omit({
					createdBy: true,
					updatedBy: true,
					lastModified: true,
					changeHistory: true,
					version: true
				});
		}
	}

	// Validation
	function validateForm(): boolean {
		errors = {};
		const schema = getValidationSchema();

		try {
			const dataToValidate = {
				...formData,
				type: nodeType,
				// Convert parentId to proper type for validation
				parentId: formData.parentId === '' ? null : formData.parentId
			};

			schema.parse(dataToValidate);
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				error.errors.forEach((err) => {
					const path = err.path.join('.');
					errors[path] = err.message;
				});
			}
			return false;
		}
	}

	// Form handlers
	async function handleSubmit() {
		if (!validateForm()) return;

		isSubmitting = true;

		try {
			const submitData: SubmitData = {
				name: formData.name?.trim() || '',
				description: formData.description?.trim() || '',
				strategy: formData.strategy?.trim() || undefined,
				parentId:
					formData.parentId === '' ? null : (formData.parentId as Id<'taxonomyNodes'> | null),
				isActive: formData.isActive ?? true,
				type: nodeType
			};

			await onSubmit(submitData);
		} catch (error) {
			// Bubble up a console error to help debugging in tests/CI while parent handles UI
			console.error('TaxonomyNodeDialog submit error', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		onCancel();
	}

	// Get dialog title and description
	const info = typeInfo[nodeType];
	const Icon = info.icon;
	const title = mode === 'create' ? `Create ${info.label}` : `Edit ${info.label}`;
	const description =
		mode === 'create'
			? `Add a new ${info.label.toLowerCase()} to your taxonomy`
			: `Update the details of this ${info.label.toLowerCase()}`;

	// Parent selection helpers

	// Precompute parent type label to avoid indexing issues in template
	const parentTypeName = $derived(() => {
		const infoWithParent = info as { parentType?: keyof typeof typeInfo };
		return infoWithParent.parentType ? typeInfo[infoWithParent.parentType].label : '';
	});
</script>

<Dialog open={true}>
	<DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
		<DialogHeader>
			<DialogTitle class="flex items-center gap-3">
				<div class="flex items-center gap-2">
					<Icon class="h-5 w-5" />
					<Badge variant="outline" class={`${info.color} ${info.darkColor}`}>
						{info.label}
					</Badge>
				</div>
				{title}
			</DialogTitle>
			<DialogDescription>
				{description}
				{#if info.canHaveParent}
					Must belong to a {parentTypeName().toLowerCase()}.
				{/if}
			</DialogDescription>
		</DialogHeader>

		<div class="grid gap-6 py-4">
			<!-- Basic Information -->
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<!-- Name -->
					<div class="space-y-2">
						<Label for="name">Name *</Label>
						<Input
							id="name"
							bind:value={formData.name}
							placeholder={`Enter ${info.label.toLowerCase()} name`}
							class={errors.name ? 'border-red-500 focus:border-red-500' : ''}
						/>
						{#if errors.name}
							<p class="flex items-center gap-1 text-sm text-red-600">
								<AlertCircle class="h-3 w-3" />
								{errors.name}
							</p>
						{/if}
					</div>

					<!-- Active Status -->
					<div class="space-y-2">
						<Label for="status">Status</Label>
						<Select
							type="single"
							bind:value={selectIsActive}
							onValueChange={(value) => (formData.isActive = value === 'true')}
						>
							<SelectTrigger id="status">
								{selectIsActive === 'true' ? 'Active' : 'Inactive'}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="true">Active</SelectItem>
								<SelectItem value="false">Inactive</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<!-- Description -->
				<div class="space-y-2">
					<Label for="description">Description *</Label>
					<Textarea
						id="description"
						bind:value={formData.description}
						placeholder={`Describe this ${info.label.toLowerCase()}`}
						rows={3}
						class={errors.description ? 'border-red-500 focus:border-red-500' : ''}
					/>
					{#if errors.description}
						<p class="flex items-center gap-1 text-sm text-red-600">
							<AlertCircle class="h-3 w-3" />
							{errors.description}
						</p>
					{/if}
				</div>

				<!-- Strategy (optional) -->
				<div class="space-y-2">
					<Label for="strategy"
						>Strategy <span class="text-muted-foreground">(optional)</span></Label
					>
					<Textarea
						id="strategy"
						bind:value={formData.strategy}
						placeholder={`Strategic context for this ${info.label.toLowerCase()}`}
						rows={2}
					/>
					<p class="text-xs text-muted-foreground">
						Describe the strategic importance and direction for this {info.label.toLowerCase()}
					</p>
				</div>
			</div>

			<!-- Parent Selection -->
			{#if info.canHaveParent}
				<div class="space-y-4">
					<Separator />
					<div class="space-y-2">
						<Label for="parent">Parent {parentTypeName()} *</Label>

						{#if validParentOptions.length === 0}
							<Alert>
								<AlertCircle class="h-4 w-4" />
								<AlertDescription>
									No valid parent {parentTypeName().toLowerCase()}s available. You need to create a {parentTypeName().toLowerCase()}
									first.
								</AlertDescription>
							</Alert>
						{:else}
							<Select type="single" bind:value={selectParentId}>
								<SelectTrigger id="parent" class={errors.parentId ? 'border-red-500' : ''}>
									{formData.parentId
										? validParentOptions.find((p) => p._id === formData.parentId)?.name ||
											'Select parent'
										: `Select parent ${parentTypeName().toLowerCase()}`}
								</SelectTrigger>
								<SelectContent>
									{#each validParentOptions as parent (parent._id)}
										<SelectItem value={parent._id}>
											<div class="flex items-center gap-2">
												<Badge
													variant="outline"
													class={`text-xs ${typeInfo[parent.type].color} ${typeInfo[parent.type].darkColor}`}
												>
													{typeInfo[parent.type].label}
												</Badge>
												{parent.name}
											</div>
										</SelectItem>
									{/each}
								</SelectContent>
							</Select>
							{#if errors.parentId}
								<p class="flex items-center gap-1 text-sm text-red-600">
									<AlertCircle class="h-3 w-3" />
									{errors.parentId}
								</p>
							{/if}
						{/if}
					</div>
				</div>
			{/if}

			<!-- Form Errors -->
			{#if Object.keys(errors).length > 0}
				<Alert variant="destructive">
					<AlertCircle class="h-4 w-4" />
					<AlertDescription>
						<p class="font-medium">Please fix the following errors before submitting:</p>
						<ul class="mt-2 ml-5 list-disc text-sm">
							{#each Object.entries(errors) as [field, msg] (field)}
								<li>{field || 'form'}: {msg}</li>
							{/each}
						</ul>
					</AlertDescription>
				</Alert>
			{/if}
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={handleCancel} disabled={isSubmitting}>Cancel</Button>
			<Button
				onclick={handleSubmit}
				disabled={isSubmitting || (info.canHaveParent && validParentOptions.length === 0)}
			>
				{isSubmitting ? 'Saving...' : mode === 'create' ? `Create ${info.label}` : 'Update'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<style>
	/* Ensure proper spacing for form elements */
	:global(.space-y-2 > * + *) {
		margin-top: 0.5rem;
	}

	:global(.space-y-4 > * + *) {
		margin-top: 1rem;
	}

	:global(.space-y-6 > * + *) {
		margin-top: 1.5rem;
	}
</style>
