# TechMod Homepage Design

## Overview

This document outlines the comprehensive design for TechMod's homepage - a Strategic Product Management (SPM) platform focused on centrally tracking and managing modernization strategy across firms.

## Design Philosophy

- **Enterprise-focused**: Professional, clean interface targeting IT leaders and architects
- **Data-driven**: Emphasize metrics, insights, and strategic value
- **Modern & Accessible**: Responsive design with dark/light mode support
- **Component-driven**: Leverage existing shadcn-style UI components
- **Strategic positioning**: Position as essential modernization governance platform

## Application Structure

### Global Layout (`+layout.svelte`)

The banner and navigation are now implemented in the global layout file to ensure they persist across all routes.

#### 1. Top-Level Banner Header

```svelte
<!-- Top banner with branding and user actions -->
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
```

#### 2. Navigation Tabs with Active State Management

```svelte
<!-- Helper function for active route detection -->
<script>
	function isActiveRoute(route: string): boolean {
		if (route === '/' && $page.url.pathname === '/') return true;
		if (route !== '/' && $page.url.pathname.startsWith(route)) return true;
		return false;
	}
</script>

<!-- Sticky navigation tabs -->
<nav
	class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container px-4">
		<div class="flex h-12 items-center space-x-8">
			<!-- Main navigation tabs with dynamic active states -->
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
```

**Design Specifications:**

- **Banner Height**: 64px (h-16) - provides more space for branding
- **Tab Height**: 48px (h-12) - compact but touchable
- **Active State**: Dynamic bottom border with primary color based on current route
- **Icons**: Lucide icons for visual hierarchy
- **Persistence**: Banner and tabs visible across all application routes
- **Active Detection**: Uses SvelteKit's `$page` store for accurate route matching

### Mobile Navigation Pattern

```svelte
<!-- Mobile navigation (hidden on desktop) -->
<nav class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur lg:hidden">
	<div class="container px-4">
		<div class="flex h-12 items-center justify-between">
			<h2 class="text-sm font-medium">Navigation</h2>
			<!-- Mobile menu trigger -->
			<Sheet>
				<SheetTrigger asChild>
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
							class="flex items-center space-x-3 rounded-lg bg-midnight-blue-50 p-3 text-midnight-blue-700 dark:bg-midnight-blue-900/50 dark:text-midnight-blue-300"
						>
							<Home class="h-5 w-5" />
							<span class="font-medium">Overview</span>
						</a>
						<a
							href="/product"
							class="flex items-center space-x-3 rounded-lg p-3 text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							<Package class="h-5 w-5" />
							<span>Product Catalogue</span>
						</a>
						<a
							href="/taxonomy"
							class="flex items-center space-x-3 rounded-lg p-3 text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							<Layers class="h-5 w-5" />
							<span>Taxonomy</span>
						</a>
						<a
							href="/analytics"
							class="flex items-center space-x-3 rounded-lg p-3 text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							<BarChart3 class="h-5 w-5" />
							<span>Analytics</span>
						</a>
						<a
							href="/reports"
							class="flex items-center space-x-3 rounded-lg p-3 text-muted-foreground hover:bg-muted hover:text-foreground"
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
	<!-- Original desktop navigation code here -->
</nav>
```

**Mobile Specifications:**

- **Sheet Navigation**: Slides in from right on mobile
- **Touch-Friendly**: Larger touch targets (p-3 padding)
- **Active States**: Background highlighting for current page
- **Progressive Enhancement**: Falls back gracefully without JavaScript

### 3. Introduction Section - Catalogue Decision Making

```svelte
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
				<!-- Comprehensive Visibility -->
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
						class="bg-gold-100 dark:bg-gold-900 mx-auto flex h-12 w-12 items-center justify-center rounded-lg"
					>
						<DollarSign class="text-gold-600 h-6 w-6" />
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
			<div class="rounded-lg bg-card p-8 shadow-sm">
				<h3 class="text-xl font-semibold">Ready to Explore Your Technology Landscape?</h3>
				<p class="mt-3 text-muted-foreground">
					Browse our comprehensive product catalogue to discover technologies, understand
					capabilities, and make informed modernization decisions.
				</p>
				<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button size="lg" asChild>
						<a href="/product">
							<Search class="mr-2 h-5 w-5" />
							Browse Catalogue
						</a>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<a href="/taxonomy">
							<Layers class="mr-2 h-5 w-5" />
							Explore Taxonomy
						</a>
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>
```

**Design Specifications:**

- **Background**: Subtle gradient using brand colors
- **Grid Layout**: 3-column grid on large screens, responsive stacking
- **Icons**: Meaningful icons representing each decision-making benefit
- **CTA Section**: Prominent call-to-action driving users to main features
- **Content Focus**: Emphasizes practical benefits of browsing and using the catalogue

### 4. Hero Section

```svelte
<section
	class="relative overflow-hidden bg-gradient-to-br from-midnight-blue-50 via-background to-purple-heart-50 dark:from-midnight-blue-950 dark:via-background dark:to-purple-heart-950"
>
	<div class="relative z-10 container px-4 py-20 lg:py-28">
		<div class="mx-auto max-w-4xl text-center">
			<!-- Main headline -->
			<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
				Modernize with
				<span
					class="bg-gradient-to-r from-midnight-blue-600 to-purple-heart-600 bg-clip-text text-transparent"
				>
					Strategic Precision
				</span>
			</h1>

			<!-- Supporting text -->
			<p class="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
				TechMod helps organizations centrally track and manage modernization strategy across their
				entire technology portfolio. Model products, govern lifecycle, and drive strategic
				transformation.
			</p>

			<!-- CTA buttons -->
			<div class="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
				<Button size="lg" class="px-8">
					<Play class="mr-2 h-5 w-5" />
					Start Your Journey
				</Button>
				<Button variant="outline" size="lg" class="px-8">
					<BookOpen class="mr-2 h-5 w-5" />
					View Demo
				</Button>
			</div>

			<!-- Trust indicators -->
			<div class="mt-16">
				<p class="text-sm text-muted-foreground">Trusted by leading organizations</p>
				<div class="mt-6 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
					<!-- Company logos would go here -->
				</div>
			</div>
		</div>
	</div>

	<!-- Background decorative elements -->
	<div class="absolute inset-0 -z-10 opacity-20">
		<!-- Abstract geometric shapes using existing color palette -->
	</div>
</section>
```

**Design Specifications:**

- Gradient background using custom color palette
- Typography: Hero uses font sizes 4xl to 6xl
- Spacing: py-20 to py-28 for generous vertical padding
- CTA buttons: Primary and outline variants, large size
- Responsive: Stacked layout on mobile, side-by-side on desktop

### 5. Value Proposition Section

```svelte
<section class="bg-muted/30 py-20">
	<div class="container px-4">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
				Complete Modernization Governance
			</h2>
			<p class="mt-4 text-lg text-muted-foreground">
				From strategic planning to execution tracking, TechMod provides the comprehensive platform
				your organization needs to drive successful modernization initiatives.
			</p>
		</div>

		<div class="mx-auto mt-16 max-w-7xl">
			<div class="grid gap-8 lg:grid-cols-3">
				<!-- Strategic Planning -->
				<Card>
					<CardHeader>
						<div class="flex items-center space-x-2">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-lg bg-midnight-blue-100 dark:bg-midnight-blue-900"
							>
								<Target class="h-6 w-6 text-midnight-blue-600" />
							</div>
							<CardTitle>Strategic Planning</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<ul class="space-y-2 text-sm text-muted-foreground">
							<li>• Portfolio modeling and categorization</li>
							<li>• TBM-aligned cost categorization</li>
							<li>• Modernization pathway planning</li>
							<li>• Business case governance</li>
						</ul>
					</CardContent>
				</Card>

				<!-- Lifecycle Management -->
				<Card>
					<CardHeader>
						<div class="flex items-center space-x-2">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-heart-100 dark:bg-purple-heart-900"
							>
								<RotateCw class="h-6 w-6 text-purple-heart-600" />
							</div>
							<CardTitle>Lifecycle Management</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<ul class="space-y-2 text-sm text-muted-foreground">
							<li>• Product lifecycle governance</li>
							<li>• Usage tracking and analytics</li>
							<li>• Application scoring frameworks</li>
							<li>• Automated compliance monitoring</li>
						</ul>
					</CardContent>
				</Card>

				<!-- Transformation Tracking -->
				<Card>
					<CardHeader>
						<div class="flex items-center space-x-2">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-lg bg-mariner-100 dark:bg-mariner-900"
							>
								<TrendingUp class="h-6 w-6 text-mariner-600" />
							</div>
							<CardTitle>Transformation Tracking</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<ul class="space-y-2 text-sm text-muted-foreground">
							<li>• Real-time progress monitoring</li>
							<li>• ROI and value measurement</li>
							<li>• Risk assessment and mitigation</li>
							<li>• Stakeholder reporting dashboard</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</section>
```

**Design Specifications:**

- Background: Subtle muted background (`bg-muted/30`)
- Cards: Use existing Card components with custom icon backgrounds
- Grid: 3-column layout on large screens, stacked on mobile
- Icons: Lucide icons with custom color backgrounds using palette
- Typography: Clear hierarchy with bold headings and muted descriptions

### 6. Features Showcase

```svelte
<section class="py-20">
	<div class="container px-4">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Built for Modern Organizations</h2>
			<p class="mt-4 text-lg text-muted-foreground">
				TechMod integrates seamlessly with your existing processes while providing the strategic
				oversight needed for successful modernization.
			</p>
		</div>

		<!-- Feature grid with alternating layout -->
		<div class="mx-auto mt-20 max-w-7xl">
			<!-- Feature 1: Product Catalog -->
			<div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
				<div class="flex flex-col justify-center">
					<h3 class="text-2xl font-bold">Comprehensive Product Catalog</h3>
					<p class="mt-4 text-muted-foreground">
						Centrally manage your entire technology portfolio with rich metadata, relationships, and
						categorization aligned with industry standards.
					</p>
					<div class="mt-6 space-y-2">
						<div class="flex items-center space-x-2">
							<Check class="h-5 w-5 text-watercourse-600" />
							<span class="text-sm">TBM-compliant categorization</span>
						</div>
						<div class="flex items-center space-x-2">
							<Check class="h-5 w-5 text-watercourse-600" />
							<span class="text-sm">Dependency mapping</span>
						</div>
						<div class="flex items-center space-x-2">
							<Check class="h-5 w-5 text-watercourse-600" />
							<span class="text-sm">Business capability alignment</span>
						</div>
					</div>
					<div class="mt-8">
						<Button variant="outline">
							Explore Product Management
							<ArrowRight class="ml-2 h-4 w-4" />
						</Button>
					</div>
				</div>

				<div class="relative">
					<!-- Screenshot or mockup placeholder -->
					<div
						class="aspect-video rounded-lg bg-gradient-to-br from-midnight-blue-100 to-purple-heart-100 p-8 dark:from-midnight-blue-900 dark:to-purple-heart-900"
					>
						<!-- Mock interface showing product catalog -->
						<div class="h-full w-full rounded bg-background/80 p-4">
							<div class="space-y-3">
								<div class="h-4 w-3/4 rounded bg-muted-foreground/20"></div>
								<div class="h-4 w-1/2 rounded bg-muted-foreground/20"></div>
								<div class="h-4 w-5/6 rounded bg-muted-foreground/20"></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Feature 2: Analytics Dashboard (reversed layout) -->
			<div class="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
				<div class="relative lg:order-first">
					<!-- Screenshot or mockup placeholder -->
					<div
						class="aspect-video rounded-lg bg-gradient-to-br from-mariner-100 to-watercourse-100 p-8 dark:from-mariner-900 dark:to-watercourse-900"
					>
						<!-- Mock interface showing analytics -->
						<div class="h-full w-full rounded bg-background/80 p-4">
							<div class="grid h-full grid-cols-2 gap-4">
								<div class="space-y-2">
									<div class="h-3 w-full rounded bg-muted-foreground/20"></div>
									<div class="h-8 w-3/4 rounded bg-muted-foreground/20"></div>
								</div>
								<div class="space-y-2">
									<div class="h-3 w-full rounded bg-muted-foreground/20"></div>
									<div class="h-8 w-2/3 rounded bg-muted-foreground/20"></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex flex-col justify-center lg:order-last">
					<h3 class="text-2xl font-bold">Strategic Analytics & Reporting</h3>
					<p class="mt-4 text-muted-foreground">
						Gain actionable insights with comprehensive dashboards, automated reports, and real-time
						monitoring of your modernization initiatives.
					</p>
					<div class="mt-6 space-y-2">
						<div class="flex items-center space-x-2">
							<Check class="h-5 w-5 text-watercourse-600" />
							<span class="text-sm">Executive dashboards</span>
						</div>
						<div class="flex items-center space-x-2">
							<Check class="h-5 w-5 text-watercourse-600" />
							<span class="text-sm">Automated compliance reports</span>
						</div>
						<div class="flex items-center space-x-2">
							<Check class="h-5 w-5 text-watercourse-600" />
							<span class="text-sm">ROI tracking and forecasting</span>
						</div>
					</div>
					<div class="mt-8">
						<Button variant="outline">
							View Analytics Demo
							<ArrowRight class="ml-2 h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
```

### 7. Social Proof / Case Study Section

```svelte
<section class="bg-muted/30 py-20">
	<div class="container px-4">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
				Proven Results Across Industries
			</h2>
			<p class="mt-4 text-lg text-muted-foreground">
				Organizations using TechMod achieve measurable improvements in modernization efficiency and
				strategic alignment.
			</p>
		</div>

		<!-- Stats grid -->
		<div class="mx-auto mt-16 max-w-5xl">
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
				<div class="text-center">
					<div class="text-4xl font-bold text-midnight-blue-600">40%</div>
					<div class="mt-2 text-sm text-muted-foreground">Faster decision making</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-bold text-purple-heart-600">60%</div>
					<div class="mt-2 text-sm text-muted-foreground">Improved visibility</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-bold text-mariner-600">25%</div>
					<div class="mt-2 text-sm text-muted-foreground">Reduced modernization costs</div>
				</div>
				<div class="text-center">
					<div class="text-4xl font-bold text-watercourse-600">90%</div>
					<div class="mt-2 text-sm text-muted-foreground">Stakeholder satisfaction</div>
				</div>
			</div>
		</div>

		<!-- Testimonial -->
		<div class="mx-auto mt-16 max-w-4xl">
			<Card>
				<CardContent class="p-8">
					<blockquote class="text-center text-xl font-medium">
						"TechMod transformed how we approach modernization strategy. We now have complete
						visibility into our portfolio and can make data-driven decisions with confidence."
					</blockquote>
					<div class="mt-6 flex items-center justify-center space-x-4">
						<Avatar>
							<AvatarFallback>JD</AvatarFallback>
						</Avatar>
						<div class="text-center">
							<div class="font-semibold">Jane Doe</div>
							<div class="text-sm text-muted-foreground">CTO, Fortune 500 Company</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</section>
```

### 8. Call-to-Action Section

```svelte
<section class="bg-gradient-to-r from-midnight-blue-600 via-purple-heart-600 to-mariner-600 py-20">
	<div class="container px-4">
		<div class="mx-auto max-w-4xl text-center">
			<h2 class="text-3xl font-bold text-white sm:text-4xl">
				Ready to Transform Your Modernization Strategy?
			</h2>
			<p class="mt-4 text-xl text-white/90">
				Join leading organizations already using TechMod to drive successful modernization
				initiatives.
			</p>

			<div class="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
				<Button size="lg" variant="secondary" class="px-8">
					<Zap class="mr-2 h-5 w-5" />
					Start Free Trial
				</Button>
				<Button
					size="lg"
					variant="outline"
					class="border-white/20 px-8 text-white hover:bg-white/10"
				>
					<Calendar class="mr-2 h-5 w-5" />
					Schedule Demo
				</Button>
			</div>

			<p class="mt-8 text-sm text-white/70">
				No credit card required • 30-day free trial • Full feature access
			</p>
		</div>
	</div>
</section>
```

### 9. Footer

```svelte
<footer class="border-t bg-background">
	<div class="container px-4 py-12">
		<div class="grid gap-8 lg:grid-cols-4">
			<!-- Brand column -->
			<div>
				<div class="flex items-center space-x-2">
					<span class="text-xl font-bold">TechMod</span>
				</div>
				<p class="mt-4 text-sm text-muted-foreground">
					Strategic Product Management platform for modern organizations.
				</p>
				<div class="mt-6 flex space-x-4">
					<!-- Social media links -->
					<a href="#" class="text-muted-foreground hover:text-foreground">
						<Github class="h-5 w-5" />
					</a>
					<a href="#" class="text-muted-foreground hover:text-foreground">
						<Linkedin class="h-5 w-5" />
					</a>
				</div>
			</div>

			<!-- Product links -->
			<div>
				<h3 class="font-semibold">Product</h3>
				<ul class="mt-4 space-y-2 text-sm">
					<li>
						<a href="/features" class="text-muted-foreground hover:text-foreground">Features</a>
					</li>
					<li>
						<a href="/pricing" class="text-muted-foreground hover:text-foreground">Pricing</a>
					</li>
					<li>
						<a href="/security" class="text-muted-foreground hover:text-foreground">Security</a>
					</li>
					<li>
						<a href="/integrations" class="text-muted-foreground hover:text-foreground"
							>Integrations</a
						>
					</li>
				</ul>
			</div>

			<!-- Resources -->
			<div>
				<h3 class="font-semibold">Resources</h3>
				<ul class="mt-4 space-y-2 text-sm">
					<li>
						<a href="/docs" class="text-muted-foreground hover:text-foreground">Documentation</a>
					</li>
					<li><a href="/blog" class="text-muted-foreground hover:text-foreground">Blog</a></li>
					<li>
						<a href="/case-studies" class="text-muted-foreground hover:text-foreground"
							>Case Studies</a
						>
					</li>
					<li>
						<a href="/support" class="text-muted-foreground hover:text-foreground">Support</a>
					</li>
				</ul>
			</div>

			<!-- Company -->
			<div>
				<h3 class="font-semibold">Company</h3>
				<ul class="mt-4 space-y-2 text-sm">
					<li><a href="/about" class="text-muted-foreground hover:text-foreground">About</a></li>
					<li>
						<a href="/careers" class="text-muted-foreground hover:text-foreground">Careers</a>
					</li>
					<li>
						<a href="/privacy" class="text-muted-foreground hover:text-foreground">Privacy</a>
					</li>
					<li><a href="/terms" class="text-muted-foreground hover:text-foreground">Terms</a></li>
				</ul>
			</div>
		</div>

		<Separator class="my-8" />

		<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
			<p class="text-sm text-muted-foreground">© 2024 TechMod. All rights reserved.</p>
			<div class="flex items-center space-x-4 text-sm text-muted-foreground">
				<a href="/privacy" class="hover:text-foreground">Privacy Policy</a>
				<a href="/terms" class="hover:text-foreground">Terms of Service</a>
			</div>
		</div>
	</div>
</footer>
```

## Design System Integration

### Colors Used

The design leverages TechMod's custom color palette:

- **midnight-blue**: Primary brand color for trust and professionalism
- **purple-heart**: Secondary accent for innovation and strategy
- **mariner**: Sky blue for analytics and data visualization
- **watercourse**: Green for success states and growth
- **silver**: Neutral grays for backgrounds and text

### Typography Scale

- **Headlines**: text-4xl to text-6xl (32px to 64px)
- **Subheadings**: text-2xl to text-3xl (24px to 32px)
- **Body text**: text-base to text-lg (16px to 18px)
- **Small text**: text-sm (14px)

### Spacing System

- **Section padding**: py-20 (80px vertical)
- **Container max-width**: max-w-7xl for content sections
- **Grid gaps**: gap-8 to gap-16 (32px to 64px)

### Component Usage

- **Buttons**: Use existing Button component with size and variant props
- **Cards**: Leverage Card, CardHeader, CardContent components
- **Icons**: Lucide icons for consistency with existing codebase
- **Layout**: CSS Grid and Flexbox for responsive layouts

## Responsive Breakpoints

- **Mobile**: Default styling (< 640px)
- **Tablet**: sm: prefix (≥ 640px)
- **Desktop**: lg: prefix (≥ 1024px)
- **Wide**: xl: prefix (≥ 1280px)

## Implementation Notes

### Required Dependencies

All dependencies are already available in the project:

- Lucide Svelte icons
- TailwindCSS with custom configuration
- Existing UI component library
- SvelteKit routing

### Performance Considerations

- Images should be optimized and lazy-loaded
- Use appropriate image formats (WebP with fallbacks)
- Implement proper SEO meta tags
- Consider implementing skeleton loading states

### Accessibility Features

- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for all images
- Adequate color contrast ratios
- Keyboard navigation support
- Screen reader compatibility

### Content Strategy

- Focus on business value and strategic outcomes
- Use industry-specific terminology (TBM, SPM, modernization)
- Include quantifiable benefits and metrics
- Address pain points of target audience (IT leaders, architects)
- Clear call-to-action hierarchy

## Key Design Improvements

### Enhanced Navigation Experience

- **Persistent Global Navigation**: Banner and tabs implemented in layout, visible across all application routes
- **Two-Level Navigation**: Top banner for branding and user actions, dedicated tab navigation for main routes
- **Dynamic Active States**: Route-aware highlighting using SvelteKit's `$page` store for accurate current page indication
- **Clear Visual Hierarchy**: Distinct branding area with search functionality and single CTA
- **Mobile-Optimized**: Sheet-based navigation for mobile with touch-friendly interfaces
- **Simplified Authentication**: Single "Get Started" button - SSO implementation planned for later

### Catalogue-Focused Introduction

- **Decision-Making Benefits**: Six key areas explaining how the catalogue helps users make informed technology decisions
- **Complete Visibility**: Emphasizes comprehensive technology landscape overview
- **Data-Driven Insights**: Highlights metrics and performance data access
- **Risk Assessment**: Addresses security and compliance considerations
- **Strategic Alignment**: Business objective alignment through categorization
- **Cost Optimization**: TCO understanding and optimization opportunities
- **Future Planning**: Modernization pathways and lifecycle management

### Improved User Journey

- **Immediate Value**: Users understand catalogue benefits before diving into features
- **Clear Navigation**: Tab-based routing makes it obvious how to access different sections
- **Search Integration**: Prominent search in header encourages exploration
- **Direct CTAs**: "Browse Catalogue" and "Explore Taxonomy" buttons drive engagement

### Professional Enterprise Positioning

- **Strategic Focus**: Positions TechMod as essential for modernization governance
- **Business Language**: Uses enterprise terminology and business-focused benefits
- **Trust Building**: Professional design with clear value propositions
- **Comprehensive Coverage**: Addresses full spectrum of technology decision-making needs

This evolved design creates a professional, enterprise-focused homepage that positions TechMod as the leading Strategic Product Management platform for modernization initiatives. The design leverages the existing component library and design system while creating a compelling user experience that drives conversion and engagement through better navigation and clear catalogue value communication.

## Design Document Maintenance

**IMPORTANT**: This design document should be kept synchronized with the actual implementation at all times.

### Change Management Process

1. **Implementation Changes**: When making changes to the homepage implementation, immediately update this design document
2. **Design Revisions**: When updating this design document, ensure the implementation reflects the changes
3. **Version Control**: Both the design document and implementation should be committed together
4. **Review Process**: All design changes should include both code and documentation updates

### Current Implementation Status

- ✅ **Global Banner**: Moved to layout for persistence across all routes with TechMod branding, search, and single CTA
- ✅ **Navigation Tabs**: Implemented in layout with desktop tabs, mobile sheet navigation, and dynamic active states
- ✅ **Introduction Section**: Implemented on homepage with six decision-making benefits and CTAs
- ✅ **Route-Aware Navigation**: Active states update automatically based on current route
- ✅ **Comprehensive Test Coverage**: Unit, integration, and E2E tests for all navigation functionality
- 🔄 **Authentication**: Single "Get Started" button (SSO planned for future implementation)
- 📋 **Remaining Sections**: Hero, Features, Social Proof, and Footer sections from design pending implementation

## Testing Strategy

### Unit Tests (`vitest`)

#### Layout Navigation Tests (`src/routes/layout.test.ts`)

- **Banner Header**: Brand rendering, search functionality, button presence
- **Desktop Navigation**: Link rendering, href attributes, active state management
- **Mobile Navigation**: Menu trigger, sheet functionality, responsive behavior
- **Active Route Detection**: Correct identification of current page
- **Responsive Design**: Mobile/desktop class verification
- **Accessibility**: Semantic structure and button labels

#### Homepage Content Tests (`src/routes/page.svelte.spec.ts`)

- **Introduction Section**: Heading, description, and benefit cards
- **Decision-Making Benefits**: All six cards with proper descriptions
- **Call-to-Action**: CTA section and button links
- **Semantic Structure**: Proper HTML structure and metadata
- **Responsive Layout**: Grid layout and responsive classes

#### Active State Logic Tests (`src/lib/utils/navigation.test.ts`)

- **Route Matching**: Home route exact matching vs. startsWith behavior
- **Product Routes**: Nested route detection and edge cases
- **All Navigation Routes**: Comprehensive route detection testing
- **Edge Cases**: Empty paths, query parameters, hash fragments, trailing slashes
- **Documented Limitations**: Known issues with current startsWith approach

### Integration Tests (`playwright`)

#### Navigation E2E Tests (`e2e/navigation.test.ts`)

- **Banner Persistence**: Consistent branding across all routes
- **Search Functionality**: Input behavior and responsiveness
- **Route Navigation**: Click-through testing for all navigation links
- **Active States**: Visual verification of active tab highlighting
- **Mobile Navigation**: Hamburger menu, sheet opening/closing, mobile navigation
- **Navigation Persistence**: Sticky behavior and scroll position
- **Accessibility**: ARIA labels, keyboard navigation, color contrast
- **Performance**: Load times and layout shift prevention

### Test Coverage Areas

#### ✅ **Covered Functionality**

- Global layout rendering and persistence
- All navigation routes and links
- Active state management logic
- Desktop and mobile responsive behavior
- Route detection and highlighting
- User interaction flows
- Accessibility basics

#### 🔄 **Testing Improvements Needed**

- Visual regression testing for active states
- Cross-browser compatibility testing
- Screen reader compatibility
- Touch interaction testing on mobile
- Search functionality integration
- Theme toggle functionality

### Running Tests

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# All tests
npm run test

# Specific test suites
npm run test:unit -- --run src/routes/layout.test.ts
npm run test:unit -- --run src/lib/utils/navigation.test.ts
npm run test:e2e -- navigation.test.ts
```

### Test Maintenance

- **Sync with Implementation**: Tests updated alongside any navigation changes
- **Mock Management**: Proper mocking of SvelteKit stores and Lucide icons
- **Edge Case Documentation**: Known limitations and potential improvements documented
- **Performance Benchmarks**: Load time expectations and layout shift prevention

### Last Updated

- **Date**: 2024-01-04
- **Changes**: Added comprehensive test coverage for all navigation functionality
- **Implementation Status**: Global navigation fully implemented and tested with unit, integration, and E2E coverage
