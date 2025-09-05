<script lang="ts">
	import * as Dialog from '$lib/ui/components/dialog';
	import { Input } from '$lib/ui/components/input';
	import { Button } from '$lib/ui/components/button';
	import { Textarea } from '$lib/ui/components/textarea';
	import { Label } from '$lib/ui/components/label';
	import { Badge } from '$lib/ui/components/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/ui/components/card';
	import { Separator } from '$lib/ui/components/separator';
	import { Sparkles } from 'lucide-svelte';
	import TaxonomySelector from '../taxonomy/TaxonomySelector.svelte';
	import type { ProductViewModel } from './ProductViewModel.svelte';
	import type { ProductProps } from '../../domain/ProductDTO';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../../../convex/_generated/api';
	import type { TaxonomyNode } from '../../domain/TaxonomyNodeDTO';

	interface TaxonomySelectionPath {
		portfolio?: TaxonomyNode;
		line?: TaxonomyNode;
		category?: TaxonomyNode;
	}

	interface CategorySuggestion {
		taxonomyNodeId: string;
		portfolio: string;
		line: string;
		category: string;
		confidence: number;
		reasoning: string;
		path: string;
	}

	let { viewModel }: { viewModel: ProductViewModel } = $props();

	let formData = $state<ProductProps>({
		name: '',
		price: 0,
		description: '',
		taxonomyNodeId: ''
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let selectedTaxonomyPath = $state<TaxonomySelectionPath>({});
	let suggestions = $state<CategorySuggestion[]>([]);
	let isLoadingSuggestions = $state(false);
	let showSuggestions = $state(false);

	// Convex client for actions
	const convexClient = useConvexClient();

	let isSubmitting = $state(false);

	function resetForm() {
		formData = {
			name: '',
			price: 0,
			description: '',
			taxonomyNodeId: ''
		};
		selectedTaxonomyPath = {};
		suggestions = [];
		showSuggestions = false;
	}

	async function handleSubmit() {
		if (!formData.name || !formData.taxonomyNodeId || formData.price < 0) {
			return;
		}

		isSubmitting = true;
		try {
			const cleanFormData = {
				name: formData.name.trim(),
				price: Number(formData.price),
				taxonomyNodeId: formData.taxonomyNodeId,
				description: formData.description?.trim() || undefined
			};

			console.log('Creating product with data:', cleanFormData);
			await viewModel.createProduct(cleanFormData);
			console.log('Product created successfully');
			resetForm();
			viewModel.createDialogOpen = false;
		} catch (error) {
			console.error('Failed to create product:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleTaxonomyChange(taxonomyId: string, path: TaxonomySelectionPath) {
		formData.taxonomyNodeId = taxonomyId;
		selectedTaxonomyPath = path;
		// Clear suggestions when manually selecting
		if (taxonomyId) {
			showSuggestions = false;
		}
	}

	async function handleSuggestCategory() {
		console.log('Suggest button clicked', { formData });

		if (!formData.name) {
			console.log('No product name provided');
			return;
		}

		isLoadingSuggestions = true;
		console.log('Loading suggestions...');

		try {
			const result = await convexClient.action(api.spm.taxonomyNode.action.suggestCategory, {
				productName: formData.name,
				productDescription: formData.description
			});

			console.log('Suggestion result:', result);

			if (result?.suggestions) {
				suggestions = result.suggestions;
				showSuggestions = true;
				console.log('Suggestions set:', suggestions);
			} else {
				console.log('No suggestions in result');
			}
		} catch (error) {
			console.error('Failed to get suggestions:', error);
		} finally {
			isLoadingSuggestions = false;
			console.log('Finished loading suggestions');
		}
	}

	function applySuggestion(suggestion: CategorySuggestion) {
		formData.taxonomyNodeId = suggestion.taxonomyNodeId;
		selectedTaxonomyPath = {
			portfolio: { name: suggestion.portfolio } as TaxonomyNode,
			line: { name: suggestion.line } as TaxonomyNode,
			category: { name: suggestion.category } as TaxonomyNode
		};
		showSuggestions = false;
	}
</script>

<Dialog.Root bind:open={viewModel.createDialogOpen}>
	<Dialog.Content class="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
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
			class="space-y-6 py-4"
		>
			<!-- Basic Product Information -->
			<div class="space-y-4">
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
					<Label for="create-description">Description (Optional)</Label>
					<Textarea
						id="create-description"
						bind:value={formData.description}
						placeholder="Enter product description"
						rows={3}
					/>
				</div>
			</div>

			<Separator />

			<!-- Category Selection -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<Label class="text-base font-semibold">Category Selection</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={handleSuggestCategory}
						disabled={isSubmitting || isLoadingSuggestions || !formData.name}
						class="h-8 px-3"
					>
						<Sparkles class="mr-2 h-4 w-4" />
						{isLoadingSuggestions ? 'Suggesting...' : 'Suggest'}
					</Button>
				</div>

				<TaxonomySelector
					selectedTaxonomyId={formData.taxonomyNodeId}
					onSelectionChange={handleTaxonomyChange}
					disabled={isSubmitting || isLoadingSuggestions}
				/>

				<!-- AI Suggestions -->
				{#if showSuggestions && suggestions.length > 0}
					<Card class="mt-4">
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-sm">
								<span class="text-blue-600">🤖</span>
								AI Category Suggestions
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							{#each suggestions as suggestion (suggestion.taxonomyNodeId)}
								<button
									type="button"
									class="flex w-full cursor-pointer items-start justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
									onclick={() => applySuggestion(suggestion)}
								>
									<div class="flex-1 space-y-1">
										<div class="text-sm font-medium">{suggestion.path}</div>
										<div class="text-xs text-muted-foreground">
											{suggestion.reasoning}
										</div>
									</div>
									<Badge variant="secondary" class="text-xs">
										{Math.round(suggestion.confidence * 100)}%
									</Badge>
								</button>
							{/each}
						</CardContent>
					</Card>
				{:else if showSuggestions && suggestions.length === 0 && !isLoadingSuggestions}
					<div class="py-4 text-center text-sm text-muted-foreground">
						No category suggestions found. Try adding more descriptive information.
					</div>
				{/if}

				{#if isLoadingSuggestions}
					<div class="py-4 text-center text-sm text-muted-foreground">
						Generating suggestions...
					</div>
				{/if}
			</div>
		</form>

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (viewModel.createDialogOpen = false)}>
				Cancel
			</Button>
			<Button
				type="submit"
				form="create-product-form"
				disabled={isSubmitting || !formData.name || !formData.taxonomyNodeId}
			>
				{isSubmitting ? 'Creating...' : 'Create Product'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
