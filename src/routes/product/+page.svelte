<script lang="ts">
	import ProductView from '$lib/modules/spm/ui/product/ProductView.svelte';
	import { ProductViewModel } from '$lib/modules/spm/ui/product/ProductViewModel.svelte';
	let vm = new ProductViewModel();
</script>

<ProductView viewModel={vm} />
