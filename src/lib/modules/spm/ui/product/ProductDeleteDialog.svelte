<script lang="ts">
	import * as AlertDialog from '$lib/ui/components/alert-dialog';
	import type { ProductViewModel } from './ProductViewModel.svelte';

	let { viewModel }: { viewModel: ProductViewModel } = $props();

	let isDeleting = $state(false);

	async function handleDelete() {
		if (!viewModel.selectedProduct) {
			return;
		}

		isDeleting = true;
		try {
			await viewModel.deleteProduct(viewModel.selectedProduct._id);
			viewModel.deleteDialogOpen = false;
		} catch (error) {
			console.error('Failed to delete product:', error);
		} finally {
			isDeleting = false;
		}
	}
</script>

<AlertDialog.Root bind:open={viewModel.deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Product</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete "{viewModel.selectedProduct?.name}"? This action cannot be
				undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isDeleting}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDelete} disabled={isDeleting}>
				{isDeleting ? 'Deleting...' : 'Delete'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
