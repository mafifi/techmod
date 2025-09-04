<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { env } from '$env/dynamic/public';
	import { setupConvex } from 'convex-svelte';
	import { Toaster } from '$lib/ui/components/sonner';
	import { TooltipProvider } from '$lib/ui/components/tooltip';

	setupConvex(env.PUBLIC_CONVEX_URL || '');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<TooltipProvider delayDuration={0}>
	<slot />
	<Toaster />
</TooltipProvider>
