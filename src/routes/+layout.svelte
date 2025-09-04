<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { env } from '$env/dynamic/public';
	import { setupConvex } from 'convex-svelte';
	import { Toaster } from '$lib/ui/components/sonner';
	import { TooltipProvider } from '$lib/ui/components/tooltip';
	import { Button } from '$lib/ui/components/button';
	import { Input } from '$lib/ui/components/input';
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetHeader,
		SheetTitle,
		SheetTrigger
	} from '$lib/ui/components/sheet';
	import { page } from '$app/stores';
	import {
		Database,
		Search,
		Sun,
		Home,
		Package,
		Layers3 as Layers,
		BarChart3,
		FileText,
		Menu
	} from '@lucide/svelte';

	let { children } = $props();
	setupConvex(env.PUBLIC_CONVEX_URL || '');

	// Helper function to check if current route matches
	function isActiveRoute(route: string): boolean {
		if (route === '/' && $page.url.pathname === '/') return true;
		if (route !== '/' && $page.url.pathname.startsWith(route)) return true;
		return false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<TooltipProvider delayDuration={0}>
	<!-- Top-Level Banner Header -->
	<header class="border-b bg-background">
		<div class="container flex h-16 items-center justify-between px-4">
			<!-- Logo and brand -->
			<div class="flex items-center space-x-2">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-midnight-blue-600 to-purple-heart-600"
				>
					<Database class="h-5 w-5 text-white" />
				</div>
				<div>
					<h1 class="text-xl font-bold">TechMod</h1>
					<p class="text-xs text-muted-foreground">Strategic Product Management</p>
				</div>
			</div>

			<!-- Right side actions -->
			<div class="flex items-center space-x-3">
				<!-- Search -->
				<div class="relative hidden md:block">
					<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input placeholder="Search catalogue..." class="w-64 pl-9" />
				</div>

				<!-- Theme toggle -->
				<Button variant="ghost" size="icon">
					<Sun class="h-4 w-4" />
				</Button>

				<!-- Get Started button - no sign in required -->
				<Button size="sm">Get Started</Button>
			</div>
		</div>
	</header>

	<!-- Mobile navigation (hidden on desktop) -->
	<nav class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur lg:hidden">
		<div class="container px-4">
			<div class="flex h-12 items-center justify-between">
				<h2 class="text-sm font-medium">Navigation</h2>
				<!-- Mobile menu trigger -->
				<Sheet>
					<SheetTrigger>
						<Button variant="ghost" size="icon">
							<Menu class="h-5 w-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="right">
						<SheetHeader>
							<SheetTitle>TechMod</SheetTitle>
							<SheetDescription>Strategic Product Management</SheetDescription>
						</SheetHeader>
						<div class="mt-8 space-y-4">
							<a
								href="/"
								class="flex items-center space-x-3 rounded-lg p-3 {isActiveRoute('/')
									? 'bg-midnight-blue-50 font-medium text-midnight-blue-700 dark:bg-midnight-blue-900/50 dark:text-midnight-blue-300'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
							>
								<Home class="h-5 w-5" />
								<span>Overview</span>
							</a>
							<a
								href="/product"
								class="flex items-center space-x-3 rounded-lg p-3 {isActiveRoute('/product')
									? 'bg-midnight-blue-50 font-medium text-midnight-blue-700 dark:bg-midnight-blue-900/50 dark:text-midnight-blue-300'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
							>
								<Package class="h-5 w-5" />
								<span>Product Catalogue</span>
							</a>
							<a
								href="/taxonomy"
								class="flex items-center space-x-3 rounded-lg p-3 {isActiveRoute('/taxonomy')
									? 'bg-midnight-blue-50 font-medium text-midnight-blue-700 dark:bg-midnight-blue-900/50 dark:text-midnight-blue-300'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
							>
								<Layers class="h-5 w-5" />
								<span>Taxonomy</span>
							</a>
							<a
								href="/analytics"
								class="flex items-center space-x-3 rounded-lg p-3 {isActiveRoute('/analytics')
									? 'bg-midnight-blue-50 font-medium text-midnight-blue-700 dark:bg-midnight-blue-900/50 dark:text-midnight-blue-300'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
							>
								<BarChart3 class="h-5 w-5" />
								<span>Analytics</span>
							</a>
							<a
								href="/reports"
								class="flex items-center space-x-3 rounded-lg p-3 {isActiveRoute('/reports')
									? 'bg-midnight-blue-50 font-medium text-midnight-blue-700 dark:bg-midnight-blue-900/50 dark:text-midnight-blue-300'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
							>
								<FileText class="h-5 w-5" />
								<span>Reports</span>
							</a>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	</nav>

	<!-- Desktop navigation tabs (hidden on mobile) -->
	<nav
		class="sticky top-0 z-40 hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:block"
	>
		<div class="container px-4">
			<div class="flex h-12 items-center space-x-8">
				<!-- Main navigation tabs -->
				<a
					href="/"
					class="flex items-center space-x-2 border-b-2 pb-3 text-sm font-medium {isActiveRoute('/')
						? 'border-midnight-blue-600 text-midnight-blue-600'
						: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
				>
					<Home class="h-4 w-4" />
					<span>Overview</span>
				</a>

				<a
					href="/product"
					class="flex items-center space-x-2 border-b-2 pb-3 text-sm font-medium {isActiveRoute(
						'/product'
					)
						? 'border-midnight-blue-600 text-midnight-blue-600'
						: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
				>
					<Package class="h-4 w-4" />
					<span>Product Catalogue</span>
				</a>

				<a
					href="/taxonomy"
					class="flex items-center space-x-2 border-b-2 pb-3 text-sm font-medium {isActiveRoute(
						'/taxonomy'
					)
						? 'border-midnight-blue-600 text-midnight-blue-600'
						: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
				>
					<Layers class="h-4 w-4" />
					<span>Taxonomy</span>
				</a>

				<a
					href="/analytics"
					class="flex items-center space-x-2 border-b-2 pb-3 text-sm font-medium {isActiveRoute(
						'/analytics'
					)
						? 'border-midnight-blue-600 text-midnight-blue-600'
						: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
				>
					<BarChart3 class="h-4 w-4" />
					<span>Analytics</span>
				</a>

				<a
					href="/reports"
					class="flex items-center space-x-2 border-b-2 pb-3 text-sm font-medium {isActiveRoute(
						'/reports'
					)
						? 'border-midnight-blue-600 text-midnight-blue-600'
						: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
				>
					<FileText class="h-4 w-4" />
					<span>Reports</span>
				</a>
			</div>
		</div>
	</nav>

	<!-- Page content -->
	<main>
		{@render children()}
	</main>

	<Toaster />
</TooltipProvider>
