<script lang="ts">
	import { TaxonomyViewModel } from '$lib/modules/spm/ui/taxonomy/TaxonomyViewModel.svelte';
	import TaxonomyView from '$lib/modules/spm/ui/taxonomy/TaxonomyView.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	// Create ViewModel instance
	const viewModel = new TaxonomyViewModel();

	// Mock current user ID (in real app, this would come from auth context)
	const currentUserId = 'user-123'; // TODO: Replace with actual user ID from auth

	// Handle any global errors
	onMount(() => {
		// Set up error handling for uncaught ViewModel errors
		const handleError = (error: ErrorEvent) => {
			console.error('Taxonomy management error:', error);
			toast.error('An unexpected error occurred. Please try refreshing the page.');
		};

		window.addEventListener('error', handleError);

		return () => {
			window.removeEventListener('error', handleError);
		};
	});
</script>

<svelte:head>
	<title>Taxonomy Management - TechMod</title>
	<meta
		name="description"
		content="Manage your organizational taxonomy including portfolios, product lines, and categories."
	/>
</svelte:head>

<!-- Main taxonomy management interface -->
<TaxonomyView {viewModel} {currentUserId} />

<style>
	/* Global styles for the taxonomy page */
	:global(body) {
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	/* Ensure the page takes full height */
	:global(html, body) {
		height: 100%;
	}

	:global(#app) {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
