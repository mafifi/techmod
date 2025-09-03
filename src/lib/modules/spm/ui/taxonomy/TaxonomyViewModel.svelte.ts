import { useQuery, useConvexClient } from 'convex-svelte';
import { SvelteSet } from 'svelte/reactivity';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import type {
	TaxonomyNodeProps,
	TaxonomyNodeType,
	TaxonomyHierarchyNode
} from '../../domain/TaxonomyNodeDTO';

interface TaxonomyViewModelState {
	searchTerm: string;
	selectedType: TaxonomyNodeType | 'all';
	activeOnly: boolean;
	expandedNodes: SvelteSet<string>;
}

export class TaxonomyViewModel {
	private _state = $state<TaxonomyViewModelState>({
		searchTerm: '',
		selectedType: 'all',
		activeOnly: true,
		expandedNodes: new SvelteSet()
	});

	// Convex client for mutations
	private client = useConvexClient();

	// Queries
	private hierarchyQuery = useQuery(api.spm.taxonomyNode.query.getFullHierarchy, () => ({
		activeOnly: this._state.activeOnly
	}));

	// Computed properties required by MVVM pattern
	get isLoading(): boolean {
		return this.hierarchyQuery.isLoading;
	}

	get error(): string | null {
		return this.hierarchyQuery.error?.message ?? null;
	}

	get data(): TaxonomyHierarchyNode[] {
		const rawData = this.hierarchyQuery.data;
		if (!rawData) return [];

		// Apply filtering
		// Convex generated types may include Id<'...'> | undefined for parentId; cast to our UI hierarchy type
		const uiData = rawData as unknown as TaxonomyHierarchyNode[];
		return this.filterHierarchy(uiData);
	}

	// State accessors
	get searchTerm(): string {
		return this._state.searchTerm;
	}

	set searchTerm(value: string) {
		this._state.searchTerm = value;
	}

	get selectedType(): TaxonomyNodeType | 'all' {
		return this._state.selectedType;
	}

	set selectedType(value: TaxonomyNodeType | 'all') {
		this._state.selectedType = value;
	}

	get activeOnly(): boolean {
		return this._state.activeOnly;
	}

	set activeOnly(value: boolean) {
		this._state.activeOnly = value;
	}

	get expandedNodes(): SvelteSet<string> {
		return this._state.expandedNodes;
	}

	// Node expansion methods
	toggleNodeExpansion(nodeId: string): void {
		if (this._state.expandedNodes.has(nodeId)) {
			this._state.expandedNodes.delete(nodeId);
		} else {
			this._state.expandedNodes.add(nodeId);
		}
	}

	expandNode(nodeId: string): void {
		this._state.expandedNodes.add(nodeId);
	}

	collapseNode(nodeId: string): void {
		this._state.expandedNodes.delete(nodeId);
	}

	expandAll(): void {
		const allNodeIds = this.getAllNodeIds(this.data);
		this._state.expandedNodes = new SvelteSet(allNodeIds);
	}

	collapseAll(): void {
		this._state.expandedNodes = new SvelteSet();
	}

	isNodeExpanded(nodeId: string): boolean {
		return this._state.expandedNodes.has(nodeId);
	}

	// CRUD operations
	async createNode(nodeData: TaxonomyNodeProps): Promise<Id<'taxonomyNodes'> | null> {
		try {
			const result = await this.client.mutation(api.spm.taxonomyNode.mutations.create, nodeData);
			return result;
		} catch (error) {
			console.error('Error creating taxonomy node:', error);
			throw error;
		}
	}

	async updateNode(
		nodeId: Id<'taxonomyNodes'>,
		updates: Partial<TaxonomyNodeProps>,
		updatedBy: string,
		reason?: string
	): Promise<boolean> {
		try {
			await this.client.mutation(api.spm.taxonomyNode.mutations.update, {
				nodeId,
				updates,
				updatedBy,
				reason
			});
			return true;
		} catch (error) {
			console.error('Error updating taxonomy node:', error);
			throw error;
		}
	}

	async deleteNode(
		nodeId: Id<'taxonomyNodes'>,
		updatedBy: string,
		forceDelete: boolean = false
	): Promise<boolean> {
		try {
			await this.client.mutation(api.spm.taxonomyNode.mutations.deleteNode, {
				nodeId,
				updatedBy,
				forceDelete
			});
			return true;
		} catch (error) {
			console.error('Error deleting taxonomy node:', error);
			throw error;
		}
	}

	async deactivateNode(
		nodeId: Id<'taxonomyNodes'>,
		updatedBy: string,
		cascadeToChildren: boolean = false,
		reason?: string
	): Promise<boolean> {
		try {
			await this.client.mutation(api.spm.taxonomyNode.mutations.deactivate, {
				nodeId,
				updatedBy,
				cascadeToChildren,
				reason
			});
			return true;
		} catch (error) {
			console.error('Error deactivating taxonomy node:', error);
			throw error;
		}
	}

	async reactivateNode(
		nodeId: Id<'taxonomyNodes'>,
		updatedBy: string,
		reason?: string
	): Promise<boolean> {
		try {
			await this.client.mutation(api.spm.taxonomyNode.mutations.reactivate, {
				nodeId,
				updatedBy,
				reason
			});
			return true;
		} catch (error) {
			console.error('Error reactivating taxonomy node:', error);
			throw error;
		}
	}

	async moveNode(
		nodeId: Id<'taxonomyNodes'>,
		newParentId: Id<'taxonomyNodes'> | null,
		updatedBy: string,
		reason?: string
	): Promise<boolean> {
		try {
			await this.client.mutation(api.spm.taxonomyNode.mutations.moveNode, {
				nodeId,
				newParentId,
				updatedBy,
				reason
			});
			return true;
		} catch (error) {
			console.error('Error moving taxonomy node:', error);
			throw error;
		}
	}

	// Helper methods
	private filterHierarchy(nodes: TaxonomyHierarchyNode[]): TaxonomyHierarchyNode[] {
		return nodes
			.map((node) => this.filterNode(node))
			.filter((node): node is TaxonomyHierarchyNode => node !== null);
	}

	private filterNode(node: TaxonomyHierarchyNode): TaxonomyHierarchyNode | null {
		// Apply type filter
		if (this._state.selectedType !== 'all' && node.type !== this._state.selectedType) {
			// Check if any children match the filter
			const filteredChildren = node.children
				.map((child) => this.filterNode(child))
				.filter((child): child is TaxonomyHierarchyNode => child !== null);

			if (filteredChildren.length === 0) {
				return null;
			}

			return { ...node, children: filteredChildren };
		}

		// Apply search filter
		const matchesSearch =
			this._state.searchTerm === '' ||
			node.name.toLowerCase().includes(this._state.searchTerm.toLowerCase()) ||
			node.description.toLowerCase().includes(this._state.searchTerm.toLowerCase());

		// Filter children recursively
		const filteredChildren = node.children
			.map((child) => this.filterNode(child))
			.filter((child): child is TaxonomyHierarchyNode => child !== null);

		// Include node if it matches search or has matching children
		if (matchesSearch || filteredChildren.length > 0) {
			return { ...node, children: filteredChildren };
		}

		return null;
	}

	private getAllNodeIds(nodes: TaxonomyHierarchyNode[]): string[] {
		const ids: string[] = [];

		function collectIds(node: TaxonomyHierarchyNode) {
			ids.push(node._id);
			node.children?.forEach(collectIds);
		}

		nodes.forEach(collectIds);
		return ids;
	}

	// Utility methods for getting valid parent options
	getValidParentOptions(
		nodeType: TaxonomyNodeType,
		excludeNodeId?: string
	): TaxonomyHierarchyNode[] {
		// Cast convex-generated result to our UI hierarchy node type to avoid type-name collisions
		const allNodes = (this.hierarchyQuery.data || []) as unknown as TaxonomyHierarchyNode[];

		switch (nodeType) {
			case 'portfolio':
				// Portfolios cannot have parents
				return [];
			case 'line':
				// Lines can only have portfolio parents
				return this.flattenNodes(allNodes).filter(
					(node) => node.type === 'portfolio' && node.isActive && node._id !== excludeNodeId
				);
			case 'category':
				// Categories can only have line parents
				return this.flattenNodes(allNodes).filter(
					(node) => node.type === 'line' && node.isActive && node._id !== excludeNodeId
				);
			default:
				return [];
		}
	}

	private flattenNodes(nodes: TaxonomyHierarchyNode[]): TaxonomyHierarchyNode[] {
		const flattened: TaxonomyHierarchyNode[] = [];

		function flatten(node: TaxonomyHierarchyNode) {
			flattened.push(node);
			node.children.forEach(flatten);
		}

		nodes.forEach(flatten);
		return flattened;
	}

	// Get node by ID from hierarchy
	getNodeById(nodeId: string): TaxonomyHierarchyNode | null {
		const allNodes = this.flattenNodes(this.data);
		return allNodes.find((node) => node._id === nodeId) || null;
	}

	// Get breadcrumb path for a node
	getBreadcrumbPath(nodeId: string): TaxonomyHierarchyNode[] {
		const path: TaxonomyHierarchyNode[] = [];
		const node = this.getNodeById(nodeId);

		if (!node) return path;

		let current: TaxonomyHierarchyNode | null = node;
		while (current) {
			path.unshift(current);
			current = current.parentId ? this.getNodeById(current.parentId) : null;
		}

		return path;
	}
}
