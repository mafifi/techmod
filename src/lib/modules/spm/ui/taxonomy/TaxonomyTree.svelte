<script lang="ts">
import { Button } from '$lib/ui/components/button';
import { Badge } from '$lib/ui/components/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/ui/components/dropdown-menu';
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
import type { TaxonomyNode, TaxonomyNodeType } from '../../domain/TaxonomyNodeDTO';
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

interface TaxonomyHierarchyNode extends TaxonomyNode {
	children: TaxonomyHierarchyNode[];
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
let draggedNode: TaxonomyHierarchyNode | null = null;
let dropTarget: TaxonomyHierarchyNode | null = null;
let dragOverTarget: TaxonomyHierarchyNode | null = null;

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

function isAncestor(ancestor: TaxonomyHierarchyNode, descendant: TaxonomyHierarchyNode): boolean {
	let current = descendant.parentId;
	while (current) {
		if (current === ancestor._id) return true;
		// This would require walking up the tree, simplified for now
		break;
	}
	return false;
}

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
	dropTarget = null;
	dragOverTarget = null;
}

function handleDragEnd() {
	draggedNode = null;
	dropTarget = null;
	dragOverTarget = null;
}
</script>

<div class="taxonomy-tree" role="tree">
	{#each nodes as node}
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
		>
			<!-- Node content -->
			<div 
				class={cn(
					"group flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors",
					"border border-transparent",
					!node.isActive && "opacity-60",
					isBeingDraggedOver && canAcceptDrop && "border-primary bg-primary/5",
					depth > 0 && "ml-6"
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
					class="h-6 w-6 p-0 shrink-0"
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
				<div class="flex items-center gap-2 shrink-0">
					<Icon class="h-4 w-4 text-muted-foreground" />
					<Badge 
						variant="outline" 
						class={cn(
							"text-xs py-0 px-2 h-5",
							info.color,
							info.darkColor
						)}
					>
						{info.label}
					</Badge>
				</div>

				<!-- Node details -->
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h3 class={cn(
							"font-medium text-sm truncate",
							node.isActive ? "text-foreground" : "text-muted-foreground"
						)}>
							{node.name}
						</h3>
						{#if !node.isActive}
							<EyeOff class="h-3 w-3 text-muted-foreground shrink-0" />
						{/if}
						{#if hasChildren}
							<Badge variant="secondary" class="text-xs h-4 px-1">
								{node.children.length}
							</Badge>
						{/if}
					</div>
					
					{#if node.description}
						<p class="text-xs text-muted-foreground truncate mt-1">
							{node.description}
						</p>
					{/if}
				</div>

				<!-- Metadata -->
				<div class="hidden md:flex items-center gap-2 text-xs text-muted-foreground shrink-0">
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
							class="h-6 w-6 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
						>
							<MoreHorizontal class="h-4 w-4" />
							<span class="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" class="w-48">
						<DropdownMenuItem onclick={() => onEdit(node)}>
							<Edit class="h-4 w-4 mr-2" />
							Edit {info.label}
						</DropdownMenuItem>
						
						{#if info.childType}
							<DropdownMenuItem onclick={() => onCreateChild(info.childType!, node._id as Id<'taxonomyNodes'>)}>
								<Plus class="h-4 w-4 mr-2" />
								Add {info.childLabel}
							</DropdownMenuItem>
						{/if}
						
						{#if onMove && node.type !== 'portfolio'}
							<DropdownMenuItem>
								<Move class="h-4 w-4 mr-2" />
								Move Node
							</DropdownMenuItem>
						{/if}
						
						<DropdownMenuSeparator />
						
						{#if node.isActive}
							<DropdownMenuItem class="text-orange-600">
								<EyeOff class="h-4 w-4 mr-2" />
								Deactivate
							</DropdownMenuItem>
						{:else}
							<DropdownMenuItem class="text-green-600">
								<Eye class="h-4 w-4 mr-2" />
								Reactivate
							</DropdownMenuItem>
						{/if}
						
						<DropdownMenuSeparator />
						
						<DropdownMenuItem 
							class="text-red-600"
							onclick={() => onDelete(node)}
						>
							<Trash2 class="h-4 w-4 mr-2" />
							Delete {info.label}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<!-- Children -->
			{#if hasChildren && isExpanded}
				<div class="ml-2">
					<svelte:self
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
	font-family: system-ui, -apple-system, sans-serif;
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