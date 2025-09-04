<script lang="ts">
	import { Button } from '$lib/ui/components/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/ui/components/dialog';
	import { Badge } from '$lib/ui/components/badge';
	import { Alert, AlertDescription } from '$lib/ui/components/alert';
	import { Separator } from '$lib/ui/components/separator';
	import { Checkbox } from '$lib/ui/components/checkbox';
	import { Label } from '$lib/ui/components/label';
	import type { TaxonomyNode } from '../../domain/TaxonomyNodeDTO';
	import { Folder, Package, Tag, AlertTriangle, Trash2, Users, Calendar } from 'lucide-svelte';

	// Props
	interface Props {
		node: TaxonomyNode;
		onSubmit: (forceDelete: boolean) => Promise<void>;
		onCancel: () => void;
	}

	let { node, onSubmit, onCancel }: Props = $props();

	// Type information
	const typeInfo = {
		portfolio: {
			icon: Folder,
			color: 'bg-blue-100 text-blue-800 border-blue-200',
			darkColor: 'dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
			label: 'Portfolio',
			childLabel: 'product lines'
		},
		line: {
			icon: Package,
			color: 'bg-green-100 text-green-800 border-green-200',
			darkColor: 'dark:bg-green-900 dark:text-green-200 dark:border-green-800',
			label: 'Product Line',
			childLabel: 'categories'
		},
		category: {
			icon: Tag,
			color: 'bg-purple-100 text-purple-800 border-purple-200',
			darkColor: 'dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800',
			label: 'Category',
			childLabel: null
		}
	};

	// Local state
	let forceDelete = $state(false);
	let isSubmitting = $state(false);

	// Get node information
	const info = typeInfo[node.type];
	const Icon = info.icon;

	// Mock child count (in real implementation, this would come from the ViewModel)
	const childCount = 0; // This should be passed as a prop or computed

	// Form handlers
	async function handleDelete() {
		isSubmitting = true;

		try {
			await onSubmit(forceDelete);
		} catch (_error) {
			console.error('Error deleting taxonomy node', _error);
			// Error handling is done in parent component
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		onCancel();
	}

	// Helper functions
	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	// Determine deletion impact
	const hasChildren = childCount > 0;
	const deletionType = hasChildren ? 'CASCADE' : 'SIMPLE';
</script>

<Dialog open={true}>
	<DialogContent class="sm:max-w-lg">
		<DialogHeader>
			<DialogTitle class="flex items-center gap-3 text-red-600">
				<Trash2 class="h-5 w-5" />
				Delete {info.label}
			</DialogTitle>
			<DialogDescription>
				This action cannot be undone. Please confirm you want to delete this {info.label.toLowerCase()}.
			</DialogDescription>
		</DialogHeader>

		<div class="grid gap-4 py-4">
			<!-- Node Information -->
			<div class="rounded-lg border bg-muted/50 p-4">
				<div class="flex items-start gap-3">
					<div class="flex shrink-0 items-center gap-2">
						<Icon class="h-4 w-4" />
						<Badge variant="outline" class={`${info.color} ${info.darkColor}`}>
							{info.label}
						</Badge>
					</div>
					<div class="min-w-0 flex-1">
						<h3 class="text-sm font-medium">{node.name}</h3>
						<p class="mt-1 text-xs text-muted-foreground">{node.description}</p>
					</div>
				</div>

				<Separator class="my-3" />

				<div class="grid grid-cols-2 gap-4 text-xs">
					<div class="flex items-center gap-2">
						<Users class="h-3 w-3 text-muted-foreground" />
						<span class="text-muted-foreground">Created by:</span>
						<span class="font-medium">{node.createdBy}</span>
					</div>
					<div class="flex items-center gap-2">
						<Calendar class="h-3 w-3 text-muted-foreground" />
						<span class="text-muted-foreground">Created:</span>
						<span class="font-medium">{formatDate(node._creationTime || Date.now())}</span>
					</div>
					<div class="flex items-center gap-2">
						<Users class="h-3 w-3 text-muted-foreground" />
						<span class="text-muted-foreground">Updated by:</span>
						<span class="font-medium">{node.updatedBy}</span>
					</div>
					<div class="flex items-center gap-2">
						<Calendar class="h-3 w-3 text-muted-foreground" />
						<span class="text-muted-foreground">Modified:</span>
						<span class="font-medium">{formatDate(node.lastModified)}</span>
					</div>
				</div>
			</div>

			<!-- Warning Messages -->
			{#if hasChildren}
				<Alert variant="destructive">
					<AlertTriangle class="h-4 w-4" />
					<AlertDescription>
						<strong>Warning:</strong> This {info.label.toLowerCase()} contains {childCount}
						{info.childLabel}. Deleting it will also delete all its child nodes.
					</AlertDescription>
				</Alert>

				<div class="space-y-3">
					<div class="flex items-center space-x-2">
						<Checkbox id="force-delete" bind:checked={forceDelete} />
						<Label for="force-delete" class="text-sm leading-relaxed">
							I understand that deleting this {info.label.toLowerCase()} will permanently remove all
							{childCount}
							{info.childLabel} and any data associated with them.
						</Label>
					</div>
				</div>
			{:else}
				<Alert>
					<AlertTriangle class="h-4 w-4" />
					<AlertDescription>
						This {info.label.toLowerCase()} will be permanently deleted. This action cannot be undone.
					</AlertDescription>
				</Alert>
			{/if}

			<!-- Additional Information -->
			<div class="space-y-2 text-xs text-muted-foreground">
				<div class="flex items-center gap-2">
					<span class="font-medium">Deletion Type:</span>
					<Badge variant={deletionType === 'CASCADE' ? 'destructive' : 'secondary'} class="text-xs">
						{deletionType === 'CASCADE' ? 'Cascade Delete' : 'Simple Delete'}
					</Badge>
				</div>

				{#if deletionType === 'CASCADE'}
					<p class="text-red-600">
						All child nodes will be permanently deleted as they cannot exist without a parent.
					</p>
				{/if}

				<p>
					<strong>Version:</strong>
					{node.version} |
					<strong>Status:</strong>
					{node.isActive ? 'Active' : 'Inactive'}
				</p>
			</div>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={handleCancel} disabled={isSubmitting}>Cancel</Button>
			<Button
				variant="destructive"
				onclick={handleDelete}
				disabled={isSubmitting || (hasChildren && !forceDelete)}
			>
				{#if isSubmitting}
					Deleting...
				{:else if hasChildren}
					Delete {info.label} & {childCount} Children
				{:else}
					Delete {info.label}
				{/if}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<style>
	/* Ensure proper spacing and styling for the dialog */
	:global(.space-y-2 > * + *) {
		margin-top: 0.5rem;
	}

	:global(.space-y-3 > * + *) {
		margin-top: 0.75rem;
	}

	:global(.grid-cols-2) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	/* Custom styling for destructive alerts */
	:global([data-variant='destructive']) {
		border-color: hsl(var(--destructive));
		background-color: hsl(var(--destructive) / 0.1);
	}

	:global([data-variant='destructive'] svg) {
		color: hsl(var(--destructive));
	}
</style>
