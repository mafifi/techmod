<script lang="ts">
	import EnhancedDataTable from '$lib/ui/blocks/application/tables/enhanced-data-table.svelte';
	import { createColumns } from './columns';
	import type { ProductViewModel } from './ProductViewModel.svelte';
	import { Button } from '$lib/ui/components/button';
	import { PlusCircle } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import ProductCreateDialog from './ProductCreateDialog.svelte';
	import ProductEditDialog from './ProductEditDialog.svelte';
	import ProductDeleteDialog from './ProductDeleteDialog.svelte';

	interface Props {
		viewModel: ProductViewModel;
	}

	let { viewModel }: Props = $props();

	// Action handlers for the dropdown
	function handleShow(productId: string) {
		goto(`/products/${productId}`);
	}

	function handleEdit(productId: string) {
		const product = viewModel.data?.find((p) => p._id === productId);
		if (product) {
			viewModel.openEditDialog(product);
		}
	}

	function handleDelete(productId: string) {
		const product = viewModel.data?.find((p) => p._id === productId);
		if (product) {
			viewModel.openDeleteDialog(product);
		}
	}

	// Create columns with action handlers
	const columns = createColumns({ handleShow, handleEdit, handleDelete });
</script>

<div class="space-y-4">
	<!-- Header Section -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold">Products</h1>
			<p class="text-muted-foreground">Manage your product catalog</p>
		</div>
		<Button onclick={() => viewModel.openCreateDialog()}>
			<PlusCircle class="mr-2 h-4 w-4" />
			Add Product
		</Button>
	</div>

	<!-- Data Table -->
	{#if viewModel.isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
		</div>
	{:else if viewModel.error}
		<div class="flex items-center justify-center py-12">
			<p class="text-destructive">Error: {viewModel.error.message}</p>
		</div>
	{:else}
		<EnhancedDataTable
			{columns}
			data={viewModel.data}
			searchPlaceholder="Search products..."
			enableGlobalFilter={true}
			enableColumnFilters={false}
			enableSorting={true}
			enableRowSelection={false}
			enableColumnVisibility={true}
			enablePagination={true}
			initialColumnVisibility={{
				name: true,
				category: true,
				price: true,
				description: false,
				_creationTime: false
			}}
		/>
	{/if}

	<!-- Summary Information -->
	{#if !viewModel.isLoading && !viewModel.error && viewModel.data.length > 0}
		<div class="rounded-lg border bg-muted/50 p-4">
			<div class="flex items-center justify-between text-sm">
				<span><strong>Total Products:</strong> {viewModel.data.length}</span>
				<span><strong>Total Value:</strong> ${viewModel.getTotalValue().toFixed(2)}</span>
			</div>
		</div>
	{/if}

	<!-- Dialogs -->
	<ProductCreateDialog {viewModel} />
	<ProductEditDialog {viewModel} />
	<ProductDeleteDialog {viewModel} />
</div>
