<script lang="ts">
	import { Button } from '$lib/ui/components/button';
	import { Card, CardContent } from '$lib/ui/components/card';
	import {
		Search,
		Layers3 as Layers,
		Eye,
		TrendingUp,
		Shield,
		Target,
		DollarSign,
		Compass
	} from '@lucide/svelte';
</script>

<svelte:head>
	<title>TechMod - Strategic Product Management</title>
	<meta
		name="description"
		content="Strategic Product Management platform for centrally tracking and managing modernization strategy across firms."
	/>
</svelte:head>

<!-- Introduction Section - Catalogue Decision Making -->
<section
	class="bg-gradient-to-r from-midnight-blue-50 via-background to-mariner-50 py-16 dark:from-midnight-blue-950 dark:via-background dark:to-mariner-950"
>
	<div class="container px-4">
		<div class="mx-auto max-w-4xl text-center">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
				Make Informed Technology Decisions
			</h2>
			<p class="mt-6 text-xl text-muted-foreground">
				Our comprehensive technology catalogue provides the insights and data you need to navigate
				your modernization journey with confidence.
			</p>
		</div>

		<!-- Decision-making benefits grid -->
		<div class="mx-auto mt-16 max-w-6xl">
			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				<!-- Complete Visibility -->
				<div class="text-center">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-midnight-blue-100 dark:bg-midnight-blue-900"
					>
						<Eye class="h-6 w-6 text-midnight-blue-600" />
					</div>
					<h3 class="mt-4 text-lg font-semibold">Complete Visibility</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						See your entire technology landscape in one place. Understand dependencies,
						relationships, and the complete picture before making changes.
					</p>
				</div>

				<!-- Data-Driven Insights -->
				<div class="text-center">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-mariner-100 dark:bg-mariner-900"
					>
						<TrendingUp class="h-6 w-6 text-mariner-600" />
					</div>
					<h3 class="mt-4 text-lg font-semibold">Data-Driven Insights</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Access usage metrics, performance data, and business impact scores to understand what's
						working and what needs attention.
					</p>
				</div>

				<!-- Risk Assessment -->
				<div class="text-center">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-heart-100 dark:bg-purple-heart-900"
					>
						<Shield class="h-6 w-6 text-purple-heart-600" />
					</div>
					<h3 class="mt-4 text-lg font-semibold">Risk Assessment</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Evaluate security, compliance, and technical risks before implementing changes. Make
						decisions with full awareness of potential impacts.
					</p>
				</div>

				<!-- Strategic Alignment -->
				<div class="text-center">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-watercourse-100 dark:bg-watercourse-900"
					>
						<Target class="h-6 w-6 text-watercourse-600" />
					</div>
					<h3 class="mt-4 text-lg font-semibold">Strategic Alignment</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Ensure your technology choices align with business objectives and long-term strategic
						goals through comprehensive categorization.
					</p>
				</div>

				<!-- Cost Optimization -->
				<div class="text-center">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-golf-100 dark:bg-golf-900"
					>
						<DollarSign class="h-6 w-6 text-golf-600" />
					</div>
					<h3 class="mt-4 text-lg font-semibold">Cost Optimization</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Understand the total cost of ownership and identify opportunities for consolidation,
						optimization, and strategic investment.
					</p>
				</div>

				<!-- Future Planning -->
				<div class="text-center">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-silver-100 dark:bg-silver-900"
					>
						<Compass class="h-6 w-6 text-silver-600" />
					</div>
					<h3 class="mt-4 text-lg font-semibold">Future Planning</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Plan modernization pathways with clear roadmaps, lifecycle management, and succession
						planning for aging technologies.
					</p>
				</div>
			</div>
		</div>

		<!-- Call-to-action for exploring the catalogue -->
		<div class="mx-auto mt-16 max-w-2xl text-center">
			<Card class="p-8 shadow-sm">
				<CardContent class="p-0">
					<h3 class="text-xl font-semibold">Ready to Explore Your Technology Landscape?</h3>
					<p class="mt-3 text-muted-foreground">
						Browse our comprehensive product catalogue to discover technologies, understand
						capabilities, and make informed modernization decisions.
					</p>
					<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button size="lg" href="/product">
							<Search class="mr-2 h-5 w-5" />
							Browse Catalogue
						</Button>
						<Button variant="outline" size="lg" href="/taxonomy">
							<Layers class="mr-2 h-5 w-5" />
							Explore Taxonomy
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</section>
