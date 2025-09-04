<script lang="ts">
	import { Button } from '$lib/ui/components/button';
	import { Badge } from '$lib/ui/components/badge';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/ui/components/dropdown-menu';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/ui/components/tooltip';
	import {
		ChevronRight,
		ChevronDown,
		MoreHorizontal,
		Plus,
		Edit,
		Trash2,
		Move,
		Folder,
		Package,
		Tag,
		Eye,
		EyeOff,
		Calendar,
		User
	} from 'lucide-svelte';
	import Self from './TaxonomyTree.svelte';
	import type {
		TaxonomyNode,
		TaxonomyNodeType,
		TaxonomyHierarchyNode
	} from '../../domain/TaxonomyNodeDTO';
	import type { Id } from '../../../../../convex/_generated/dataModel';
	import { cn } from '$lib/ui/utils';

	// Props
	interface Props {
		nodes: TaxonomyHierarchyNode[];
		expandedNodes: Set<string>;
		onToggleExpansion: (nodeId: string) => void;
		onCreateChild: (type: TaxonomyNodeType, parentId?: Id<'taxonomyNodes'>) => void;
		onEdit: (node: TaxonomyNode) => void;
		onDelete: (node: TaxonomyNode) => void;
		onMove?: (nodeId: Id<'taxonomyNodes'>, newParentId: Id<'taxonomyNodes'> | null) => void;
		currentUserId: string;
		depth?: number;
	}

	let {
		nodes,
		expandedNodes,
		onToggleExpansion,
		onCreateChild,
		onEdit,
		onDelete,
		onMove,
		currentUserId,
		depth = 0
	}: Props = $props();

	// Type information
	const typeInfo = {
		portfolio: {
			icon: Folder,
			color: 'bg-blue-100 text-blue-800 border-blue-200',
			darkColor: 'dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
			label: 'Portfolio',
			childType: 'line' as TaxonomyNodeType,
			childLabel: 'Product Line'
		},
		line: {
			icon: Package,
			color: 'bg-green-100 text-green-800 border-green-200',
			darkColor: 'dark:bg-green-900 dark:text-green-200 dark:border-green-800',
			label: 'Product Line',
			childType: 'category' as TaxonomyNodeType,
			childLabel: 'Category'
		},
		category: {
			icon: Tag,
			color: 'bg-purple-100 text-purple-800 border-purple-200',
			darkColor: 'dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800',
			label: 'Category',
			childType: null,
			childLabel: null
		}
	};

	// Drag and drop state
	let draggedNode = $state<TaxonomyHierarchyNode | null>(null);
	let dragOverTarget = $state<TaxonomyHierarchyNode | null>(null);

	// Helper functions
	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function canDropOn(target: TaxonomyHierarchyNode, dragged: TaxonomyHierarchyNode): boolean {
		if (!onMove) return false;
		if (target._id === dragged._id) return false;

		// Check hierarchy rules
		switch (dragged.type) {
			case 'portfolio':
				// Portfolios cannot be moved
				return false;
			case 'line':
				// Lines can only be dropped on portfolios
				return target.type === 'portfolio';
			case 'category':
				// Categories can only be dropped on lines
				return target.type === 'line';
			default:
				return false;
		}
	}

	// (isAncestor removed — kept logic simple for now)

	// Drag handlers
	function handleDragStart(event: DragEvent, node: TaxonomyHierarchyNode) {
		if (!onMove) return;
		draggedNode = node;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', node._id);
		}
	}

	function handleDragOver(event: DragEvent, node: TaxonomyHierarchyNode) {
		if (!onMove || !draggedNode || !canDropOn(node, draggedNode)) return;

		event.preventDefault();
		dragOverTarget = node;
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDragLeave() {
		dragOverTarget = null;
	}

	function handleDrop(event: DragEvent, node: TaxonomyHierarchyNode) {
		if (!onMove || !draggedNode || !canDropOn(node, draggedNode)) return;

		event.preventDefault();

		const newParentId = node._id as Id<'taxonomyNodes'>;
		const nodeId = draggedNode._id as Id<'taxonomyNodes'>;

		onMove(nodeId, newParentId);

		// Reset drag state
		draggedNode = null;
		dragOverTarget = null;
	}

	function handleDragEnd() {
		draggedNode = null;
		dragOverTarget = null;
	}
</script>

<div class="taxonomy-tree" role="tree">
	{#each nodes as node (node._id)}
		{@const info = typeInfo[node.type]}
		{@const Icon = info.icon}
		{@const hasChildren = node.children && node.children.length > 0}
		{@const isExpanded = expandedNodes.has(node._id)}
		{@const isBeingDraggedOver = dragOverTarget?._id === node._id}
		{@const canAcceptDrop = draggedNode && canDropOn(node, draggedNode)}

		<div
			class="taxonomy-node"
			role="treeitem"
			aria-expanded={hasChildren ? isExpanded : undefined}
			aria-level={depth + 1}
			aria-selected={false}
		>
			<!-- Node content -->
			<div
				role="group"
				class={cn(
					'group flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-muted/50',
					'border border-transparent',
					!node.isActive && 'opacity-60',
					isBeingDraggedOver && canAcceptDrop && 'border-primary bg-primary/5',
					depth > 0 && 'ml-6'
				)}
				draggable={onMove && node.type !== 'portfolio'}
				ondragstart={(e) => handleDragStart(e, node)}
				ondragover={(e) => handleDragOver(e, node)}
				ondragleave={handleDragLeave}
				ondrop={(e) => handleDrop(e, node)}
				ondragend={handleDragEnd}
			>
				<!-- Expand/collapse button -->
				<Button
					variant="ghost"
					size="sm"
					class="h-6 w-6 shrink-0 p-0"
					onclick={() => hasChildren && onToggleExpansion(node._id)}
					disabled={!hasChildren}
				>
					{#if hasChildren}
						{#if isExpanded}
							<ChevronDown class="h-4 w-4" />
						{:else}
							<ChevronRight class="h-4 w-4" />
						{/if}
					{:else}
						<div class="h-4 w-4"></div>
					{/if}
				</Button>

				<!-- Node icon and type badge -->
				<div class="flex shrink-0 items-center gap-2">
					<Icon class="h-4 w-4 text-muted-foreground" />
					<Badge variant="outline" class={cn('h-5 px-2 py-0 text-xs', info.color, info.darkColor)}>
						{info.label}
					</Badge>
				</div>

				<!-- Node details -->
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<h3
							class={cn(
								'truncate text-sm font-medium',
								node.isActive ? 'text-foreground' : 'text-muted-foreground'
							)}
						>
							{node.name}
						</h3>
						{#if !node.isActive}
							<EyeOff class="h-3 w-3 shrink-0 text-muted-foreground" />
						{/if}
						{#if hasChildren}
							<Badge variant="secondary" class="h-4 px-1 text-xs">
								{node.children.length}
							</Badge>
						{/if}
					</div>

					{#if node.description}
						<p class="mt-1 truncate text-xs text-muted-foreground">
							{node.description}
						</p>
					{/if}
				</div>

				<!-- Metadata -->
				<div class="hidden shrink-0 items-center gap-2 text-xs text-muted-foreground md:flex">
					<Tooltip>
						<TooltipTrigger>
							<div class="flex items-center gap-1">
								<Calendar class="h-3 w-3" />
								{formatDate(node.lastModified)}
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<div class="text-xs">
								<div>Created: {formatDate(node._creationTime || 0)}</div>
								<div>Updated: {formatDate(node.lastModified)}</div>
								<div>Version: {node.version}</div>
							</div>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger>
							<div class="flex items-center gap-1">
								<User class="h-3 w-3" />
								{node.updatedBy}
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<div class="text-xs">
								<div>Created by: {node.createdBy}</div>
								<div>Updated by: {node.updatedBy}</div>
							</div>
						</TooltipContent>
					</Tooltip>
				</div>

				<!-- Actions menu -->
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button
							variant="ghost"
							size="sm"
							class="h-6 w-6 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<MoreHorizontal class="h-4 w-4" />
							<span class="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" class="w-48">
						<DropdownMenuItem onclick={() => onEdit(node)}>
							<Edit class="mr-2 h-4 w-4" />
							Edit {info.label}
						</DropdownMenuItem>

						{#if info.childType}
							<DropdownMenuItem
								onclick={() => onCreateChild(info.childType!, node._id as Id<'taxonomyNodes'>)}
							>
								<Plus class="mr-2 h-4 w-4" />
								Add {info.childLabel}
							</DropdownMenuItem>
						{/if}

						{#if onMove && node.type !== 'portfolio'}
							<DropdownMenuItem>
								<Move class="mr-2 h-4 w-4" />
								Move Node
							</DropdownMenuItem>
						{/if}

						<DropdownMenuSeparator />

						{#if node.isActive}
							<DropdownMenuItem class="text-orange-600">
								<EyeOff class="mr-2 h-4 w-4" />
								Deactivate
							</DropdownMenuItem>
						{:else}
							<DropdownMenuItem class="text-green-600">
								<Eye class="mr-2 h-4 w-4" />
								Reactivate
							</DropdownMenuItem>
						{/if}

						<DropdownMenuSeparator />

						<DropdownMenuItem class="text-red-600" onclick={() => onDelete(node)}>
							<Trash2 class="mr-2 h-4 w-4" />
							Delete {info.label}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<!-- Children -->
			{#if hasChildren && isExpanded}
				<div class="ml-2">
					<Self
						nodes={node.children}
						{expandedNodes}
						{onToggleExpansion}
						{onCreateChild}
						{onEdit}
						{onDelete}
						{onMove}
						{currentUserId}
						depth={depth + 1}
					/>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.taxonomy-tree {
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	.taxonomy-node {
		position: relative;
	}

	/* Drag and drop visual feedback */
	.taxonomy-node:global(.drag-over) {
		background-color: hsl(var(--primary) / 0.05);
		border-color: hsl(var(--primary));
	}
</style>
