<script lang="ts">
	import { TaxonomyViewModel } from './TaxonomyViewModel.svelte';
	import TaxonomyTree from './TaxonomyTree.svelte';
	import TaxonomyNodeDialog from './TaxonomyNodeDialog.svelte';
	import DeleteTaxonomyNodeDialog from './DeleteTaxonomyNodeDialog.svelte';
	import { Button } from '$lib/ui/components/button';
	import { Input } from '$lib/ui/components/input';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/ui/components/select';
	import { Switch } from '$lib/ui/components/switch';
	import { Label } from '$lib/ui/components/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/ui/components/card';
	import { Badge } from '$lib/ui/components/badge';
	// ...existing code...
	import { Alert, AlertDescription } from '$lib/ui/components/alert';
	import { Skeleton } from '$lib/ui/components/skeleton';
	import { toast } from 'svelte-sonner';
	import { Plus, Search, Filter, Expand, ChevronUp, FolderTree } from '@lucide/svelte';
	import type {
		TaxonomyNode,
		TaxonomyNodeType,
		TaxonomyNodeProps,
		TaxonomyHierarchyNode
	} from '../../domain/TaxonomyNodeDTO';
	import type { Id } from '../../../../../convex/_generated/dataModel';

	// Props
	interface Props {
		viewModel: TaxonomyViewModel;
		currentUserId: string;
	}

	let { viewModel, currentUserId }: Props = $props();

	// Local state for dialogs
	let showCreateDialog = $state(false);
	let showEditDialog = $state(false);
	let showDeleteDialog = $state(false);
	let selectedNode = $state<TaxonomyNode | null>(null);
	let createNodeType = $state<TaxonomyNodeType>('portfolio');
	let createParentId = $state<Id<'taxonomyNodes'> | null>(null);

	// Dialog handlers
	function handleCreateNode(type: TaxonomyNodeType, parentId: Id<'taxonomyNodes'> | null = null) {
		createNodeType = type;
		createParentId = parentId;
		showCreateDialog = true;
	}

	function handleEditNode(node: TaxonomyNode) {
		selectedNode = node;
		showEditDialog = true;
	}

	function handleDeleteNode(node: TaxonomyNode) {
		selectedNode = node;
		showDeleteDialog = true;
	}

	function handleMoveNode(nodeId: Id<'taxonomyNodes'>, newParentId: Id<'taxonomyNodes'> | null) {
		viewModel
			.moveNode(nodeId, newParentId, currentUserId, 'Node moved via drag and drop')
			.then(() => {
				toast.success('Node moved successfully');
			})
			.catch((error) => {
				toast.error('Failed to move node: ' + error.message);
			});
	}

	// Create dialog handlers
	async function handleCreateSubmit(nodeData: Partial<TaxonomyNodeProps>) {
		try {
			const result = await viewModel.createNode({
				...(nodeData as TaxonomyNodeProps),
				type: createNodeType,
				parentId: createParentId,
				createdBy: currentUserId,
				updatedBy: currentUserId
			});

			if (result) {
				toast.success(`${createNodeType} created successfully`);
				showCreateDialog = false;
			}
		} catch (error: unknown) {
			toast.error('Failed to create node: ' + ((error as Error).message ?? String(error)));
		}
	}

	// Edit dialog handlers
	async function handleEditSubmit(updates: Partial<TaxonomyNodeProps>) {
		if (!selectedNode) return;

		try {
			await viewModel.updateNode(
				selectedNode._id as Id<'taxonomyNodes'>,
				updates,
				currentUserId,
				'Updated via UI'
			);
			toast.success('Node updated successfully');
			showEditDialog = false;
			selectedNode = null;
		} catch (error: unknown) {
			toast.error('Failed to update node: ' + ((error as Error).message ?? String(error)));
		}
	}

	// Delete dialog handlers
	async function handleDeleteSubmit(forceDelete: boolean) {
		if (!selectedNode) return;

		try {
			await viewModel.deleteNode(
				selectedNode._id as Id<'taxonomyNodes'>,
				currentUserId,
				forceDelete
			);
			toast.success('Node deleted successfully');
			showDeleteDialog = false;
			selectedNode = null;
		} catch (error: unknown) {
			toast.error('Failed to delete node: ' + ((error as Error).message ?? String(error)));
		}
	}

	// Close dialogs
	function closeDialogs() {
		showCreateDialog = false;
		showEditDialog = false;
		showDeleteDialog = false;
		selectedNode = null;
	}

	// Get node count by type
	function getNodeCounts() {
		const allNodes = viewModel.data.flat();
		const counts = {
			portfolio: 0,
			line: 0,
			category: 0,
			total: 0
		};

		function countNodes(nodes: TaxonomyHierarchyNode[]) {
			for (const node of nodes) {
				counts[node.type as keyof typeof counts]++;
				counts.total++;
				if (node.children?.length > 0) {
					countNodes(node.children);
				}
			}
		}

		countNodes(allNodes);
		return counts;
	}

	$effect(() => {
		// Auto-expand first level when data loads
		if (viewModel.data.length > 0 && viewModel.expandedNodes.size === 0) {
			viewModel.data.forEach((node) => viewModel.expandNode(node._id));
		}
	});
</script>

<div class="taxonomy-management flex h-full flex-col bg-background">
	<!-- Header -->
	<div class="border-b bg-card">
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<FolderTree class="h-6 w-6 text-primary" />
					<div>
						<h1 class="text-2xl font-bold text-foreground">Taxonomy Management</h1>
						<p class="text-sm text-muted-foreground">
							Manage portfolios, product lines, and categories
						</p>
					</div>
				</div>

				{#if !viewModel.isLoading}
					{@const counts = getNodeCounts()}
					<div class="flex items-center gap-2">
						<Badge variant="secondary">{counts.portfolio} Portfolios</Badge>
						<Badge variant="secondary">{counts.line} Lines</Badge>
						<Badge variant="secondary">{counts.category} Categories</Badge>
						<Badge variant="outline">Total: {counts.total}</Badge>
					</div>
				{/if}
			</div>

			<!-- Controls -->
			<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<!-- Search and filters -->
				<div class="flex flex-wrap items-center gap-3">
					<div class="relative">
						<Search
							class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
						/>
						<Input
							bind:value={viewModel.searchTerm}
							placeholder="Search taxonomy..."
							class="w-64 pl-10"
						/>
					</div>

					<Select type="single" bind:value={viewModel.selectedType}>
						<SelectTrigger class="w-32">
							<Filter class="mr-2 h-4 w-4" />
							{viewModel.selectedType === 'all'
								? 'All Types'
								: viewModel.selectedType === 'portfolio'
									? 'Portfolios'
									: viewModel.selectedType === 'line'
										? 'Lines'
										: 'Categories'}
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Types</SelectItem>
							<SelectItem value="portfolio">Portfolios</SelectItem>
							<SelectItem value="line">Lines</SelectItem>
							<SelectItem value="category">Categories</SelectItem>
						</SelectContent>
					</Select>

					<div class="flex items-center space-x-2">
						<Switch bind:checked={viewModel.activeOnly} id="active-only" />
						<Label for="active-only" class="text-sm">Active only</Label>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-2">
					<Button variant="outline" size="sm" onclick={() => viewModel.expandAll()}>
						<Expand class="mr-1 h-4 w-4" />
						Expand All
					</Button>
					<Button variant="outline" size="sm" onclick={() => viewModel.collapseAll()}>
						<ChevronUp class="mr-1 h-4 w-4" />
						Collapse All
					</Button>
					<Button size="sm" onclick={() => handleCreateNode('portfolio')}>
						<Plus class="mr-1 h-4 w-4" />
						Add Portfolio
					</Button>
				</div>
			</div>
		</div>
	</div>

	<!-- Main content -->
	<div class="flex-1 overflow-hidden">
		<div class="h-full p-6">
			<Card class="h-full">
				<CardHeader class="pb-4">
					<CardTitle class="text-lg">Taxonomy Tree</CardTitle>
					<CardDescription>
						Hierarchical view of your taxonomy structure. Click nodes to expand/collapse,
						right-click for context menu, or drag to reorganize.
					</CardDescription>
				</CardHeader>
				<CardContent class="h-full overflow-hidden pt-0">
					<!-- Loading State -->
					{#if viewModel.isLoading}
						<div class="space-y-3">
							{#each Array.from({ length: 5 }).map((_, idx) => idx) as i (i)}
								<div class="flex items-center space-x-2">
									<Skeleton class="h-4 w-4" />
									<Skeleton class="h-4 w-48" />
								</div>
							{/each}
						</div>

						<!-- Error State -->
					{:else if viewModel.error}
						<Alert variant="destructive">
							<AlertDescription>
								Failed to load taxonomy: {viewModel.error}
							</AlertDescription>
						</Alert>

						<!-- Empty State -->
					{:else if viewModel.data.length === 0}
						<div class="flex h-64 flex-col items-center justify-center text-center">
							<FolderTree class="mb-4 h-12 w-12 text-muted-foreground" />
							<h3 class="mb-2 text-lg font-medium text-foreground">No taxonomy nodes found</h3>
							<p class="mb-4 text-sm text-muted-foreground">
								{viewModel.searchTerm || viewModel.selectedType !== 'all'
									? 'No nodes match your current filters. Try adjusting your search or filters.'
									: 'Get started by creating your first portfolio.'}
							</p>
							{#if !viewModel.searchTerm && viewModel.selectedType === 'all'}
								<Button onclick={() => handleCreateNode('portfolio')}>
									<Plus class="mr-2 h-4 w-4" />
									Create Portfolio
								</Button>
							{/if}
						</div>

						<!-- Tree View -->
					{:else}
						<div class="h-full overflow-auto">
							<TaxonomyTree
								nodes={viewModel.data}
								expandedNodes={viewModel.expandedNodes}
								onToggleExpansion={(nodeId) => viewModel.toggleNodeExpansion(nodeId)}
								onCreateChild={handleCreateNode}
								onEdit={handleEditNode}
								onDelete={handleDeleteNode}
								onMove={handleMoveNode}
								{currentUserId}
							/>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>
</div>

<!-- Create Dialog -->
{#if showCreateDialog}
	<TaxonomyNodeDialog
		mode="create"
		nodeType={createNodeType}
		parentId={createParentId}
		validParentOptions={viewModel.getValidParentOptions(createNodeType)}
		onSubmit={handleCreateSubmit}
		onCancel={closeDialogs}
	/>
{/if}

<!-- Edit Dialog -->
{#if showEditDialog && selectedNode}
	<TaxonomyNodeDialog
		mode="edit"
		node={selectedNode}
		nodeType={selectedNode.type}
		validParentOptions={viewModel.getValidParentOptions(selectedNode.type, selectedNode._id)}
		onSubmit={handleEditSubmit}
		onCancel={closeDialogs}
	/>
{/if}

<!-- Delete Dialog -->
{#if showDeleteDialog && selectedNode}
	<DeleteTaxonomyNodeDialog
		node={selectedNode}
		onSubmit={handleDeleteSubmit}
		onCancel={closeDialogs}
	/>
{/if}

<style>
	.taxonomy-management {
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}
</style>
