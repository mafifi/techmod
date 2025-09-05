<script lang="ts">
	import * as Select from '$lib/ui/components/select';
	import { Label } from '$lib/ui/components/label';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../../convex/_generated/api';
	import type { TaxonomyNode } from '../../domain/TaxonomyNodeDTO';
	import type { Id } from '../../../../../convex/_generated/dataModel';

	interface TaxonomySelectionPath {
		portfolio?: TaxonomyNode;
		line?: TaxonomyNode;
		category?: TaxonomyNode;
	}

	let {
		selectedTaxonomyId,
		onSelectionChange,
		disabled = false
	}: {
		selectedTaxonomyId: string;
		onSelectionChange: (taxonomyId: string, path: TaxonomySelectionPath) => void;
		disabled?: boolean;
	} = $props();

	// State for cascading selection
	let selectedPortfolioId = $state<string>('');
	let selectedLineId = $state<string>('');
	let selectedCategoryId = $state<string>('');
	let selectionPath = $state<TaxonomySelectionPath>({});

	// Convex queries for hierarchical data
	const portfolios = useQuery(api.spm.taxonomyNode.query.getPortfolios, { activeOnly: true });

	// Reactive queries based on selection state - use computed values
	let lines = $derived(
		selectedPortfolioId
			? useQuery(api.spm.taxonomyNode.query.getLines, {
					portfolioId: selectedPortfolioId as Id<'taxonomyNodes'>,
					activeOnly: true
				})
			: { data: null, isLoading: false, error: null }
	);

	let categories = $derived(
		selectedLineId
			? useQuery(api.spm.taxonomyNode.query.getCategories, {
					lineId: selectedLineId as Id<'taxonomyNodes'>,
					activeOnly: true
				})
			: { data: null, isLoading: false, error: null }
	);

	// Handle portfolio selection
	function handlePortfolioChange(portfolioId: string) {
		selectedPortfolioId = portfolioId;
		selectedLineId = '';
		selectedCategoryId = '';

		if (portfolioId) {
			const portfolio = portfolios.data?.find((p) => p._id === portfolioId) as
				| TaxonomyNode
				| undefined;
			selectionPath = { portfolio };
		} else {
			selectionPath = {};
		}

		// Clear final selection since we're changing the hierarchy
		onSelectionChange('', selectionPath);
	}

	// Handle line selection
	function handleLineChange(lineId: string) {
		selectedLineId = lineId;
		selectedCategoryId = '';

		if (lineId && selectionPath.portfolio) {
			const line = lines.data?.find((l) => l._id === lineId) as TaxonomyNode | undefined;
			selectionPath = { ...selectionPath, line };
		} else {
			selectionPath = { portfolio: selectionPath.portfolio };
		}

		// Clear final selection since we're changing the hierarchy
		onSelectionChange('', selectionPath);
	}

	// Handle category selection (final selection)
	function handleCategoryChange(categoryId: string) {
		selectedCategoryId = categoryId;

		if (categoryId && selectionPath.portfolio && selectionPath.line) {
			const category = categories.data?.find((c) => c._id === categoryId) as
				| TaxonomyNode
				| undefined;
			const completePath = { ...selectionPath, category };
			selectionPath = completePath;
			onSelectionChange(categoryId, completePath);
		} else {
			onSelectionChange('', selectionPath);
		}
	}

	// Initialize selection if taxonomyId is provided
	$effect(() => {
		if (selectedTaxonomyId && selectedTaxonomyId !== selectedCategoryId) {
			// TODO: Implement reverse lookup to populate the cascading selectors
			// This would require a getBreadcrumb query to determine the full path
			selectedCategoryId = selectedTaxonomyId;
		}
	});
</script>

<div class="space-y-4">
	<!-- Portfolio Selection -->
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<Label for="portfolio-select">Portfolio</Label>
		</div>
		<Select.Root
			type="single"
			value={selectedPortfolioId}
			onValueChange={handlePortfolioChange}
			{disabled}
		>
			<Select.Trigger id="portfolio-select" {disabled}>
				<span class="truncate" data-placeholder>
					{#if selectedPortfolioId}
						{portfolios.data?.find((p) => p._id === selectedPortfolioId)?.name ||
							selectedPortfolioId}
					{:else}
						Select a portfolio...
					{/if}
				</span>
			</Select.Trigger>
			<Select.Content>
				{#if portfolios.isLoading}
					<Select.Item value="" disabled>Loading portfolios...</Select.Item>
				{:else if portfolios.data && portfolios.data.length > 0}
					{#each portfolios.data as portfolio (portfolio._id)}
						<Select.Item value={portfolio._id} label={portfolio.name}>
							<div class="flex flex-col">
								<span class="font-medium">{portfolio.name}</span>
								<span class="text-sm text-muted-foreground">{portfolio.description}</span>
							</div>
						</Select.Item>
					{/each}
				{:else if portfolios.error}
					<Select.Item value="" disabled>Error loading portfolios</Select.Item>
				{:else}
					<Select.Item value="" disabled>No portfolios available</Select.Item>
				{/if}
			</Select.Content>
		</Select.Root>

		<!-- Portfolio Description -->
		{#if selectedPortfolioId && selectionPath.portfolio}
			<div class="mt-2 rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">
				<div class="font-medium text-foreground">{selectionPath.portfolio.name}</div>
				<div class="mt-1">{selectionPath.portfolio.description}</div>
			</div>
		{/if}
	</div>

	<!-- Product Line Selection -->
	<div class="space-y-2">
		<Label for="line-select">Product Line</Label>
		<Select.Root
			type="single"
			value={selectedLineId}
			onValueChange={handleLineChange}
			disabled={!selectedPortfolioId || disabled}
		>
			<Select.Trigger id="line-select" disabled={!selectedPortfolioId || disabled}>
				<span class="truncate" data-placeholder>
					{#if selectedLineId}
						{lines.data?.find((l) => l._id === selectedLineId)?.name || selectedLineId}
					{:else}
						Select a product line...
					{/if}
				</span>
			</Select.Trigger>
			<Select.Content>
				{#if lines.data && lines.data.length > 0}
					{#each lines.data as line (line._id)}
						<Select.Item value={line._id} label={line.name}>
							<div class="flex flex-col">
								<span class="font-medium">{line.name}</span>
								<span class="text-sm text-muted-foreground">{line.description}</span>
							</div>
						</Select.Item>
					{/each}
				{:else if selectedPortfolioId}
					<Select.Item value="" disabled>No product lines available</Select.Item>
				{:else}
					<Select.Item value="" disabled>Select a portfolio first</Select.Item>
				{/if}
			</Select.Content>
		</Select.Root>

		<!-- Product Line Description -->
		{#if selectedLineId && selectionPath.line}
			<div class="mt-2 rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">
				<div class="font-medium text-foreground">{selectionPath.line.name}</div>
				<div class="mt-1">{selectionPath.line.description}</div>
			</div>
		{/if}
	</div>

	<!-- Category Selection -->
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<Label for="category-select">Category</Label>
		</div>
		<Select.Root
			type="single"
			value={selectedCategoryId}
			onValueChange={handleCategoryChange}
			disabled={!selectedLineId || disabled}
		>
			<Select.Trigger id="category-select" disabled={!selectedLineId || disabled}>
				<span class="truncate" data-placeholder>
					{#if selectedCategoryId}
						{categories.data?.find((c) => c._id === selectedCategoryId)?.name || selectedCategoryId}
					{:else}
						Select a category...
					{/if}
				</span>
			</Select.Trigger>
			<Select.Content>
				{#if categories.data && categories.data.length > 0}
					{#each categories.data as category (category._id)}
						<Select.Item value={category._id} label={category.name}>
							<div class="flex flex-col">
								<span class="font-medium">{category.name}</span>
								<span class="text-sm text-muted-foreground">{category.description}</span>
							</div>
						</Select.Item>
					{/each}
				{:else if selectedLineId}
					<Select.Item value="" disabled>No categories available</Select.Item>
				{:else}
					<Select.Item value="" disabled>Select a product line first</Select.Item>
				{/if}
			</Select.Content>
		</Select.Root>

		<!-- Category Description -->
		{#if selectedCategoryId && selectionPath.category}
			<div class="mt-2 rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">
				<div class="font-medium text-foreground">{selectionPath.category.name}</div>
				<div class="mt-1">{selectionPath.category.description}</div>
			</div>
		{/if}
	</div>

	<!-- Selection Breadcrumb -->
	{#if selectionPath.portfolio}
		<div class="text-sm text-muted-foreground">
			<span class="font-medium">Path:</span>
			{selectionPath.portfolio.name}
			{#if selectionPath.line}
				→ {selectionPath.line.name}
				{#if selectionPath.category}
					→ {selectionPath.category.name}
				{/if}
			{/if}
		</div>
	{/if}
</div>
